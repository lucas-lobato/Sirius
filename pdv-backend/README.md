# PDV Backend (Node.js + Prisma + SQLite)

API do PDV do Projeto Sirius.  
Gerencia vendas, produtos, carrinho e comunicação com o PDV Frontend (Flutter).

---

## 🌎 Endpoints

- **Produção (Docker):** http://localhost:3333  
- **Desenvolvimento (Docker):** http://localhost:3334  

---

## 🚀 Rodando em Desenvolvimento (LOCAL)

```bash
npm install
npx prisma generate
npm run dev
API:

arduino
Copiar código
http://localhost:3333
🐳 Desenvolvimento com Docker
bash
Copiar código
docker compose -f docker-compose.dev.yml up --build
Acesse:

arduino
Copiar código
http://localhost:3334
🏭 Produção com Docker
bash
Copiar código
docker compose up --build
Acesse:

arduino
Copiar código
http://localhost:3333
📁 Estrutura
pgsql
Copiar código
pdv-backend/
 ├── prisma/
 │    ├── schema.prisma
 │    └── dev.db
 ├── src/
 │    └── server.js
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
PORT=3333
DATABASE_URL="file:./prisma/dev.db"
✔ Tecnologias
Node.js

Express

Prisma ORM

SQLite

Docker