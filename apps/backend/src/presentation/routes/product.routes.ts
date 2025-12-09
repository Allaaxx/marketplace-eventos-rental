import { Elysia, t } from 'elysia';
import { ProductController } from '@presentation/controllers/ProductController';
import { requireVendor, authMiddleware } from '@presentation/middlewares/auth.middleware';

const productController = new ProductController();

export const productRoutes = new Elysia({ prefix: '/products' })
  .get(
    '/',
    async ({ query }) => {
      return await productController.list(query);
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        category: t.Optional(t.String()),
        shopId: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
      detail: { tags: ['Products'] },
    }
  )
  .get(
    '/search',
    async ({ query }) => {
      return await productController.search(query.q);
    },
    {
      query: t.Object({
        q: t.String(),
      }),
      detail: { tags: ['Products'] },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      return await productController.getById(params.id);
    },
    {
      detail: { tags: ['Products'] },
    }
  )
  .use(requireVendor)
  .post(
    '/',
    async ({ body, user }) => {
      return await productController.create(body, user.id);
    },
    {
      body: t.Object({
        shopId: t.String(),
        name: t.String(),
        description: t.Optional(t.String()),
        type: t.Union([t.Literal('rental'), t.Literal('sale'), t.Literal('bundle')]),
        price: t.Number(),
        dailyRate: t.Optional(t.Number()),
        images: t.Optional(t.Array(t.String())),
        quantity: t.Number(),
        minRentalDays: t.Optional(t.Number()),
        maxRentalDays: t.Optional(t.Number()),
        category: t.Optional(t.String()),
        tags: t.Optional(t.Array(t.String())),
      }),
      detail: { tags: ['Products'] },
    }
  )
  .put(
    '/:id',
    async ({ params, body, user }) => {
      return await productController.update(params.id, body, user.id);
    },
    {
      detail: { tags: ['Products'] },
    }
  )
  .delete(
    '/:id',
    async ({ params, user }) => {
      return await productController.delete(params.id, user.id);
    },
    {
      detail: { tags: ['Products'] },
    }
  );
