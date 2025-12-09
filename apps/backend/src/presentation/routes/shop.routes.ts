import { Elysia, t } from 'elysia';
import { ShopController } from '@presentation/controllers/ShopController';
import { requireVendor, authMiddleware } from '@presentation/middlewares/auth.middleware';

const shopController = new ShopController();

export const shopRoutes = new Elysia({ prefix: '/shops' })
  .get(
    '/',
    async ({ query }) => {
      return await shopController.list(query);
    },
    {
      detail: { tags: ['Shops'] },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      return await shopController.getById(params.id);
    },
    {
      detail: { tags: ['Shops'] },
    }
  )
  .get(
    '/slug/:slug',
    async ({ params }) => {
      return await shopController.getBySlug(params.slug);
    },
    {
      detail: { tags: ['Shops'] },
    }
  )
  .use(requireVendor)
  .post(
    '/',
    async ({ body, user }) => {
      return await shopController.create(body, user.id);
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        address: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        zipCode: t.Optional(t.String()),
        phone: t.Optional(t.String()),
      }),
      detail: { tags: ['Shops'] },
    }
  )
  .put(
    '/:id',
    async ({ params, body, user }) => {
      return await shopController.update(params.id, body, user.id);
    },
    {
      detail: { tags: ['Shops'] },
    }
  )
  .post(
    '/:id/stripe-onboarding',
    async ({ params, user }) => {
      return await shopController.initiateStripeOnboarding(params.id, user.id);
    },
    {
      detail: { tags: ['Shops'] },
    }
  );
