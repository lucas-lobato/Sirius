# PDV Frontend (Flutter Web)

Frontend do PDV do Projeto Sirius, compilado em Flutter Web e servido via Nginx em produção ou web-server em desenvolvimento.

---

## 🌎 Endpoints

- **Produção (Docker):** http://localhost:8080  
- **Desenvolvimento (Docker):** http://localhost:8081  

---

## 🚀 Rodando em Desenvolvimento (LOCAL)

```bash
flutter pub get
flutter run -d chrome
Ou com web-server:

bash
Copiar código
flutter run -d web-server --web-port 8080
🐳 Desenvolvimento com Docker
bash
Copiar código
docker compose -f docker-compose.dev.yml up --build
Acesse:

arduino
Copiar código
http://localhost:8081
Hot reload ativado.

🏭 Produção com Docker
bash
Copiar código
docker compose up --build
Acesse:

arduino
Copiar código
http://localhost:8080
📁 Estrutura
vbnet
Copiar código
pdv-frontend/
 ├── lib/
 ├── build/
 ├── Dockerfile
 ├── Dockerfile.dev
 ├── docker-compose.yml
 ├── docker-compose.dev.yml
 ├── pubspec.yaml
✔ Tecnologias
Flutter Web

Dart

Docker (Nginx + Web Server)