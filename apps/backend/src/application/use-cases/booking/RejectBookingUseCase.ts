import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { BookingEntity } from '@domain/entities/Booking';

export interface RejectBookingInput {
  bookingId: string;
  vendorId: string;
  reason: string;
}

export class RejectBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly shopRepository: IShopRepository
  ) {}

  async execute(input: RejectBookingInput): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const bookingEntity = new BookingEntity(booking);

    if (!bookingEntity.canBeRejected()) {
      throw new Error('Booking cannot be rejected in current status');
    }

    const shop = await this.shopRepository.findById(booking.shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== input.vendorId) {
      throw new Error('Only shop owner can reject bookings');
    }

    const updatedBooking = await this.bookingRepository.update(booking.id, {
      status: 'REJECTED_BY_VENDOR',
      rejectionReason: input.reason,
    });

    return new BookingEntity(updatedBooking);
  }
}
