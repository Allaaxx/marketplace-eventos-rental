import { Elysia, t } from 'elysia';
import { auth } from '@infrastructure/auth/BetterAuthConfig';
import { UserRepository } from '@infrastructure/repositories/UserRepository';

const userRepository = new UserRepository();

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post(
    '/register',
    async ({ body }) => {
      try {
        const existingUser = await userRepository.findByEmail(body.email);
        if (existingUser) {
          return { error: 'Email already registered' };
        }

        const user = await auth.api.signUpEmail({
          body: {
            email: body.email,
            password: body.password,
            name: body.name,
          },
        });

        // Update user role if vendor
        if (body.role === 'vendor') {
          await userRepository.update(user.user.id, { role: 'vendor' });
        }

        return { success: true, user: user.user, session: user.session };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        name: t.String(),
        role: t.Optional(t.Union([t.Literal('customer'), t.Literal('vendor')])),
      }),
      tags: ['Auth'],
    }
  )
  .post(
    '/login',
    async ({ body }) => {
      try {
        const result = await auth.api.signInEmail({
          body: {
            email: body.email,
            password: body.password,
          },
        });

        return { success: true, user: result.user, session: result.session };
      } catch (error: any) {
        return { error: 'Invalid credentials' };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
      tags: ['Auth'],
    }
  )
  .post(
    '/logout',
    async ({ request }) => {
      try {
        await auth.api.signOut({ headers: request.headers });
        return { success: true };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      tags: ['Auth'],
    }
  )
  .get(
    '/session',
    async ({ request }) => {
      try {
        const session = await auth.api.getSession({ headers: request.headers });
        return { session };
      } catch (error) {
        return { session: null };
      }
    },
    {
      tags: ['Auth'],
    }
  );
