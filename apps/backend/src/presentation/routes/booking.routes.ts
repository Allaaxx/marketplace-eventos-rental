import { Elysia, t } from 'elysia';
import { BookingRepository } from '@infrastructure/repositories/BookingRepository';
import { ProductRepository } from '@infrastructure/repositories/ProductRepository';
import { ShopRepository } from '@infrastructure/repositories/ShopRepository';
import { CreateBookingUseCase } from '@application/use-cases/booking/CreateBookingUseCase';
import { ApproveBookingUseCase } from '@application/use-cases/booking/ApproveBookingUseCase';
import { RejectBookingUseCase } from '@application/use-cases/booking/RejectBookingUseCase';
import { CancelBookingUseCase } from '@application/use-cases/booking/CancelBookingUseCase';
import { StripeService } from '@application/services/StripeService';
import { AvailabilityService } from '@application/services/AvailabilityService';
import { authMiddleware } from '@presentation/middlewares/auth.middleware';
import { BookingMapper } from '@application/dtos/BookingDTO';

const bookingRepository = new BookingRepository();
const productRepository = new ProductRepository();
const shopRepository = new ShopRepository();
const stripeService = new StripeService();
const availabilityService = new AvailabilityService();

const createBookingUseCase = new CreateBookingUseCase(
  bookingRepository,
  productRepository,
  availabilityService
);
const approveBookingUseCase = new ApproveBookingUseCase(
  bookingRepository,
  shopRepository,
  stripeService
);
const rejectBookingUseCase = new RejectBookingUseCase(bookingRepository, shopRepository);
const cancelBookingUseCase = new CancelBookingUseCase(bookingRepository, stripeService);

export const bookingRoutes = new Elysia({ prefix: '/bookings' })
  .get(
    '/',
    async ({ query, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const bookings = await bookingRepository.list({
          customerId: user.role === 'customer' ? user.id : query.customerId,
          shopId: query.shopId,
          status: query.status,
          limit: query.limit ? parseInt(query.limit) : 50,
          offset: query.offset ? parseInt(query.offset) : 0,
        });

        return { bookings: bookings.map(BookingMapper.toDTO) };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      query: t.Object({
        customerId: t.Optional(t.String()),
        shopId: t.Optional(t.String()),
        status: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      tags: ['Bookings'],
    }
  )
  .get(
    '/:id',
    async ({ params, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const booking = await bookingRepository.findById(params.id);
        if (!booking) {
          return { error: 'Booking not found' };
        }

        // Check permissions
        if (booking.customerId !== user.id && user.role !== 'vendor' && user.role !== 'admin') {
          return { error: 'Unauthorized' };
        }

        return { booking: BookingMapper.toDTO(booking) };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      tags: ['Bookings'],
    }
  )
  .post(
    '/',
    async ({ body, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const booking = await createBookingUseCase.execute({
          customerId: user.id,
          shopId: body.shopId,
          items: body.items,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          deliveryAddress: body.deliveryAddress,
          notes: body.notes,
        });

        return { success: true, booking: BookingMapper.toDTO(booking.toJSON()) };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        shopId: t.String(),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
          })
        ),
        startDate: t.String(),
        endDate: t.String(),
        deliveryAddress: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
      tags: ['Bookings'],
    }
  )
  .post(
    '/:id/approve',
    async ({ params, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const result = await approveBookingUseCase.execute({
          bookingId: params.id,
          vendorId: user.id,
        });

        return {
          success: true,
          booking: BookingMapper.toDTO(result.booking.toJSON()),
          checkoutUrl: result.checkoutUrl,
        };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      tags: ['Bookings'],
    }
  )
  .post(
    '/:id/reject',
    async ({ params, body, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const booking = await rejectBookingUseCase.execute({
          bookingId: params.id,
          vendorId: user.id,
          reason: body.reason,
        });

        return { success: true, booking: BookingMapper.toDTO(booking.toJSON()) };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        reason: t.String(),
      }),
      tags: ['Bookings'],
    }
  )
  .post(
    '/:id/cancel',
    async ({ params, request }) => {
      try {
        const { user } = await authMiddleware({ request } as any);

        const booking = await cancelBookingUseCase.execute({
          bookingId: params.id,
          customerId: user.id,
        });

        return { success: true, booking: BookingMapper.toDTO(booking.toJSON()) };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      tags: ['Bookings'],
    }
  );
