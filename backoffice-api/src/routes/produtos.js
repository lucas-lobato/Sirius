const express = require('express');
const Produto = require('../models/Produto');
const router = express.Router();

// URL base padrão (para imagens dos produtos no Azure Blob)
const URL_BASE = 'https://pdvboravaca.blob.core.windows.net/imagens-produtos/';

// === LISTAR COM PAGINAÇÃO E FILTRO ===
router.get('/', async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;
    const busca = req.query.busca ? req.query.busca.trim() : '';

    const where = busca
      ? {
          nome_produto: { [require('sequelize').Op.iLike]: `%${busca}%` },
        }
      : {};

    const { count, rows } = await Produto.findAndCountAll({
      where,
      limit: limite,
      offset,
      order: [['nome_produto', 'ASC']],
    });

    res.json({
      total: count,
      pagina,
      limite,
      total_paginas: Math.ceil(count / limite),
      produtos: rows,
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

/**
 * === INSERIR NOVO ===
 * Cadastra um novo produto no banco.
 */
router.post('/', async (req, res) => {
  try {
    const {
      codigo_produto,
      nome_produto,
      produto_base,
      grupo_produto,
      subgrupo_produto,
      classificacao_boravaca,
      ecombo,
      classificacao_1,
      classificacao_2,
      promocao,
      preco_venda,
      imagem_url
    } = req.body;

    // Campos obrigatórios (ajustado para novas colunas)
    const obrigatorios = {
      codigo_produto,
      nome_produto,
      produto_base,
      grupo_produto,
      subgrupo_produto,
      classificacao_boravaca,
      ecombo,
      classificacao_1,
      classificacao_2,
      promocao,
      preco_venda
    };

    const faltando = Object.entries(obrigatorios)
      .filter(([, v]) => v === undefined || v === null || v === '')
      .map(([k]) => k);

    if (faltando.length) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        campos: faltando
      });
    }

    // Monta a URL da imagem (se não enviada)
    const finalImagemUrl = imagem_url || `${URL_BASE}${codigo_produto}.jpg`;

    const novoProduto = await Produto.create({
      codigo_produto,
      nome_produto,
      produto_base,
      grupo_produto,
      subgrupo_produto,
      classificacao_boravaca,
      ecombo,
      classificacao_1,
      classificacao_2,
      promocao,
      preco_venda,
      imagem_url: finalImagemUrl
    });

    return res.status(201).json(novoProduto);
  } catch (error) {
    console.error('Erro ao inserir produto:', error);
    return res.status(500).json({ error: 'Erro ao inserir produto' });
  }
});

/**
 * === ATUALIZAR ===
 * Atualiza os dados de um produto existente.
 */
router.put('/:codigo_produto', async (req, res) => {
  try {
    const { codigo_produto } = req.params;
    const produto = await Produto.findByPk(codigo_produto);

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Impede alteração do código do produto (PK)
    if (req.body.codigo_produto && req.body.codigo_produto !== codigo_produto) {
      return res.status(400).json({ error: 'codigo_produto não pode ser alterado' });
    }

    await produto.update({
      nome_produto: req.body.nome_produto,
      produto_base: req.body.produto_base,
      grupo_produto: req.body.grupo_produto,
      subgrupo_produto: req.body.subgrupo_produto,
      classificacao_boravaca: req.body.classificacao_boravaca,
      ecombo: req.body.ecombo,
      classificacao_1: req.body.classificacao_1,
      classificacao_2: req.body.classificacao_2,
      promocao: req.body.promocao,
      preco_venda: req.body.preco_venda,
      imagem_url: req.body.imagem_url || produto.imagem_url
    });

    return res.json(produto);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

/**
 * === EXCLUIR ===
 * Exclui um produto do banco de dados.
 */
router.delete('/:codigo_produto', async (req, res) => {
  try {
    const { codigo_produto } = req.params;
    const produto = await Produto.findByPk(codigo_produto);

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await produto.destroy();
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

/**
 * === EXPORTAR TODOS OS PRODUTOS ===
 * Retorna todos os produtos para exportação em Excel.
 */
router.get('/exportar', async (req, res) => {
  try {
    const produtos = await Produto.findAll({
      order: [['nome_produto', 'ASC']],
    });

    res.json(produtos);
  } catch (error) {
    console.error('Erro ao exportar produtos:', error);
    res.status(500).json({ error: 'Erro ao exportar produtos' });
  }
});

// ✅ Exporta as rotas (somente uma vez, no final do arquivo)
module.exports = router;
