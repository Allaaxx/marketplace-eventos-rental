# Marketplace de Locação para Eventos

Marketplace especializado em locação de decoração e itens para eventos como casamentos, aniversários e festas temáticas.

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 14** - Framework React com App Router
- **Tailwind CSS** - Estilização utilitária
- **TypeScript** - Tipagem estática
- **React Query** - Gerenciamento de estado servidor

### Backend
- **Elysia** - Framework web ultrarrápido para Bun
- **Bun** - Runtime JavaScript de alta performance
- **TypeScript** - Tipagem estática

### Database & ORM
- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - Type-safe ORM

### Autenticação & Pagamentos
- **BetterAuth** - Solução de autenticação moderna
- **Stripe Connect** - Processamento de pagamentos multi-vendedor

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração local

## 🏗️ Arquitetura

O projeto segue **Arquitetura Hexagonal (Ports & Adapters)**:

```
apps/
├── frontend/          # Next.js application
└── backend/           # Elysia API
    ├── src/
    │   ├── domain/           # Entidades e lógica de negócio
    │   ├── application/      # Casos de uso e services
    │   ├── infrastructure/   # Adaptadores (DB, APIs externas)
    │   └── presentation/     # Controllers e rotas
```

## 📦 Funcionalidades Principais

### Para Clientes
- Busca e navegação de produtos de locação
- Solicitação de reservas com seleção de datas
- Carrinho com produtos de locação e venda
- Pagamento via Stripe após aprovação do vendedor
- Acompanhamento de status das reservas

### Para Vendedores
- Dashboard de gerenciamento
- Aprovação/rejeição de reservas
- Gestão de estoque e disponibilidade
- Produtos simples, bundles e itens de venda
- Calendário de locações
- Recebimento via Stripe Connect

### Gestão de Produtos
- **Produtos de Locação**: itens alugáveis por período
- **Produtos de Venda**: itens complementares
- **Bundles**: kits compostos com componentes compartilhados

### Sistema de Booking
Estados do fluxo:
- `PENDING_VENDOR_REVIEW` - Aguardando aprovação
- `APPROVED_AWAITING_PAYMENT` - Aprovado, aguardando pagamento
- `PAID_CONFIRMED` - Pagamento confirmado
- `ACTIVE` - Em uso
- `RETURNED` - Devolvido
- `COMPLETED` - Finalizado
- `REJECTED_BY_VENDOR` - Rejeitado
- `CANCELLED_BY_CUSTOMER` - Cancelado

## 🛠️ Setup do Projeto

### Pré-requisitos
- Node.js 18+
- Bun 1.0+
- Docker & Docker Compose
- Conta Stripe (para pagamentos)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Allaaxx/marketplace-eventos-rental.git
cd marketplace-eventos-rental
```

2. Instale as dependências:
```bash
bun install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

4. Inicie os containers:
```bash
docker-compose up -d
```

5. Execute as migrações do banco:
```bash
cd apps/backend
bun run db:migrate
```

6. Inicie os serviços de desenvolvimento:
```bash
# Terminal 1 - Backend
cd apps/backend
bun run dev

# Terminal 2 - Frontend
cd apps/frontend
bun run dev
```

### Acessos
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 📊 Modelo de Dados

### Principais Entidades
- **Users**: Usuários (clientes e vendedores)
- **Shops**: Lojas dos vendedores
- **Products**: Produtos (rental/sale/bundle)
- **ProductComponents**: Componentes dos bundles
- **Bookings**: Reservas/pedidos
- **BookingItems**: Itens de cada reserva
- **InventoryCalendar**: Calendário de disponibilidade
- **Reviews**: Avaliações
- **Payouts**: Pagamentos aos vendedores

## 🔐 Autenticação

O sistema utiliza BetterAuth com suporte a:
- Email/Password
- OAuth (Google, GitHub)
- Sessões seguras
- Roles: `customer`, `vendor`, `admin`

## 💳 Pagamentos

Integração com Stripe Connect:
- Onboarding de vendedores
- Split de pagamentos (taxa da plataforma)
- Webhooks para confirmação
- Pagamento liberado apenas após aprovação do vendedor

## 🚢 Deploy

### Opções de Deploy

**Frontend (Next.js)**:
- Vercel (recomendado)
- Netlify
- Railway

**Backend (Elysia + Bun)**:
- Railway
- Fly.io
- VPS com Docker

**Database**:
- Railway PostgreSQL
- Supabase
- AWS RDS

## 📝 Licença

MIT License

## 👥 Contato

Desenvolvido para UNIVERSIDADE SANTO AMARO - Análise e Desenvolvimento de Sistemas
