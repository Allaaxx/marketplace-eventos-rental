import { Booking } from '@domain/entities/Booking';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
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

  async execute(input: ApproveBookingInput): Promise<{ booking: Booking; checkoutUrl: string }> {
    const booking = await this.bookingRepository.findById(input.bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    const shop = await this.shopRepository.findById(booking.shopId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== input.vendorId) {
      throw new Error('You are not authorized to approve this booking');
    }

    if (booking.status !== 'PENDING_VENDOR_REVIEW') {
      throw new Error('Booking cannot be approved in its current state');
    }

    if (!shop.stripeOnboardingComplete || !shop.stripeAccountId) {
      throw new Error('Shop has not completed Stripe onboarding');
    }

    // Calculate platform fee (10%)
    const totalAmount = parseFloat(booking.totalAmount);
    const platformFee = totalAmount * 0.1;
    const vendorAmount = totalAmount - platformFee;

    // Create Stripe Checkout Session
    const checkoutSession = await this.stripeService.createCheckoutSession({
      bookingId: booking.id,
      customerId: booking.customerId,
      amount: totalAmount,
      platformFee,
      connectedAccountId: shop.stripeAccountId,
    });

    // Update booking
    const updatedBooking = await this.bookingRepository.update(booking.id, {
      status: 'APPROVED_AWAITING_PAYMENT',
      platformFee: platformFee.toFixed(2),
      vendorAmount: vendorAmount.toFixed(2),
      stripeCheckoutSessionId: checkoutSession.id,
    });

    return {
      booking: updatedBooking,
      checkoutUrl: checkoutSession.url,
    };
  }
}
