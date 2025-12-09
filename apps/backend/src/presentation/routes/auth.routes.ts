import { Elysia, t } from 'elysia';
import { AuthController } from '@presentation/controllers/AuthController';
import { authMiddleware } from '@presentation/middlewares/auth.middleware';

const authController = new AuthController();

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body }) => {
      return await authController.register(body);
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        name: t.String({ minLength: 2 }),
        password: t.String({ minLength: 6 }),
        role: t.Optional(t.Union([t.Literal('customer'), t.Literal('vendor')])),
      }),
      detail: { tags: ['Auth'] },
    }
  )
  .post(
    '/login',
    async ({ body }) => {
      return await authController.login(body);
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
      detail: { tags: ['Auth'] },
    }
  )
  .use(authMiddleware)
  .get(
    '/me',
    async ({ user }) => {
      return await authController.me(user.id);
    },
    {
      detail: { tags: ['Auth'] },
    }
  );
