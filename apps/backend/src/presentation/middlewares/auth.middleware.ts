import { Elysia } from 'elysia';
import { db, users } from '@infrastructure/database';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export const authMiddleware = new Elysia()
  .derive(async ({ headers, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      throw new Error('Unauthorized: No token provided');
    }

    const token = authHeader.substring(7);

    try {
      // Simple token validation - in production use proper JWT validation
      // This is a placeholder for BetterAuth integration
      const userId = token; // Temporary: token is userId

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        set.status = 401;
        throw new Error('Unauthorized: User not found');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        } as AuthUser,
      };
    } catch (error) {
      set.status = 401;
      throw new Error('Unauthorized: Invalid token');
    }
  });

export const requireVendor = new Elysia()
  .use(authMiddleware)
  .derive(({ user, set }) => {
    if (user.role !== 'vendor' && user.role !== 'admin') {
      set.status = 403;
      throw new Error('Forbidden: Vendor access required');
    }
    return {};
  });

export const requireAdmin = new Elysia()
  .use(authMiddleware)
  .derive(({ user, set }) => {
    if (user.role !== 'admin') {
      set.status = 403;
      throw new Error('Forbidden: Admin access required');
    }
    return {};
  });
