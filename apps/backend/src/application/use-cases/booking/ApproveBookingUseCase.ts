import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { BookingEntity } from '@domain/entities/Booking';
import { StripeService } from '@application/services/StripeService';

export interface ApproveBookingInput {
  bookingId: string;
  vendorId: string;
}

export class ApproveBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly shopRepository: IShopRepository,
    private readonly stripeService: StripeService
  ) {}

  async execute(input: ApproveBookingInput): Promise<{ booking: BookingEntity; checkoutUrl: string }> {
    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const bookingEntity = new BookingEntity(booking);

    if (!bookingEntity.canBeApproved()) {
      throw new Error('Booking cannot be approved in current status');
    }

    const shop = await this.shopRepository.findById(booking.shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== input.vendorId) {
      throw new Error('Only shop owner can approve bookings');
    }

    if (!shop.stripeOnboardingComplete) {
      throw new Error('Shop must complete Stripe onboarding first');
    }

    // Calculate platform fee (10%)
    const totalAmount = parseFloat(booking.totalAmount);
    const platformFee = totalAmount * 0.1;
    const vendorAmount = totalAmount - platformFee;

    // Create Stripe checkout session
    const checkoutSession = await this.stripeService.createCheckoutSession({
      bookingId: booking.id,
      amount: totalAmount,
      platformFee,
      stripeAccountId: shop.stripeAccountId!,
    });

    // Update booking status
    const updatedBooking = await this.bookingRepository.update(booking.id, {
      status: 'APPROVED_AWAITING_PAYMENT',
      platformFee: platformFee.toFixed(2),
      vendorAmount: vendorAmount.toFixed(2),
      stripeCheckoutSessionId: checkoutSession.id,
    });

    return {
      booking: new BookingEntity(updatedBooking),
      checkoutUrl: checkoutSession.url!,
    };
  }
}
