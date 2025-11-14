// ==========================================
// 📦 ROTA: Estoque (tabela 'estoque')
// ==========================================

const express = require('express');
const router = express.Router();
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const NodeCache = require('node-cache');

// Cache leve em memória (TTL = 60 segundos)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// ===============================
// 🔹 LISTAR COM PAGINAÇÃO E FILTROS
// ===============================
router.get('/', async (req, res) => {
  try {
    const pagina = Number(req.query.pagina) || 1;
    const limite = Number(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const busca = req.query.busca ? `%${req.query.busca.trim().toLowerCase()}%` : null;
    const unidade = req.query.unidade ? `%${req.query.unidade.trim().toLowerCase()}%` : null;
    const dataInicio = req.query.dataInicio || null;
    const dataFim = req.query.dataFim || null;

    const cacheKey = JSON.stringify({ pagina, limite, busca, unidade, dataInicio, dataFim });
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Monta WHERE dinâmico
    let filtros = [];
    if (busca) filtros.push(`LOWER(nome_insumo) LIKE :busca`);
    if (unidade) filtros.push(`LOWER(unidade) LIKE :unidade`);
    if (dataInicio && dataFim) filtros.push(`DATE(data) BETWEEN :dataInicio AND :dataFim`);
    else if (dataInicio) filtros.push(`DATE(data) >= :dataInicio`);
    else if (dataFim) filtros.push(`DATE(data) <= :dataFim`);

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

    // 🔹 Query principal (puxa SOMENTE a página atual)
    const estoque = await sequelize.query(
      `
        SELECT 
          TO_CHAR(data, 'DD/MM/YYYY') AS data_formatada,
          unidade,
          nome_insumo,
          quantidade
        FROM public.estoque
        ${where}
        ORDER BY data DESC, unidade ASC
        LIMIT :limite OFFSET :offset;
      `,
      {
        replacements: { busca, unidade, dataInicio, dataFim, limite, offset },
        type: QueryTypes.SELECT,
      }
    );

    // 🔹 Conta total de registros (apenas para calcular o total de páginas)
    const [{ total }] = await sequelize.query(
      `
        SELECT COUNT(*)::int AS total
        FROM public.estoque
        ${where};
      `,
      {
        replacements: { busca, unidade, dataInicio, dataFim },
        type: QueryTypes.SELECT,
      }
    );

    const resposta = {
      total,
      pagina,
      limite,
      total_paginas: Math.max(1, Math.ceil(total / limite)),
      estoque,
    };

    cache.set(cacheKey, resposta);
    res.json(resposta);
  } catch (error) {
    console.error('❌ Erro ao listar estoque:', error);
    res.status(500).json({ error: 'Erro ao listar estoque' });
  }
});

// =====================================
// 🔹 EXPORTAR TODOS OS DADOS FILTRADOS
// =====================================
router.get('/exportar', async (req, res) => {
  try {
    const busca = req.query.busca ? `%${req.query.busca.trim().toLowerCase()}%` : null;
    const unidade = req.query.unidade ? `%${req.query.unidade.trim().toLowerCase()}%` : null;
    const dataInicio = req.query.dataInicio || null;
    const dataFim = req.query.dataFim || null;

    let filtros = [];
    if (busca) filtros.push(`LOWER(nome_insumo) LIKE :busca`);
    if (unidade) filtros.push(`LOWER(unidade) LIKE :unidade`);
    if (dataInicio && dataFim) filtros.push(`DATE(data) BETWEEN :dataInicio AND :dataFim`);
    else if (dataInicio) filtros.push(`DATE(data) >= :dataInicio`);
    else if (dataFim) filtros.push(`DATE(data) <= :dataFim`);

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

    const dados = await sequelize.query(
      `
        SELECT 
          TO_CHAR(data, 'DD/MM/YYYY') AS data_formatada,
          unidade,
          nome_insumo,
          quantidade
        FROM public.estoque
        ${where}
        ORDER BY data DESC, unidade ASC;
      `,
      {
        replacements: { busca, unidade, dataInicio, dataFim },
        type: QueryTypes.SELECT,
      }
    );

    res.json(dados);
  } catch (error) {
    console.error('❌ Erro ao exportar estoque:', error);
    res.status(500).json({ error: 'Erro ao exportar estoque' });
  }
});

module.exports = router;
