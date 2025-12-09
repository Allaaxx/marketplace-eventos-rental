import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

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
          description: 'API para marketplace de loca\u00e7\u00e3o de itens para eventos',
        },
        tags: [
          { name: 'Auth', description: 'Autentica\u00e7\u00e3o e autoriza\u00e7\u00e3o' },
          { name: 'Products', description: 'Gest\u00e3o de produtos' },
          { name: 'Bookings', description: 'Gest\u00e3o de reservas' },
          { name: 'Shops', description: 'Gest\u00e3o de lojas' },
          { name: 'Webhooks', description: 'Webhooks externos' },
        ],
      },
      path: '/api-docs',
    })
  )
  .get('/', () => ({
    message: 'Marketplace Eventos API',
    version: '1.0.0',
    status: 'running',
    docs: '/api-docs',
  }))
  .get('/health', () => ({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  }))
  // Routes will be added here
  .group('/api/v1', (app) =>
    app
      .get('/ping', () => ({ message: 'pong' }))
      // Auth routes
      .group('/auth', (app) =>
        app
          .post('/register', () => ({ message: 'Register endpoint' }), {
            detail: { tags: ['Auth'] },
          })
          .post('/login', () => ({ message: 'Login endpoint' }), {
            detail: { tags: ['Auth'] },
          })
          .post('/logout', () => ({ message: 'Logout endpoint' }), {
            detail: { tags: ['Auth'] },
          })
          .get('/me', () => ({ message: 'Get current user' }), {
            detail: { tags: ['Auth'] },
          })
      )
      // Product routes
      .group('/products', (app) =>
        app
          .get('/', () => ({ message: 'List products' }), {
            detail: { tags: ['Products'] },
          })
          .get('/:id', () => ({ message: 'Get product' }), {
            detail: { tags: ['Products'] },
          })
          .post('/', () => ({ message: 'Create product' }), {
            detail: { tags: ['Products'] },
          })
          .put('/:id', () => ({ message: 'Update product' }), {
            detail: { tags: ['Products'] },
          })
          .delete('/:id', () => ({ message: 'Delete product' }), {
            detail: { tags: ['Products'] },
          })
      )
      // Booking routes
      .group('/bookings', (app) =>
        app
          .get('/', () => ({ message: 'List bookings' }), {
            detail: { tags: ['Bookings'] },
          })
          .get('/:id', () => ({ message: 'Get booking' }), {
            detail: { tags: ['Bookings'] },
          })
          .post('/', () => ({ message: 'Create booking' }), {
            detail: { tags: ['Bookings'] },
          })
          .put('/:id/approve', () => ({ message: 'Approve booking' }), {
            detail: { tags: ['Bookings'] },
          })
          .put('/:id/reject', () => ({ message: 'Reject booking' }), {
            detail: { tags: ['Bookings'] },
          })
          .put('/:id/cancel', () => ({ message: 'Cancel booking' }), {
            detail: { tags: ['Bookings'] },
          })
      )
      // Shop routes
      .group('/shops', (app) =>
        app
          .get('/', () => ({ message: 'List shops' }), {
            detail: { tags: ['Shops'] },
          })
          .get('/:id', () => ({ message: 'Get shop' }), {
            detail: { tags: ['Shops'] },
          })
          .post('/', () => ({ message: 'Create shop' }), {
            detail: { tags: ['Shops'] },
          })
          .put('/:id', () => ({ message: 'Update shop' }), {
            detail: { tags: ['Shops'] },
          })
      )
  )
  // Stripe webhooks
  .post('/webhooks/stripe', () => ({ message: 'Stripe webhook' }), {
    detail: { tags: ['Webhooks'] },
  })
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Route not found' };
    }

    console.error('Error:', error);
    set.status = 500;
    return { error: 'Internal server error' };
  })
  .listen(process.env.PORT || 3001);

console.log(
  `\ud83d\ude80 Marketplace Backend running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `\ud83d\udcda API Documentation available at http://${app.server?.hostname}:${app.server?.port}/api-docs`
);

export type App = typeof app;
