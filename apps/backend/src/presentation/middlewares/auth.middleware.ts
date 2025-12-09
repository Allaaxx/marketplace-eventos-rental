import { Context } from 'elysia';
import { auth } from '@infrastructure/auth/BetterAuthConfig';

export const authMiddleware = async (context: Context) => {
  const authHeader = context.request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const session = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } });

    if (!session) {
      throw new Error('Unauthorized: Invalid token');
    }

    return { user: session.user, session };
  } catch (error) {
    throw new Error('Unauthorized: Invalid token');
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return async (context: Context & { user?: any }) => {
    if (!context.user) {
      throw new Error('Unauthorized');
    }

    if (!allowedRoles.includes(context.user.role)) {
      throw new Error('Forbidden: Insufficient permissions');
    }
  };
};
