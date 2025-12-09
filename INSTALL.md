# 🚀 Guia de Instalação - Marketplace Eventos

## Pré-requisitos

### Obrigatórios
- **Bun** 1.0+ - [Instalar Bun](https://bun.sh)
- **Docker** & **Docker Compose** - [Instalar Docker](https://docs.docker.com/get-docker/)
- **Git** - [Instalar Git](https://git-scm.com/downloads)

### Opcional
- **Node.js** 18+ (caso precise rodar sem Bun)
- **PostgreSQL** local (se não quiser usar Docker)

## 🛠️ Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/Allaaxx/marketplace-eventos-rental.git
cd marketplace-eventos-rental
```

### 2. Limpe o Cache (se houver problemas)

```bash
# Windows (Git Bash/PowerShell)
rm -rf node_modules
rm -rf apps/backend/node_modules
rm -rf .bun
rm bun.lockb

# Linux/Mac
rm -rf node_modules apps/*/node_modules .bun bun.lockb
```

### 3. Instale as Dependências do Backend

**OPÇÃO 1: Instalar apenas o backend (Recomendado)**

```bash
cd apps/backend
bun install
```

**OPÇÃO 2: Instalar workspace completo**

```bash
# Na raiz do projeto
bun install --force
```

### 4. Configure as Variáveis de Ambiente

```bash
cd apps/backend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL=postgresql://marketplace:marketplace_dev_2025@localhost:5432/marketplace_eventos

# BetterAuth
BETTER_AUTH_SECRET=sua-chave-secreta-minimo-32-caracteres-aqui-12345678
BETTER_AUTH_URL=http://localhost:3001

# Stripe (obtenha em https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Inicie o PostgreSQL com Docker

```bash
# Volte para a raiz do projeto
cd ../..

# Inicie apenas o PostgreSQL
docker-compose up -d postgres

# Verifique se está rodando
docker-compose ps
```

Você deve ver:
```
NAME                     IMAGE                  STATUS
marketplace-postgres     postgres:16-alpine     Up
```

### 6. Configure o Banco de Dados

```bash
cd apps/backend

# Gere as migrações
bun run db:generate

# Execute as migrações
bun run db:migrate
```

Saida esperada:
```
⏳ Running migrations...
✅ Migrations completed successfully
```

### 7. Inicie o Servidor

```bash
# Ainda em apps/backend
bun run dev
```

Você deve ver:
```
🚀 Marketplace Backend running at http://localhost:3001
📚 API Documentation available at http://localhost:3001/api-docs
```

### 8. Teste a API

Abra seu navegador em:
- **API**: http://localhost:3001
- **Docs**: http://localhost:3001/api-docs
- **Health**: http://localhost:3001/health

Ou use curl:
```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T19:30:00.000Z",
  "database": "connected"
}
```

## ❌ Resolvendo Problemas Comuns

### Problema: Erro no esbuild durante `bun install`

**Solução 1: Limpar cache e reinstalar**
```bash
rm -rf node_modules .bun bun.lockb
bun install --force
```

**Solução 2: Instalar apenas o backend**
```bash
cd apps/backend
rm -rf node_modules
bun install
```

**Solução 3: Usar npm como fallback**
```bash
npm install --legacy-peer-deps
```

### Problema: PostgreSQL não inicia

```bash
# Pare todos os containers
docker-compose down

# Remova volumes antigos
docker-compose down -v

# Inicie novamente
docker-compose up -d postgres

# Veja os logs
docker-compose logs -f postgres
```

### Problema: Erro "Cannot find module"

```bash
# Limpe completamente
bun run clean

# Reinstale
cd apps/backend
bun install
```

### Problema: Porta 3001 em uso

**Solução 1: Mudar a porta**
```bash
# No arquivo .env
PORT=3002
```

**Solução 2: Matar o processo**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Problema: Erro de conexão com banco

```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Teste a conexão
docker exec -it marketplace-postgres psql -U marketplace -d marketplace_eventos

# Se conectar, seu banco está OK. Digite \q para sair
```

### Problema: Migrações falham

```bash
# Limpe as migrações antigas
rm -rf drizzle/

# Regenere
bun run db:generate

# Execute novamente
bun run db:migrate
```

## 👨‍💻 Comandos Úteis

### Backend
```bash
cd apps/backend

bun run dev              # Servidor de desenvolvimento
bun run build            # Build de produção
bun run start            # Servidor de produção
bun run db:generate      # Gerar migrações
bun run db:migrate       # Executar migrações
bun run db:studio        # Abrir Drizzle Studio
bun run lint             # Verificar tipos
```

### Docker
```bash
# Da raiz do projeto
docker-compose up -d              # Iniciar todos os serviços
docker-compose up -d postgres     # Apenas PostgreSQL
docker-compose down               # Parar todos
docker-compose down -v            # Parar e remover volumes
docker-compose logs -f            # Ver logs
docker-compose logs -f postgres   # Logs do PostgreSQL
docker-compose restart            # Reiniciar
```

### Limpeza
```bash
# Da raiz do projeto
bun run clean                     # Limpar node_modules e builds

# Limpeza profunda
rm -rf node_modules apps/*/node_modules .bun bun.lockb
docker-compose down -v
```

## 📋 Checklist de Instalação

- [ ] Bun instalado (`bun --version`)
- [ ] Docker instalado (`docker --version`)
- [ ] Repositório clonado
- [ ] Dependências instaladas (`bun install`)
- [ ] Arquivo `.env` configurado
- [ ] PostgreSQL rodando (`docker-compose ps`)
- [ ] Migrações executadas (`bun run db:migrate`)
- [ ] Servidor iniciado (`bun run dev`)
- [ ] API respondendo (http://localhost:3001/health)
- [ ] Docs acessível (http://localhost:3001/api-docs)

## ✅ Próximos Passos

Após a instalação bem-sucedida:

1. **Explore a API**: Acesse http://localhost:3001/api-docs
2. **Configure Stripe**: Obtenha chaves em https://dashboard.stripe.com
3. **Teste endpoints**: Use Postman, Insomnia ou curl
4. **Desenvolva**: Comece a adicionar features

## 📞 Suporte

Se encontrar problemas:

1. Verifique a seção "Resolvendo Problemas"
2. Veja os logs: `docker-compose logs -f`
3. Abra uma issue no GitHub
4. Consulte a documentação oficial do [Bun](https://bun.sh) e [Elysia](https://elysiajs.com)

---

⭐ **Dica**: Sempre use `bun install` ao invés de `npm install` para melhor performance!
