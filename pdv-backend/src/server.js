import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from './db.js'

const app = express()
const PORT = process.env.PORT || 3333
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// ===== Middleware de autenticação (JWT) =====
function auth(required = true) {
  return async (req, res, next) => {
    const hdr = req.headers.authorization || ''
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null

    if (!token) {
      if (required) return res.status(401).json({ error: 'Unauthorized' })
      req.user = null
      return next()
    }

    try {
      req.user = jwt.verify(token, JWT_SECRET)
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

// ===== Healthcheck =====
app.get('/health', (_req, res) => res.json({ ok: true }))

// =========================================================
// ===================== LOGIN (USUÁRIOS) ==================
// =========================================================
app.post('/auth/login', async (req, res) => {
  const schema = z.object({
    code: z.string(),
    password: z.string(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body' })
  }

  const { code, password } = parsed.data

  try {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE login = $1 LIMIT 1',
      [code]
    )

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const usuario = result.rows[0]

    // Senha em texto puro (ajuste aqui se passar a usar hash/bcrypt)
    const senhaOk = usuario.senha === password
    if (!senhaOk) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const tokenPayload = {
      sub: usuario.id,
      name: usuario.login,
      role: usuario.permissao,
      cpf: usuario.cpf,
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' })

    return res.json({
      token,
      user: {
        id: usuario.id,
        name: usuario.login,
        role: usuario.permissao,
        cpf: usuario.cpf,
      },
    })
  } catch (err) {
    console.error('Erro no /auth/login:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// =========================================================
// ======================= CATÁLOGO ========================
// =========================================================
// Front chama: api.catalog(unitId: 1)
// Retorna: { categories, products, modifiers }
//
// ⚠️ Ajuste nomes de tabela/colunas p/ seu banco real
app.get('/catalog', auth(false), async (req, res) => {
  const unitId = Number(req.query.unitId || 1)

  try {
    const [catsRes, prodsRes, modsRes] = await Promise.all([
      db.query(
        'SELECT id, nome AS name FROM categorias WHERE unidade_id = $1 ORDER BY nome ASC',
        [unitId]
      ),
      db.query(
        `SELECT id,
                nome AS name,
                preco_centavos AS "priceCents",
                categoria_id AS "categoryId"
         FROM produtos
         WHERE unidade_id = $1
         ORDER BY nome ASC`,
        [unitId]
      ),
      db.query(
        `SELECT id,
                nome AS name,
                preco_centavos AS "priceCents"
         FROM modificadores
         WHERE unidade_id = $1
         ORDER BY nome ASC`,
        [unitId]
      ),
    ])

    return res.json({
      categories: catsRes.rows,
      products: prodsRes.rows,
      modifiers: modsRes.rows,
    })
  } catch (err) {
    console.error('Erro no /catalog:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// =========================================================
// ========================= MESAS =========================
// =========================================================
// Front chama: api.tables()
// Esperado: lista de mesas com { id, number, status }
//
// ⚠️ Ajuste p/ sua tabela real
app.get('/tables', auth(), async (_req, res) => {
  try {
    const result = await db.query(
      'SELECT id, numero AS number, status FROM mesas ORDER BY numero ASC'
    )
    return res.json(result.rows)
  } catch (err) {
    console.error('Erro no /tables:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// =========================================================
/* ========================= PEDIDOS =======================

Front (home_screen.dart) faz:

- GET orders(status: 'PENDING')  → tela COZINHA
- GET orders()                   → tela DELIVERY
- POST /orders                   → ao fechar pedido no BALCÃO
  payload = {
    channel: 'BALCAO',
    items: [
      { productId, quantity }
    ]
  }
- PATCH /orders/:id/status       → botão FINALIZAR na cozinha

Estrutura que o front espera de cada pedido:

{
  id,
  status,
  items: [
    {
      quantity,
      product: { name, ... }
    }
  ]
}

*/
// =========================================================

// GET /orders?status=PENDING
app.get('/orders', auth(), async (req, res) => {
  const status = req.query.status ? String(req.query.status) : null

  try {
    const ordersRes = await db.query(
      `
      SELECT o.id,
             o.canal        AS channel,
             o.status,
             o.nome_cliente AS "customerName",
             o.mesa_id      AS "tableId",
             o.total_centavos AS "totalCents",
             o.created_at   AS "createdAt"
      FROM pedidos o
      WHERE ($1::text IS NULL OR o.status = $1)
      ORDER BY o.created_at DESC
      `,
      [status]
    )

    const orders = ordersRes.rows
    if (orders.length === 0) return res.json([])

    const orderIds = orders.map(o => o.id)

    // Itens de todos os pedidos
    const itemsRes = await db.query(
      `
      SELECT i.id,
             i.pedido_id                 AS "orderId",
             i.produto_id                AS "productId",
             i.quantidade                AS quantity,
             i.preco_unitario_centavos   AS "unitPriceCents",
             i.observacao                AS note,
             p.nome                      AS "productName",
             p.preco_centavos            AS "productPriceCents"
      FROM itens_pedido i
      JOIN produtos p ON p.id = i.produto_id
      WHERE i.pedido_id = ANY($1::int[])
      ORDER BY i.id
      `,
      [orderIds]
    )

    const itemsByOrder = new Map()
    for (const row of itemsRes.rows) {
      const item = {
        id: row.id,
        productId: row.productId,
        quantity: row.quantity,
        unitPriceCents: row.unitPriceCents,
        note: row.note,
        product: {
          id: row.productId,
          name: row.productName,
          priceCents: row.productPriceCents,
        },
      }
      if (!itemsByOrder.has(row.orderId)) {
        itemsByOrder.set(row.orderId, [])
      }
      itemsByOrder.get(row.orderId).push(item)
    }

    // Pagamentos (opcional – hoje o front só usa items.length)
    const paymentsRes = await db.query(
      `
      SELECT id,
             pedido_id     AS "orderId",
             metodo        AS method,
             valor_centavos AS "amountCents",
             troco_centavos AS "changeCents"
      FROM pagamentos
      WHERE pedido_id = ANY($1::int[])
      `,
      [orderIds]
    )

    const paymentsByOrder = new Map()
    for (const row of paymentsRes.rows) {
      const payment = {
        id: row.id,
        method: row.method,
        amountCents: row.amountCents,
        changeCents: row.changeCents,
      }
      if (!paymentsByOrder.has(row.orderId)) {
        paymentsByOrder.set(row.orderId, [])
      }
      paymentsByOrder.get(row.orderId).push(payment)
    }

    const payload = orders.map(o => ({
      ...o,
      items: itemsByOrder.get(o.id) || [],
      payments: paymentsByOrder.get(o.id) || [],
    }))

    return res.json(payload)
  } catch (err) {
    console.error('Erro no GET /orders:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /orders
app.post('/orders', auth(), async (req, res) => {
  const schema = z.object({
    channel: z.string(),
    customerName: z.string().optional(),
    tableId: z.number().int().optional(),
    items: z.array(z.object({
      productId: z.number().int(),
      quantity: z.number().int().min(1),
      note: z.string().optional(),
    })),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const { channel, customerName, tableId, items } = parsed.data

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    let totalCents = 0
    const detailedItems = []

    // Valida produtos e calcula total
    for (const it of items) {
      const prodRes = await client.query(
        'SELECT id, nome, preco_centavos FROM produtos WHERE id = $1',
        [it.productId]
      )
      if (prodRes.rowCount === 0) {
        throw new Error(`Produto ${it.productId} não encontrado`)
      }
      const p = prodRes.rows[0]
      const lineTotal = p.preco_centavos * it.quantity
      totalCents += lineTotal

      detailedItems.push({
        productId: p.id,
        quantity: it.quantity,
        unitPriceCents: p.preco_centavos,
        note: it.note || null,
      })
    }

    // Cria pedido
    const orderRes = await client.query(
      `
      INSERT INTO pedidos (canal, status, nome_cliente, mesa_id, total_centavos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id,
                canal        AS channel,
                status,
                nome_cliente AS "customerName",
                mesa_id      AS "tableId",
                total_centavos AS "totalCents",
                created_at   AS "createdAt"
      `,
      [channel, 'PENDING', customerName || null, tableId || null, totalCents]
    )
    const order = orderRes.rows[0]

    // Cria itens
    const itemsInserted = []
    for (const it of detailedItems) {
      const ins = await client.query(
        `
        INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario_centavos, observacao)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id,
                  produto_id               AS "productId",
                  quantidade               AS quantity,
                  preco_unitario_centavos  AS "unitPriceCents",
                  observacao               AS note
        `,
        [order.id, it.productId, it.quantity, it.unitPriceCents, it.note]
      )

      const prodRes = await client.query(
        'SELECT nome, preco_centavos FROM produtos WHERE id = $1',
        [it.productId]
      )
      const p = prodRes.rows[0]

      itemsInserted.push({
        ...ins.rows[0],
        product: {
          id: it.productId,
          name: p.nome,
          priceCents: p.preco_centavos,
        },
      })
    }

    await client.query('COMMIT')

    const payload = {
      ...order,
      items: itemsInserted,
      payments: [],
    }

    return res.status(201).json(payload)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Erro no POST /orders:', err)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

// PATCH /orders/:id/status
app.patch('/orders/:id/status', auth(), async (req, res) => {
  const id = Number(req.params.id)
  const schema = z.object({ status: z.string() })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const { status } = parsed.data
  const allowed = ['PENDING', 'IN_KITCHEN', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  try {
    const updRes = await db.query(
      `
      UPDATE pedidos
      SET status = $1
      WHERE id = $2
      RETURNING id,
                canal        AS channel,
                status,
                nome_cliente AS "customerName",
                mesa_id      AS "tableId",
                total_centavos AS "totalCents",
                created_at   AS "createdAt"
      `,
      [status, id]
    )

    if (updRes.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json(updRes.rows[0])
  } catch (err) {
    console.error('Erro no PATCH /orders/:id/status:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ PDV API running on http://localhost:${PORT}`)
})
