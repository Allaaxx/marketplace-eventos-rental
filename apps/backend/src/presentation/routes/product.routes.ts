import { Elysia, t } from 'elysia';
import { ProductRepository } from '@infrastructure/repositories/ProductRepository';
import { ShopRepository } from '@infrastructure/repositories/ShopRepository';
import { CreateProductUseCase } from '@application/use-cases/product/CreateProductUseCase';
import { authMiddleware } from '@presentation/middlewares/auth.middleware';

const productRepository = new ProductRepository();
const shopRepository = new ShopRepository();
const createProductUseCase = new CreateProductUseCase(productRepository, shopRepository);

export const productRoutes = new Elysia({ prefix: '/products' })
  .get(
    '/',
    async ({ query }) => {
      const products = await productRepository.list({
        type: query.type,
        category: query.category,
        shopId: query.shopId,
        isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0,
      });
      return { products };
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        category: t.Optional(t.String()),
        shopId: t.Optional(t.String()),
        isActive: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      tags: ['Products'],
    }
  )
  .get(
    '/search',
    async ({ query }) => {
      const products = await productRepository.search(query.q);
      return { products };
    },
    {
      query: t.Object({
        q: t.String(),
      }),
      tags: ['Products'],
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      const product = await productRepository.findById(params.id);
      if (!product) {
        return { error: 'Product not found' };
      }
      return { product };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      tags: ['Products'],
    }
  )
  .post(
    '/',
    async ({ body, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const product = await createProductUseCase.execute({
          ...body,
          vendorId: user.id,
        });

        return { success: true, product: product.toJSON() };
      } catch (error: any) {
        return { error: error.message };
      }
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
        quantity: t.Optional(t.Number()),
        minRentalDays: t.Optional(t.Number()),
        maxRentalDays: t.Optional(t.Number()),
        category: t.Optional(t.String()),
        tags: t.Optional(t.Array(t.String())),
        components: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              description: t.Optional(t.String()),
              quantity: t.Number(),
              isShared: t.Boolean(),
            })
          )
        ),
      }),
      tags: ['Products'],
    }
  )
  .put(
    '/:id',
    async ({ params, body, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const product = await productRepository.findById(params.id);
        if (!product) {
          return { error: 'Product not found' };
        }

        const shop = await shopRepository.findById(product.shopId);
        if (!shop || shop.ownerId !== user.id) {
          return { error: 'Unauthorized' };
        }

        const updated = await productRepository.update(params.id, body);
        return { success: true, product: updated };
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
          price: t.String(),
          dailyRate: t.String(),
          quantity: t.Number(),
          isActive: t.Boolean(),
        })
      ),
      tags: ['Products'],
    }
  )
  .delete(
    '/:id',
    async ({ params, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const product = await productRepository.findById(params.id);
        if (!product) {
          return { error: 'Product not found' };
        }

        const shop = await shopRepository.findById(product.shopId);
        if (!shop || shop.ownerId !== user.id) {
          return { error: 'Unauthorized' };
        }

        await productRepository.delete(params.id);
        return { success: true };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      tags: ['Products'],
    }
  );
