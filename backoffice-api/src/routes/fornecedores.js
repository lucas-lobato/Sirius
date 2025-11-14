const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// === Modelo ===
const Fornecedor = sequelize.define('Fornecedor', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  contato: { type: DataTypes.STRING, allowNull: true },
  ddd: { type: DataTypes.STRING, allowNull: true },
  telefone: { type: DataTypes.STRING, allowNull: true },
  endereco: { type: DataTypes.STRING, allowNull: true },
  complemento: { type: DataTypes.STRING, allowNull: true },
  bairro: { type: DataTypes.STRING, allowNull: true },
  numero: { type: DataTypes.STRING, allowNull: true },
  cep: { type: DataTypes.STRING, allowNull: true },
  cidade: { type: DataTypes.STRING, allowNull: true },
  uf: { type: DataTypes.STRING, allowNull: true },
  pais: { type: DataTypes.STRING, allowNull: true },
  cnpj_cpf: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  tipo_fornecedor: { type: DataTypes.STRING, allowNull: true },
  inscricao_estadual: { type: DataTypes.STRING, allowNull: true },
  plano_de_contas: { type: DataTypes.STRING, allowNull: true },
  criado_em: { type: DataTypes.DATE, allowNull: true },
  atualizado_em: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'fornecedores',
  timestamps: false,
  schema: 'public', // garante que busca na schema certa
});

// === Listar fornecedores com paginação ===
router.get('/', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const pagina = parseInt(req.query.pagina) || 1;
    const offset = (pagina - 1) * limite;

    const where = {}; // futura busca se quiser (nome, cidade etc)

    const { count, rows } = await Fornecedor.findAndCountAll({
      where,
      limit: limite,
      offset,
      order: [['nome', 'ASC']],
    });

    res.json({
      fornecedores: rows,
      pagina,
      total_paginas: Math.ceil(count / limite),
      total_registros: count,
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao listar fornecedores' });
  }
});

// === Exportar todos os fornecedores ===
router.get('/exportar', async (req, res) => {
  try {
    const fornecedores = await Fornecedor.findAll({
      order: [['nome', 'ASC']],
    });
    res.json(fornecedores);
  } catch (error) {
    console.error('Erro ao exportar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao exportar fornecedores' });
  }
});

module.exports = router;
