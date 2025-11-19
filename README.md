🌌 Sirius — Backoffice Completo (API + Web)

Bem-vindo ao Sirius, o ecossistema que controla tudo: produtos, insumos, usuários, estoque, fichas técnicas, relatórios…
Aqui você encontra o backend (Node/Express/Postgres) e o frontend (Next.js/React/MUI) explicados de forma clara, divertida e profissional.

Sirius é o “sistema solar” do seu PDV.
A API é o Sol (fonte de dados).
O front é o planeta habitável onde os usuários vivem.

📦 Estrutura do Projeto

Este repositório contém duas aplicações independentes, mas que trabalham juntas:

backoffice-api/     → Servidor (Node.js, Express, Sequelize, PostgreSQL)
backoffice-web/     → Interface Web (Next.js, React, Material UI)


Cada pasta possui seu próprio Dockerfile, dependências e comandos.

🧠 Visão Geral

Imagine o sistema como um restaurante gigante:

🍳 backoffice-api (a Cozinha)

Aqui ficam os cozinheiros (rotas),

Os ingredientes (models),

Os pedidos (requisições HTTP),

E a ligação com o depósito (banco PostgreSQL).

A API pega, salva, atualiza e apaga informações — e devolve tudo no formato JSON.

🍽️ backoffice-web (o Salão)

Aqui ficam as mesas (páginas),

Os garçons (componentes),

O cardápio (side menu),

E o ambiente do restaurante (ThemeMode claro/escuro).

O front mostra tudo bonitinho, chama a API e deixa o usuário trabalhar.

🚀 Como rodar o projeto
1. 🟦 Rodando a API (backoffice-api)
📌 Pré-requisitos

Node.js 20+

PostgreSQL

VS Code (recomendado)

Docker (opcional mas recomendado)

▶️ Rodando em modo desenvolvimento
cd backoffice-api
npm install
npm run dev


A API sobe em:

http://localhost:3000

🐳 Rodando com Docker (produção)
docker compose up --build

2. 🟧 Rodando o Frontend (backoffice-web)
▶️ Rodando em modo desenvolvimento
cd backoffice-web
npm install
npm run dev


O frontend sobe em:

http://localhost:5173

🐳 Rodando com Docker
docker compose up --build

🗄️ Banco de Dados

O sistema usa PostgreSQL.
A API se conecta via variáveis de ambiente:

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=


Todos os models estão no backoffice-api e são mapeados pelo Sequelize.

🧩 Principais Módulos
🟦 Backoffice API
Módulo	Descrição
Produtos	CRUD completo com paginação, busca e exportação pra Excel
Insumos	Cadastro e manutenção de insumos
Usuários	Login, permissão, senha com bcrypt
Estoque	Relatórios usando SQL bruto
Ficha Técnica	Insumos por produtos
Fornecedores	Consulta de fornecedores
iFood	Integração básica via tokens
🟧 Backoffice Web
Tela	Função
Dashboard	Ainda em construção, mas dá boas-vindas 🙂
Produtos	Tabela com busca, paginação, edição e export
Insumos	Mesmo esquema de produtos
Ficha Técnica	Visualização dos insumos por item
Usuários	Cadastro, edição, permissões e senha
Relatórios	Estoque, CMV, pedidos, etc
Tema	Alternância clara/escura (tudo automático via contexto)
🧭 Fluxo de Funcionamento

O usuário clica em algum botão no frontend
ex: “Cadastrar Produto”.

O front envia uma requisição para a API
ex: POST /produtos.

A API valida, salva no banco e devolve resposta.

O front atualiza a tabela imediatamente.

Simples, direto e bonito.

🎨 Layout e Navegação

UI construída com Material UI

Sidebar com navegação em árvore

Topbar com:

botão de menu

alternância de tema

avatar

Páginas em /app/... com Server Actions desativadas (use client)

🧪 Exemplos de Ações Comuns
Criar um produto:
POST /produtos
{
  "codigo_produto": "1234",
  "nome_produto": "Vaca Derretida",
  "grupo_produto": "Hambúrguer",
  "subgrupo_produto": "Smash",
  "preco_venda": 29.90
}

Buscar insumos com filtro:
GET /insumos?busca=carne&pagina=2&limite=10

Atualizar usuário:
PUT /usuarios/7
{
  "login": "lobato",
  "permissao": "Master",
  "cpf": "17709254730"
}

🛡️ Segurança

Todas as senhas são hashadas com bcrypt

API aceita apenas JSON

CORS habilitado para o front

Sanitização básica nos campos

🎯 Objetivo do Projeto

Criar um Backoffice profissional, rápido, modular e pronto para ser acoplado ao PDV offline-first do Sirius.

😄 Filosofia do Projeto

Desenvolver rápido, manter limpo, evoluir sempre.

Nada de telas feias

Nada de API bagunçada

Nada de códigos enigmáticos

Aqui tudo é claro, modular e fácil de entender.

🛠️ Tecnologias
Backend

Node.js

Express

Sequelize

PostgreSQL

bcryptjs

Docker

Frontend

Next.js 14

React 18

Material UI 6

TypeScript

XLSX (exportação Excel)

Docker

📬 Contato (para quem está lendo no futuro)

Criado por Lucas Lobato
Feito para dominar o universo