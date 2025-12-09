import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { BookingEntity } from '@domain/entities/Booking';
import { StripeService } from '@application/services/StripeService';

export interface CancelBookingInput {
  bookingId: string;
  customerId: string;
}

export class CancelBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly stripeService: StripeService
  ) {}

  async execute(input: CancelBookingInput): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.customerId !== input.customerId) {
      throw new Error('Only customer can cancel their own booking');
    }

    const bookingEntity = new BookingEntity(booking);

    if (!bookingEntity.canBeCancelled()) {
      throw new Error('Booking cannot be cancelled in current status');
    }

    // If payment was made, process refund
    if (booking.stripePaymentIntentId) {
      await this.stripeService.refundPayment(booking.stripePaymentIntentId);
    }

    const updatedBooking = await this.bookingRepository.update(booking.id, {
      status: 'CANCELLED_BY_CUSTOMER',
    });

    return new BookingEntity(updatedBooking);
  }
}
