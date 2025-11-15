require('dotenv').config();
const { Sequelize } = require('sequelize');

// Defaults para ambiente LOCAL (PostgreSQL local)
const DB_NAME = process.env.DB_DATABASE || 'postgres';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '235711';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  // Para banco local não precisamos de SSL
  logging: false,
});

module.exports = sequelize;
