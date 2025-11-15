const express = require('express');
const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ✅ usa conexão global com SSL configurado
const router = express.Router();

// === Modelo Sequelize para a tabela "usuarios" ===
const Usuario = sequelize.define(
  'usuarios',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    permissao: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'usuarios',
    timestamps: false,
  }
);

// === POST /usuarios — Cadastrar novo usuário ===
router.post('/', async (req, res) => {
  try {
    const { login, senha, permissao } = req.body;

    if (!login || !senha || !permissao) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // Verifica duplicidade de login
    const existe = await Usuario.findOne({ where: { login } });
    if (existe) {
      return res.status(409).json({ error: 'Usuário já existe.' });
    }

    // Criptografa a senha antes de salvar
    const hash = await bcrypt.hash(senha, 10);

    const novo = await Usuario.create({
      login,
      senha: hash,
      permissao,
    });

    res.status(201).json({
      id: novo.id,
      login: novo.login,
      permissao: novo.permissao,
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// === GET /usuarios — Listar todos os usuários ===
router.get('/', async (_req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'login', 'permissao', 'cpf'],
      order: [['id', 'ASC']],
    });
    res.json(usuarios);
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

// === GET /usuarios/:id — Buscar um usuário específico ===
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ['id', 'login', 'permissao', 'cpf'],
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

// === DELETE /usuarios/:id — Excluir um usuário ===
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await usuario.destroy();
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
