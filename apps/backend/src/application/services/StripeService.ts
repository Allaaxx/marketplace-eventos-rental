import Stripe from 'stripe';

interface CreateCheckoutSessionInput {
  bookingId: string;
  amount: number;
  platformFee: number;
  stripeAccountId: string;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    this.stripe = new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' });
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Reserva de Locação',
              description: `Booking ID: ${input.bookingId}`,
            },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(input.platformFee * 100),
        transfer_data: {
          destination: input.stripeAccountId,
        },
      },
      metadata: {
        bookingId: input.bookingId,
      },
      success_url: `${process.env.FRONTEND_URL}/bookings/${input.bookingId}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/bookings/${input.bookingId}/cancelled`,
    });

    return session;
  }

  async createConnectAccount(email: string): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account.id;
  }

  async createAccountLink(accountId: string, shopId: string): Promise<string> {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/shops/${shopId}/stripe/refresh`,
      return_url: `${process.env.FRONTEND_URL}/shops/${shopId}/stripe/return`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  }

  async constructWebhookEvent(payload: string, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
