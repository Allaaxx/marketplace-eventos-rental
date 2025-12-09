import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { Booking, BookingEntity } from '@domain/entities/Booking';

export interface RejectBookingDTO {
  bookingId: string;
  vendorId: string;
  reason: string;
}

export class RejectBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private shopRepository: IShopRepository
  ) {}

  async execute(dto: RejectBookingDTO): Promise<Booking> {
    // Get booking
    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const bookingEntity = new BookingEntity(booking);

    // Validate booking can be rejected
    if (!bookingEntity.canBeRejected()) {
      throw new Error(`Booking cannot be rejected. Current status: ${booking.status}`);
    }

    // Validate vendor owns the shop
    const shop = await this.shopRepository.findById(booking.shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== dto.vendorId) {
      throw new Error('Unauthorized: You do not own this shop');
    }

    // Update booking status
    const updatedBooking = await this.bookingRepository.update(dto.bookingId, {
      status: 'REJECTED_BY_VENDOR',
      rejectionReason: dto.reason,
    });

    // TODO: Send notification to customer

    return updatedBooking;
  }
}
