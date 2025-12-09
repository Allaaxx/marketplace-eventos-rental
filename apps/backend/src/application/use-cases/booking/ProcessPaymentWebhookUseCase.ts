import { Booking } from '@domain/entities/Booking';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { InventoryService } from '@application/services/InventoryService';
import Stripe from 'stripe';

export class ProcessPaymentWebhookUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly inventoryService: InventoryService
  ) {}

  async execute(session: Stripe.Checkout.Session): Promise<Booking> {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      throw new Error('Booking ID not found in session metadata');
    }

    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'APPROVED_AWAITING_PAYMENT') {
      throw new Error('Booking is not awaiting payment');
    }

    // Update booking status
    const updatedBooking = await this.bookingRepository.update(booking.id, {
      status: 'PAID_CONFIRMED',
      stripePaymentIntentId: session.payment_intent as string,
      paymentDate: new Date(),
    });

    // Reserve inventory
    await this.inventoryService.reserveInventory(
      booking.id,
      booking.startDate,
      booking.endDate
    );

    return updatedBooking;
  }
}
