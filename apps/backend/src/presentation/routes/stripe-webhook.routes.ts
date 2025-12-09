import { Elysia } from 'elysia';
import { StripeService } from '@application/services/StripeService';
import { BookingRepository } from '@infrastructure/repositories/BookingRepository';
import { AvailabilityService } from '@application/services/AvailabilityService';

const stripeService = new StripeService();
const bookingRepository = new BookingRepository();
const availabilityService = new AvailabilityService();

export const stripeWebhookRoutes = new Elysia({ prefix: '/webhooks' }).post(
  '/stripe',
  async ({ request }) => {
    try {
      const payload = await request.text();
      const signature = request.headers.get('stripe-signature');

      if (!signature) {
        return { error: 'No signature provided' };
      }

      const event = await stripeService.constructWebhookEvent(payload, signature);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const bookingId = session.metadata.bookingId;

          if (bookingId) {
            const booking = await bookingRepository.findById(bookingId);
            if (booking) {
              await bookingRepository.update(bookingId, {
                status: 'PAID_CONFIRMED',
                stripePaymentIntentId: session.payment_intent,
                paymentDate: new Date(),
              });

              // Reserve inventory
              if (booking.items) {
                for (const item of booking.items) {
                  await availabilityService.reserveInventory(
                    bookingId,
                    item.productId,
                    booking.startDate,
                    booking.endDate,
                    item.quantity
                  );
                }
              }
            }
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          // Handle failed payment
          console.log('Payment failed:', paymentIntent.id);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      return { error: error.message };
    }
  },
  {
    tags: ['Webhooks'],
  }
);
