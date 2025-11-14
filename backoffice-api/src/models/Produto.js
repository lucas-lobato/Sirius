const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
  codigo_produto: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  nome_produto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  produto_base: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  grupo_produto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subgrupo_produto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  classificacao_boravaca: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ecombo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  classificacao_1: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  classificacao_2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  promocao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  preco_venda: {
    type: DataTypes.STRING, // mantido como STRING, pois no Excel era texto
    allowNull: true,
  },
  imagem_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'produtos',
  timestamps: false,
});

module.exports = Produto;
