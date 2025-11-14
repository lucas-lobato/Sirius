const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const axios = require('axios');
const moment = require('moment');
require('dotenv').config(); // 🔑 carrega as variáveis do .env

// === MODELO DE CONFIGURAÇÃO DO IFOOD ===
const IntegracaoIfood = sequelize.define('IntegracaoIfood', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ambiente: DataTypes.STRING,
  client_id: DataTypes.STRING,
  client_secret: DataTypes.STRING,
  merchant_id: DataTypes.STRING,
  merchant_uuid: DataTypes.STRING,
  redirect_uri: DataTypes.STRING,
  token_acesso: DataTypes.TEXT,
  token_refresh: DataTypes.TEXT,
  token_expira_em: DataTypes.DATE,
  criado_em: DataTypes.DATE,
  atualizado_em: DataTypes.DATE,
}, {
  tableName: 'integracoes_ifood',
  timestamps: false,
  schema: 'public',
});

// === MODELO DE PEDIDOS DO IFOOD ===
const IfoodPedido = sequelize.define('IfoodPedido', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pedido_id: DataTypes.STRING,
  cliente_nome: DataTypes.STRING,
  loja_nome: DataTypes.STRING,
  valor_total: DataTypes.DECIMAL(10, 2),
  status: DataTypes.STRING,
  criado_em: DataTypes.DATE,
  enviado_em: DataTypes.DATE,
}, {
  tableName: 'ifood_pedidos',
  timestamps: false,
  schema: 'public',
});

// === CONFIGURAÇÃO PADRÃO DO .ENV ===
const defaultConfig = {
  ambiente: process.env.IFOOD_AMBIENTE || 'teste',
  client_id: process.env.IFOOD_CLIENT_ID,
  client_secret: process.env.IFOOD_CLIENT_SECRET,
  merchant_id: process.env.IFOOD_MERCHANT_ID,
  merchant_uuid: process.env.IFOOD_MERCHANT_UUID,
  redirect_uri: process.env.IFOOD_REDIRECT_URI,
};

// === INICIALIZA CONFIGURAÇÃO CASO NÃO EXISTA ===
(async () => {
  try {
    const existente = await IntegracaoIfood.findOne();
    if (!existente && defaultConfig.client_id) {
      await IntegracaoIfood.create({
        ...defaultConfig,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });
      console.log('⚙️  Configuração inicial do iFood criada a partir do .env');
    }
  } catch (error) {
    console.error('Erro ao inicializar configuração iFood:', error);
  }
})();

// === [1] Obter configuração ===
router.get('/config', async (req, res) => {
  try {
    const config = await IntegracaoIfood.findOne({ order: [['id', 'DESC']] });
    res.json(config || {});
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// === [2] Atualizar configuração ===
router.post('/config', async (req, res) => {
  try {
    const dados = req.body;
    const existente = await IntegracaoIfood.findOne({ order: [['id', 'DESC']] });

    if (existente) {
      await existente.update({ ...dados, atualizado_em: new Date() });
    } else {
      await IntegracaoIfood.create({ ...dados, criado_em: new Date(), atualizado_em: new Date() });
    }

    res.json({ success: true, message: 'Configurações atualizadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
});

// === [3] Gerar token de autenticação ===
router.post('/auth', async (req, res) => {
  try {
    const config = await IntegracaoIfood.findOne({ order: [['id', 'DESC']] });
    if (!config) return res.status(404).json({ error: 'Configuração não encontrada.' });

    const { client_id, client_secret } = config;

    const resp = await axios.post('https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token', {
      grantType: 'client_credentials',
      clientId: client_id,
      clientSecret: client_secret,
    });

    const token = resp.data.accessToken;
    const expira = moment().add(resp.data.expiresIn, 'seconds').toDate();

    await config.update({
      token_acesso: token,
      token_expira_em: expira,
      atualizado_em: new Date(),
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Erro ao autenticar com iFood:', error.response?.data || error.message);
    res.status(500).json({ error: 'Falha na autenticação com o iFood' });
  }
});

// === [4] Listar pedidos pendentes e enviados ===
router.get('/pedidos', async (req, res) => {
  try {
    const pendentes = await IfoodPedido.findAll({
      where: { status: 'pendente' },
      order: [['criado_em', 'DESC']],
    });

    const enviados = await IfoodPedido.findAll({
      where: { status: 'enviado' },
      order: [['enviado_em', 'DESC']],
    });

    res.json({ pendentes, enviados });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// === [5] Simular pedidos para teste ===
router.post('/sync', async (req, res) => {
  try {
    const pedidos = [
      { pedido_id: 'TESTE-' + Date.now(), cliente_nome: 'João Teste', loja_nome: 'Vaca Burguer Barra', valor_total: 45.50 },
      { pedido_id: 'TESTE-' + (Date.now() + 1), cliente_nome: 'Maria Simulação', loja_nome: 'Vaca Burguer Tijuca', valor_total: 62.00 },
    ];

    for (const p of pedidos) {
      await IfoodPedido.create({ ...p, status: 'pendente', criado_em: new Date() });
    }

    res.json({ success: true, message: 'Pedidos simulados adicionados à fila.' });
  } catch (error) {
    console.error('Erro ao sincronizar pedidos:', error);
    res.status(500).json({ error: 'Erro ao sincronizar pedidos' });
  }
});

// === [6] Webhook do iFood ===
router.post('/webhook', async (req, res) => {
  try {
    const eventos = Array.isArray(req.body) ? req.body : [req.body];
    console.log('📦 Webhook iFood recebido:', JSON.stringify(eventos, null, 2));

    for (const ev of eventos) {
      const tipo = ev.fullCode || ev.code || 'UNKNOWN';
      const pedidoId = ev.orderId || ev.pedido_id || 'sem-id';

      if (!pedidoId) continue;

      let pedido = await IfoodPedido.findOne({ where: { pedido_id: pedidoId } });

      // === Evento: novo pedido ===
      if (tipo.includes('PLACED')) {
        if (!pedido) {
          await IfoodPedido.create({
            pedido_id: pedidoId,
            cliente_nome: ev.customer?.name || 'Cliente iFood',
            loja_nome: 'Loja iFood (Sandbox)',
            valor_total: ev.total?.value || 0,
            status: 'pendente',
            criado_em: new Date(),
          });
          console.log(`🆕 Novo pedido ${pedidoId} inserido na fila.`);
        }
      }

      // === Evento: pedido confirmado ===
      else if (tipo.includes('CONFIRMED')) {
        if (pedido) {
          await pedido.update({ status: 'enviado', enviado_em: new Date() });
          console.log(`✅ Pedido ${pedidoId} confirmado e enviado.`);
        }
      }

      // === Evento: pedido cancelado ===
      else if (tipo.includes('CANCELLED')) {
        if (pedido) {
          await pedido.update({ status: 'cancelado' });
          console.log(`❌ Pedido ${pedidoId} cancelado pelo iFood.`);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook iFood:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// === [7] Loop de envio automático ===
const tentarEnviarPedido = async (pedido) => {
  const tentativasMax = 60; // 5 minutos (60 x 5s)
  let tentativas = 0;

  console.log(`🚚 Iniciando envio do pedido ${pedido.pedido_id}`);

  const intervalo = setInterval(async () => {
    tentativas++;

    try {
      const enviado = Math.random() < 0.6; // Mock (60% chance sucesso)

      if (enviado) {
        await pedido.update({
          status: 'enviado',
          enviado_em: new Date(),
        });
        console.log(`✅ Pedido ${pedido.pedido_id} enviado com sucesso.`);
        clearInterval(intervalo);
      } else if (tentativas >= tentativasMax) {
        await pedido.update({ status: 'cancelado' });
        console.log(`❌ Pedido ${pedido.pedido_id} cancelado após 5 minutos.`);
        clearInterval(intervalo);
      } else {
        console.log(`⏳ Tentando enviar pedido ${pedido.pedido_id} (${tentativas}/${tentativasMax})`);
      }
    } catch (error) {
      console.error(`Erro ao enviar pedido ${pedido.pedido_id}:`, error.message);
    }
  }, 5000);
};

// === [8] Processar fila automaticamente ===
const processarFila = async () => {
  try {
    const pendentes = await IfoodPedido.findAll({
      where: { status: 'pendente' },
      order: [['criado_em', 'ASC']],
    });

    for (const pedido of pendentes) {
      tentarEnviarPedido(pedido);
    }
  } catch (error) {
    console.error('Erro ao processar fila iFood:', error);
  }
};

// === [9] Disparar o loop de monitoramento da fila ===
setInterval(processarFila, 10000);

module.exports = router;
