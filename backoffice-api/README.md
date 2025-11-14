# Backoffice API (Node.js + Express)

API do backoffice do Projeto Sirius.  
Gerencia autenticação, produtos, usuários e toda comunicação usada pelo Backoffice Web.

---

## 🌎 Endpoints

- **Produção (Docker):** http://localhost:3000
- **Desenvolvimento (Docker):** http://localhost:3001

---

## 🚀 Rodando em Desenvolvimento (LOCAL)

```bash
npm install
npm run dev
A API ficará disponível em:

arduino
Copiar código
http://localhost:3000
🐳 Desenvolvimento com Docker
bash
Copiar código
docker compose -f docker-compose.dev.yml up --build
Acesse:

arduino
Copiar código
http://localhost:3001
Hot reload funcionando via nodemon.

🏭 Produção com Docker
bash
Copiar código
docker compose up --build
API em:

arduino
Copiar código
http://localhost:3000
📁 Estrutura
pgsql
Copiar código
backoffice-api/
 ├── src/
 │    └── index.js
 ├── Dockerfile
 ├── Dockerfile.dev
 ├── docker-compose.yml
 ├── docker-compose.dev.yml
 ├── package.json
 └── .env
🔧 Variáveis de Ambiente
.env:

ini
Copiar código
PORT=3000
DB_URL=<sua conexão>
JWT_SECRET=<chave secreta>
✔ Tecnologias
Node.js

Express

Docker