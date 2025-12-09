import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export interface CreateCheckoutSessionInput {
  bookingId: string;
  customerId: string;
  amount: number;
  platformFee: number;
  connectedAccountId: string;
}

export class StripeService {
  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<Stripe.Checkout.Session> {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Reserva de Evento',
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
          destination: input.connectedAccountId,
        },
      },
      metadata: {
        bookingId: input.bookingId,
        customerId: input.customerId,
      },
      success_url: `${process.env.FRONTEND_URL}/bookings/${input.bookingId}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/bookings/${input.bookingId}/cancel`,
    });

    return session;
  }

  async createConnectAccountLink(accountId: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/vendor/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/vendor/onboarding/complete`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

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

  async constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
