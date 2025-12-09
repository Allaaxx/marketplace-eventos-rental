import { Booking } from '@domain/entities/Booking';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';

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

  async execute(input: RejectBookingInput): Promise<Booking> {
    const booking = await this.bookingRepository.findById(input.bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    const shop = await this.shopRepository.findById(booking.shopId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== input.vendorId) {
      throw new Error('You are not authorized to reject this booking');
    }

    if (booking.status !== 'PENDING_VENDOR_REVIEW') {
      throw new Error('Booking cannot be rejected in its current state');
    }

    const updatedBooking = await this.bookingRepository.update(booking.id, {
      status: 'REJECTED_BY_VENDOR',
      rejectionReason: input.reason,
    });

    return updatedBooking;
  }
}
