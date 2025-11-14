require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const compression = require('compression');

// === Importação das rotas ===
const produtosRoutes = require('./routes/produtos');
const insumosRoutes = require('./routes/insumos');
const fichaTecnicaRoutes = require('./routes/fichaTecnica');
const fornecedoresRoutes = require('./routes/fornecedores');
const ifoodroutes = require('./routes/ifood');
const fornecedores = require('./routes/estoque');
const usuariosRoutes = require('./routes/usuarios');



const app = express();

// === Configurações globais ===
app.use(cors());
app.use(express.json());
app.use(compression());

// === Rotas ===
app.use('/produtos', produtosRoutes);
app.use('/insumos', insumosRoutes);
app.use('/ficha-tecnica', fichaTecnicaRoutes);
app.use('/fornecedores', fornecedoresRoutes);
app.use('/ifood', ifoodroutes);
app.use('/estoque', fornecedores);
app.use('/usuarios', usuariosRoutes);


// === Rota principal ===
app.get('/', (req, res) => {
  res.send('🚀 Backoffice API funcionando!');
});

// === Inicializa servidor ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

// === Teste de conexão com o banco ===
(async () => {
  try {
    await sequelize.authenticate();
    console.log('🟢 Conexão com o banco foi bem-sucedida!');
  } catch (error) {
    console.error('🔴 Erro ao conectar no banco:', error);
  }
})();