import { Elysia, t } from 'elysia';
import { ShopRepository } from '@infrastructure/repositories/ShopRepository';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { CreateShopUseCase } from '@application/use-cases/shop/CreateShopUseCase';
import { StripeService } from '@application/services/StripeService';
import { authMiddleware } from '@presentation/middlewares/auth.middleware';

const shopRepository = new ShopRepository();
const userRepository = new UserRepository();
const stripeService = new StripeService();
const createShopUseCase = new CreateShopUseCase(shopRepository, userRepository);

export const shopRoutes = new Elysia({ prefix: '/shops' })
  .get(
    '/',
    async ({ query }) => {
      const shops = await shopRepository.list({
        isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0,
      });
      return { shops };
    },
    {
      query: t.Object({
        isActive: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      tags: ['Shops'],
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const shop = await shopRepository.findById(params.id);
      if (!shop) {
        return { error: 'Shop not found' };
      }
      return { shop };
    },
    {
      params: t.Object({ id: t.String() }),
      tags: ['Shops'],
    }
  )
  .get(
    '/slug/:slug',
    async ({ params }) => {
      const shop = await shopRepository.findBySlug(params.slug);
      if (!shop) {
        return { error: 'Shop not found' };
      }
      return { shop };
    },
    {
      params: t.Object({ slug: t.String() }),
      tags: ['Shops'],
    }
  )
  .post(
    '/',
    async ({ body, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const shop = await createShopUseCase.execute({
          ownerId: user.id,
          ...body,
        });

        return { success: true, shop: shop.toJSON() };
      } catch (error: any) {
        return { error: error.message };
      }
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
      tags: ['Shops'],
    }
  )
  .post(
    '/:id/stripe/onboard',
    async ({ params, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const shop = await shopRepository.findById(params.id);
        if (!shop) {
          return { error: 'Shop not found' };
        }

        if (shop.ownerId !== user.id) {
          return { error: 'Unauthorized' };
        }

        let stripeAccountId = shop.stripeAccountId;

        if (!stripeAccountId) {
          stripeAccountId = await stripeService.createConnectAccount(user.email);
          await shopRepository.update(shop.id, { stripeAccountId });
        }

        const onboardingUrl = await stripeService.createAccountLink(stripeAccountId, shop.id);

        return { success: true, onboardingUrl };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      tags: ['Shops'],
    }
  )
  .put(
    '/:id',
    async ({ params, body, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const shop = await shopRepository.findById(params.id);
        if (!shop) {
          return { error: 'Shop not found' };
        }

        if (shop.ownerId !== user.id) {
          return { error: 'Unauthorized' };
        }

        const updated = await shopRepository.update(params.id, body);
        return { success: true, shop: updated };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Partial(
        t.Object({
          name: t.String(),
          description: t.String(),
          address: t.String(),
          phone: t.String(),
          isActive: t.Boolean(),
        })
      ),
      tags: ['Shops'],
    }
  );
