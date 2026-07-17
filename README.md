# YouTube Filtrado

Plataforma de vídeos inspirada no YouTube com filtragem geográfica por país.

## Funcionalidades

- **Autenticação** - Cadastro e login com JWT
- **Upload de Vídeos** - Envio de vídeos com suporte a MP4, AVI, MOV, WebM
- **Filtragem por País** - Controle de quais países podem acessar cada vídeo
- **Detecção Automática** - Geolocalização por IP para detectar o país do usuário
- **Comentários** - Sistema de comentários com moderação
- **Playlists** - Criação e organização de playlists
- **Busca** - Pesquisa de vídeos por título e descrição
- **Histórico** - Registro de visualizações do usuário
- **Perfil** - Página de perfil com vídeos do usuário

## Tecnologias

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT (autenticação)
- Multer (upload de arquivos)
- Socket.IO (comentários em tempo real)
- ipinfo.io (geolocalização)

### Frontend
- React.js
- React Router
- Axios (HTTP client)
- Socket.IO Client
- Video.js (player de vídeo)

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Instalação

### 1. Clonar o repositório

```bash
git clone <repositorio>
cd youtube-filtrado
```

### 2. Configurar o Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas configurações de banco de dados
npm install
```

### 3. Criar o banco de dados

```sql
CREATE DATABASE youtube_filtrado;
```

### 4. Rodar as migrações

```bash
npm run migrate
```

### 5. Iniciar o Backend

```bash
npm run dev
```

### 6. Configurar o Frontend

```bash
cd ../frontend
npm install
npm start
```

## Estrutura do Projeto

```
youtube-filtrado/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (database, migrações)
│   │   ├── controllers/     # Controllers (lógica de negócio)
│   │   ├── middleware/      # Middleware (auth)
│   │   ├── models/          # Models (Sequelize)
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços (geolocalização)
│   │   └── server.js        # Servidor principal
│   ├── uploads/             # Arquivos enviados
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── context/         # Context API (Auth)
│   │   ├── pages/           # Páginas
│   │   ├── services/        # Serviços (API)
│   │   ├── styles/          # Estilos CSS
│   │   └── App.js
│   └── package.json
└── README.md
```

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users/profile/:id` - Perfil
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/history` - Histórico

### Vídeos
- `GET /api/videos` - Listar vídeos
- `GET /api/videos/:id` - Detalhes do vídeo
- `POST /api/videos` - Upload (auth)
- `PUT /api/videos/:id` - Atualizar (auth)
- `DELETE /api/videos/:id` - Deletar (auth)
- `GET /api/videos/trending` - Em alta

### Comentários
- `GET /api/comments/video/:videoId` - Comentários do vídeo
- `POST /api/comments/video/:videoId` - Criar comentário (auth)

### Playlists
- `GET /api/playlists/user/:userId` - Playlists do usuário
- `POST /api/playlists` - Criar playlist (auth)
- `POST /api/playlists/:id/videos` - Adicionar vídeo (auth)

### Países
- `GET /api/countries` - Lista de países
- `GET /api/countries/detect` - Detectar país por IP

## Deploy no Coolify

### Pré-requisitos
- Coolify instalado e rodando
- PostgreSQL configurado no Coolify

### 1. Criar serviço PostgreSQL no Coolify
- Adicione um novo serviço PostgreSQL
- Nome: `youtube-filtrado-db`
- Database: `youtube_filtrado`
- User: `postgres`
- Anote a senha gerada

### 2. Deploy do Backend
- Adicione um novo serviço Docker Compose
- Conecte ao repositório GitHub
- Build pack: `Dockerfile`
- Dockerfile location: `backend/Dockerfile`
- Port: `3001`
- Variáveis de ambiente:
  ```
  PORT=3001
  NODE_ENV=production
  DB_HOST=youtube-filtrado-db
  DB_PORT=5432
  DB_NAME=youtube_filtrado
  DB_USER=postgres
  DB_PASSWORD=<senha-do-postgres>
  JWT_SECRET=<gerar-chave-secreta>
  JWT_EXPIRES_IN=7d
  FRONTEND_URL=https://<seu-dominio>
  ```

### 3. Deploy do Frontend
- Adicione um novo serviço Docker Compose
- Conecte ao repositório GitHub
- Build pack: `Dockerfile`
- Dockerfile location: `frontend/Dockerfile`
- Port: `80`

### 4. Configurar Proxy Reverso
No Coolify, configure o proxy reverso para redirecionar `/api` e `/uploads` para o backend.

### 5. Rodar Migrações
Acesse o container do backend e execute:
```bash
node src/config/migrate.js
```

## Deploy com Docker Compose (local)

```bash
# Copiar e configurar .env
cp .env.example .env

# Iniciar tudo
docker-compose up -d

# Rodar migrações
docker-compose exec backend node src/config/migrate.js
```

## Licença

MIT
