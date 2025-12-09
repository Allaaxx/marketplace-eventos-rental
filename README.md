# Marketplace de Locação para Eventos

Marketplace especializado em locação de decoração e itens para eventos como casamentos, aniversários e festas temáticas.

## ✅ Correções e Melhorias Implementadas

### Versão 1.1.0 - Atualização Completa

- ✅ **Atualização de dependências**: Todas as bibliotecas atualizadas para versões mais recentes
- ✅ **Swagger/OpenAPI**: Documentação da API disponível em `/api-docs`
- ✅ **Drizzle Kit**: Configurado corretamente com o novo formato
- ✅ **Arquitetura Hexagonal**: Implementação completa das 4 camadas
- ✅ **Repositórios**: Todas as implementações de repositórios criadas
- ✅ **Casos de Uso**: CreateBooking, ApproveBooking e RejectBooking implementados
- ✅ **Serviços**: AvailabilityService e StripeService completos
- ✅ **Entidades de Domínio**: User, Shop, Product e Booking com lógica de negócio
- ✅ **Value Objects**: Email, Money e DateRange para validações
- ✅ **Tratamento de Erros**: Middleware de erro global configurado

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **Tailwind CSS** - Estilização utilitária
- **TypeScript** - Tipagem estática
- **React Query** - Gerenciamento de estado servidor

### Backend
- **Elysia 1.1+** - Framework web ultrarrápido para Bun
- **Bun 1.0+** - Runtime JavaScript de alta performance
- **TypeScript 5.7** - Tipagem estática moderna
- **Swagger** - Documentação OpenAPI automática

### Database & ORM
- **PostgreSQL 16** - Banco de dados relacional
- **Drizzle ORM 0.36+** - Type-safe ORM com migrações

### Autenticação & Pagamentos
- **BetterAuth 1.0+** - Solução de autenticação moderna
- **Stripe 17.5+** - Processamento de pagamentos multi-vendedor
- **Stripe Connect** - Split de pagamentos automático

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração local

## 🏗️ Arquitetura Hexagonal

O projeto segue rigorosamente a **Arquitetura Hexagonal (Ports & Adapters)**:

```
apps/backend/src/
├── domain/                    # Camada de Domínio (Core)
│   ├── entities/              # Entidades de negócio
│   │   ├── User.ts
│   │   ├── Shop.ts
│   │   ├── Product.ts
│   │   └── Booking.ts
│   ├── value-objects/        # Objetos de valor
│   │   ├── Email.ts
│   │   ├── Money.ts
│   │   └── DateRange.ts
│   └── repositories/         # Interfaces (Ports)
│       ├── IUserRepository.ts
│       ├── IShopRepository.ts
│       ├── IProductRepository.ts
│       └── IBookingRepository.ts
│
├── application/              # Camada de Aplicação
│   ├── use-cases/            # Casos de uso
│   │   ├── CreateBookingUseCase.ts
│   │   ├── ApproveBookingUseCase.ts
│   │   └── RejectBookingUseCase.ts
│   └── services/             # Serviços de domínio
│       ├── AvailabilityService.ts
│       └── StripeService.ts
│
├── infrastructure/           # Camada de Infraestrutura (Adapters)
│   ├── database/             # Banco de dados
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── migrate.ts
│   └── repositories/         # Implementações
│       ├── UserRepository.ts
│       ├── ShopRepository.ts
│       ├── ProductRepository.ts
│       └── BookingRepository.ts
│
└── presentation/             # Camada de Apresentação
    └── routes/               # Rotas da API (em desenvolvimento)
```

## 📦 Funcionalidades Implementadas

### ✅ Sistema de Reservas (Booking)
- Criação de reservas com validação de disponibilidade
- Aprovação manual pelo vendedor
- Rejeição com motivo
- Cálculo automático de preços (diárias)
- Taxa da plataforma (10%)

### ✅ Gestão de Disponibilidade
- Calendário de estoque por produto
- Suporte a bundles com componentes compartilhados
- Reserva automática de itens
- Verificação de conflitos

### ✅ Integração Stripe
- Criação de Checkout Sessions
- Stripe Connect para vendedores
- Split de pagamentos automático
- Webhooks para confirmação

### ✅ Validações de Domínio
- Email válido
- Datas consistentes
- Valores monetários não negativos
- Autorizações de acesso

## 🛠️ Setup do Projeto

### Pré-requisitos
- **Bun** 1.0+ (instale em https://bun.sh)
- **Docker** & **Docker Compose**
- **Conta Stripe** (https://stripe.com)

### Instalação Rápida

1. **Clone o repositório**:
```bash
git clone https://github.com/Allaaxx/marketplace-eventos-rental.git
cd marketplace-eventos-rental
```

2. **Instale as dependências**:
```bash
bun install
```

3. **Configure as variáveis de ambiente**:
```bash
cd apps/backend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Database
DATABASE_URL=postgresql://marketplace:marketplace_dev_2025@localhost:5432/marketplace_eventos

# BetterAuth
BETTER_AUTH_SECRET=seu-secret-min-32-caracteres-aqui
BETTER_AUTH_URL=http://localhost:3001

# Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. **Inicie o PostgreSQL**:
```bash
cd ../..
docker-compose up -d postgres
```

5. **Gere e execute as migrações**:
```bash
cd apps/backend
bun run db:generate
bun run db:migrate
```

6. **Inicie o backend**:
```bash
bun run dev
```

### 🌐 Acessos

- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432

## 📊 Modelo de Dados Completo

### Tabelas Principais

#### Users
- Usuários do sistema (clientes e vendedores)
- Roles: `customer`, `vendor`, `admin`
- Integração com Stripe Customer

#### Shops
- Lojas dos vendedores
- Slug único para URLs amigáveis
- Integração com Stripe Connect

#### Products
- Três tipos: `rental`, `sale`, `bundle`
- Preço fixo ou diária
- Quantidades e limites de locação

#### Product Components
- Componentes de bundles
- Podem ser compartilhados entre produtos
- Controle de quantidade individual

#### Bookings
- Reservas com máquina de estados completa
- 9 estados possíveis no fluxo
- Integração com pagamentos

#### Inventory Calendar
- Calendário de disponibilidade
- Controle por data
- Suporte a componentes de bundles

### Estados do Booking

```
PENDING_VENDOR_REVIEW
    ↓ (vendedor aprova)
APPROVED_AWAITING_PAYMENT
    ↓ (cliente paga)
PAID_CONFIRMED
    ↓ (retirada)
ACTIVE
    ↓ (devolução)
RETURNED
    ↓ (finalização)
COMPLETED

Fluxos alternativos:
- REJECTED_BY_VENDOR
- CANCELLED_BY_CUSTOMER
- EXPIRED_NO_PAYMENT
```

## 🔐 Autenticação com BetterAuth

Suporta:
- ✅ Email/Password
- ✅ OAuth (Google, GitHub)
- ✅ Sessões seguras
- ✅ Roles e permissões
- ✅ Refresh tokens

## 💳 Fluxo de Pagamento Stripe

1. **Cliente** cria uma reserva → `PENDING_VENDOR_REVIEW`
2. **Vendedor** aprova a reserva → `APPROVED_AWAITING_PAYMENT`
3. Sistema cria **Checkout Session** do Stripe
4. **Cliente** finaliza pagamento
5. **Webhook** confirma pagamento → `PAID_CONFIRMED`
6. Sistema reserva itens no calendário
7. **Split automático**: 90% vendedor, 10% plataforma

## 👥 Scripts Disponíveis

```bash
# Backend
bun run dev              # Inicia servidor de desenvolvimento
bun run build            # Build para produção
bun run start            # Inicia servidor de produção
bun run db:generate      # Gera migrações do Drizzle
bun run db:migrate       # Executa migrações
bun run db:studio        # Abre Drizzle Studio
bun run db:push          # Push schema direto (dev)
bun run lint             # Verifica tipos TypeScript

# Docker
docker-compose up -d           # Inicia todos os serviços
docker-compose up -d postgres  # Apenas PostgreSQL
docker-compose down            # Para todos os serviços
docker-compose logs -f         # Logs em tempo real
```

## 🚢 Deploy

### Backend (Recomendado: Railway)

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione PostgreSQL
3. Configure variáveis de ambiente
4. Deploy automático via GitHub

### Frontend (Recomendado: Vercel)

1. Conecte seu repositório ao [Vercel](https://vercel.com)
2. Configure variáveis de ambiente
3. Deploy automático

### Alternativas

- **Fly.io**: Excelente suporte a Bun
- **Render**: Fácil de configurar
- **VPS**: Controle total com Docker

## 📝 Próximos Passos

### Em Desenvolvimento
- [ ] Frontend Next.js completo
- [ ] Autenticação BetterAuth integrada
- [ ] Dashboard do vendedor
- [ ] Painel administrativo
- [ ] Sistema de avaliações
- [ ] Notificações por email
- [ ] Upload de imagens
- [ ] Testes unitários e E2E

## 🐛 Problemas Comuns

### Erro de conexão com banco
```bash
# Certifique-se que o PostgreSQL está rodando
docker-compose ps

# Se necessário, recrie o container
docker-compose down
docker-compose up -d postgres
```

### Erro nas migrações
```bash
# Limpe as migrações antigas
rm -rf drizzle/

# Regenere
bun run db:generate
bun run db:migrate
```

### Porta em uso
```bash
# Mude a porta no .env
PORT=3002
```

## 📚 Documentação da API

Acesse http://localhost:3001/api-docs após iniciar o servidor para ver a documentação interativa Swagger.

### Endpoints Principais

- `GET /` - Informações da API
- `GET /health` - Health check
- `GET /api-docs` - Documentação Swagger
- `GET /api/v1/products` - Listar produtos
- `POST /api/v1/bookings` - Criar reserva
- `PUT /api/v1/bookings/:id/approve` - Aprovar reserva
- `POST /webhooks/stripe` - Webhook do Stripe

## 🔗 Links Úteis

- [Documentação Elysia](https://elysiajs.com)
- [Documentação Drizzle ORM](https://orm.drizzle.team)
- [Documentação BetterAuth](https://www.better-auth.com)
- [Documentação Stripe Connect](https://stripe.com/docs/connect)
- [Documentação Bun](https://bun.sh/docs)

## 📝 Licença

MIT License - veja LICENSE para detalhes

## 👥 Desenvolvido por

**Allan Rodrigues** - UNIVERSIDADE SANTO AMARO
Análise e Desenvolvimento de Sistemas - 2025

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
