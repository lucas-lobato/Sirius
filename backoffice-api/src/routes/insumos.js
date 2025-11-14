const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// === Modelo ===
const Insumo = sequelize.define('Insumo', {
  codigo_insumo: { type: DataTypes.INTEGER, primaryKey: true },
  nome_insumo: { type: DataTypes.STRING, allowNull: false },
  grupo_insumo: { type: DataTypes.STRING, allowNull: true },
  subgrupo_insumo: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'insumos',
  timestamps: false,
});

// === Listar com paginação ===
router.get('/', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const pagina = parseInt(req.query.pagina) || 1;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Insumo.findAndCountAll({
      limit: limite,
      offset,
      order: [['nome_insumo', 'ASC']],
    });

    res.json({
      insumos: rows,
      pagina,
      total_paginas: Math.ceil(count / limite),
      total_registros: count,
    });
  } catch (error) {
    console.error('Erro ao listar insumos:', error);
    res.status(500).json({ error: 'Erro ao listar insumos' });
  }
});

// === Exportar todos ===
router.get('/exportar', async (req, res) => {
  try {
    const insumos = await Insumo.findAll({ order: [['nome_insumo', 'ASC']] });
    res.json(insumos);
  } catch (error) {
    console.error('Erro ao exportar insumos:', error);
    res.status(500).json({ error: 'Erro ao exportar insumos' });
  }
});

module.exports = router;
