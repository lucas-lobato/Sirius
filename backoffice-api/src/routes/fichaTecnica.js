const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// === Modelo ===
const FichaTecnica = sequelize.define('FichaTecnica', {
  codigo_produto: { type: DataTypes.STRING, primaryKey: true },
  nome_produto: { type: DataTypes.STRING, allowNull: false },
  codigo_insumo: { type: DataTypes.INTEGER, allowNull: false },
  nome_insumo: { type: DataTypes.STRING, allowNull: false },
  quantidade_insumo_kg: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  tipo_insumo: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'ficha_tecnica',
  timestamps: false,
});

// === Listar com paginação ===
router.get('/', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const pagina = parseInt(req.query.pagina) || 1;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await FichaTecnica.findAndCountAll({
      limit: limite,
      offset,
      order: [['nome_produto', 'ASC']],
    });

    res.json({
      fichas: rows,
      pagina,
      total_paginas: Math.ceil(count / limite),
      total_registros: count,
    });
  } catch (error) {
    console.error('Erro ao listar ficha técnica:', error);
    res.status(500).json({ error: 'Erro ao listar ficha técnica' });
  }
});

// === Exportar todos ===
router.get('/exportar', async (req, res) => {
  try {
    const fichas = await FichaTecnica.findAll({ order: [['nome_produto', 'ASC']] });
    res.json(fichas);
  } catch (error) {
    console.error('Erro ao exportar ficha técnica:', error);
    res.status(500).json({ error: 'Erro ao exportar ficha técnica' });
  }
});

module.exports = router;
