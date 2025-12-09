import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { Booking, BookingEntity } from '@domain/entities/Booking';
import { StripeService } from '@application/services/StripeService';

export interface ApproveBookingDTO {
  bookingId: string;
  vendorId: string;
}

export class ApproveBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private shopRepository: IShopRepository,
    private stripeService: StripeService
  ) {}

  async execute(dto: ApproveBookingDTO): Promise<Booking> {
    // Get booking
    const booking = await this.bookingRepository.findById(dto.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const bookingEntity = new BookingEntity(booking);

    // Validate booking can be approved
    if (!bookingEntity.canBeApproved()) {
      throw new Error(`Booking cannot be approved. Current status: ${booking.status}`);
    }

    // Validate vendor owns the shop
    const shop = await this.shopRepository.findById(booking.shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== dto.vendorId) {
      throw new Error('Unauthorized: You do not own this shop');
    }

    if (!shop.stripeOnboardingComplete) {
      throw new Error('Shop has not completed Stripe onboarding');
    }

    // Create Stripe Checkout Session
    const checkoutSession = await this.stripeService.createCheckoutSession({
      bookingId: booking.id,
      amount: parseFloat(booking.totalAmount),
      vendorStripeAccountId: shop.stripeAccountId!,
      platformFee: parseFloat(booking.platformFee!),
    });

    // Update booking status
    const updatedBooking = await this.bookingRepository.update(dto.bookingId, {
      status: 'APPROVED_AWAITING_PAYMENT',
      stripeCheckoutSessionId: checkoutSession.id,
    });

    // TODO: Send notification to customer with payment link

    return updatedBooking;
  }
}
