import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from '@presentation/routes/auth.routes';
import { productRoutes } from '@presentation/routes/product.routes';
import { bookingRoutes } from '@presentation/routes/booking.routes';
import { shopRoutes } from '@presentation/routes/shop.routes';
import { stripeWebhookRoutes } from '@presentation/routes/stripe-webhook.routes';

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Marketplace Eventos API',
          version: '1.0.0',
          description: 'API para marketplace de locação de itens para eventos',
        },
        tags: [
          { name: 'Auth', description: 'Autenticação e autorização' },
          { name: 'Products', description: 'Gestão de produtos' },
          { name: 'Bookings', description: 'Gestão de reservas' },
          { name: 'Shops', description: 'Gestão de lojas' },
          { name: 'Webhooks', description: 'Webhooks externos' },
        ],
      },
    })
  )
  .get('/', () => ({
    message: 'Marketplace Eventos API',
    version: '1.0.0',
    status: 'running',
  }))
  .get('/health', () => ({ status: 'healthy', timestamp: new Date().toISOString() }))
  .use(authRoutes)
  .use(productRoutes)
  .use(bookingRoutes)
  .use(shopRoutes)
  .use(stripeWebhookRoutes)
  .listen(process.env.PORT || 3001);

console.log(
  `🚀 Marketplace Backend running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
