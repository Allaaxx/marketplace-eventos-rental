import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export interface CreateCheckoutSessionDTO {
  bookingId: string;
  amount: number;
  vendorStripeAccountId: string;
  platformFee: number;
}

export class StripeService {
  /**
   * Create a Stripe Checkout Session for booking payment
   */
  async createCheckoutSession(dto: CreateCheckoutSessionDTO): Promise<Stripe.Checkout.Session> {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Reserva de Evento',
              description: `Booking ID: ${dto.bookingId}`,
            },
            unit_amount: Math.round(dto.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(dto.platformFee * 100),
        transfer_data: {
          destination: dto.vendorStripeAccountId,
        },
      },
      metadata: {
        bookingId: dto.bookingId,
      },
      success_url: `${process.env.FRONTEND_URL}/bookings/${dto.bookingId}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/bookings/${dto.bookingId}/cancelled`,
    });

    return session;
  }

  /**
   * Create a Stripe Connect account for a vendor
   */
  async createConnectAccount(email: string): Promise<Stripe.Account> {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  }

  /**
   * Create an account link for Stripe Connect onboarding
   */
  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(sessionId: string): Promise<{ bookingId: string; paymentIntentId: string }> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      bookingId: session.metadata?.bookingId || '',
      paymentIntentId: session.payment_intent as string,
    };
  }
}
