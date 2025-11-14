# Backoffice Web (Next.js + MUI)

Frontend do backoffice do Projeto Sirius.  
Construído com Next.js, React e Material UI, consumindo a Backoffice API.

---

## 🌎 Endpoints

- **Produção (Docker):** http://localhost:5173
- **Desenvolvimento (Docker):** http://localhost:5174
- **Desenvolvimento local:** http://localhost:5173

---

## 🚀 Rodando em Desenvolvimento (LOCAL)

```bash
npm install
npm run dev
Acesse:

arduino
Copiar código
http://localhost:5173
🐳 Desenvolvimento com Docker
bash
Copiar código
docker compose -f docker-compose.dev.yml up --build
Acesse:

arduino
Copiar código
http://localhost:5174
Hot reload ativado.

🏭 Produção com Docker
bash
Copiar código
docker compose up --build
Acesse:

arduino
Copiar código
http://localhost:5173
📁 Estrutura
java
Copiar código
backoffice-web/
 ├── Dockerfile
 ├── Dockerfile.dev
 ├── docker-compose.yml
 ├── docker-compose.dev.yml
 ├── src/
 ├── public/
 └── package.json
🔧 Variáveis de Ambiente
Crie .env.local com:

ini
Copiar código
NEXT_PUBLIC_API_URL=http://localhost:3000
✔ Tecnologias
Next.js

React

Material UI (MUI)

Docker

Node.js