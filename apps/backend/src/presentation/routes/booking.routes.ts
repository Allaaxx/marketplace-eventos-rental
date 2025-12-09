import { Elysia, t } from 'elysia';
import { BookingController } from '@presentation/controllers/BookingController';
import { authMiddleware, requireVendor } from '@presentation/middlewares/auth.middleware';

const bookingController = new BookingController();

export const bookingRoutes = new Elysia({ prefix: '/bookings' })
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, user }) => {
      return await bookingController.create(body, user.id);
    },
    {
      body: t.Object({
        shopId: t.String(),
        startDate: t.String(),
        endDate: t.String(),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
          })
        ),
        notes: t.Optional(t.String()),
        deliveryAddress: t.Optional(t.String()),
      }),
      detail: { tags: ['Bookings'] },
    }
  )
  .get(
    '/',
    async ({ query }) => {
      return await bookingController.list(query);
    },
    {
      detail: { tags: ['Bookings'] },
    }
  )
  .get(
    '/my-bookings',
    async ({ user }) => {
      return await bookingController.listByCustomer(user.id);
    },
    {
      detail: { tags: ['Bookings'] },
    }
  )
  .get(
    '/:id',
    async ({ params }) => {
      return await bookingController.getById(params.id);
    },
    {
      detail: { tags: ['Bookings'] },
    }
  )
  .post(
    '/:id/cancel',
    async ({ params, user }) => {
      return await bookingController.cancel(params.id, user.id);
    },
    {
      detail: { tags: ['Bookings'] },
    }
  )
  .use(requireVendor)
  .post(
    '/:id/approve',
    async ({ params, user }) => {
      return await bookingController.approve(params.id, user.id);
    },
    {
      detail: { tags: ['Bookings'] },
    }
  )
  .post(
    '/:id/reject',
    async ({ params, body, user }) => {
      return await bookingController.reject(params.id, user.id, body.reason);
    },
    {
      body: t.Object({
        reason: t.String(),
      }),
      detail: { tags: ['Bookings'] },
    }
  );
