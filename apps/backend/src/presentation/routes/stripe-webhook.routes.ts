import { Elysia } from 'elysia';
import { StripeWebhookController } from '@presentation/controllers/StripeWebhookController';

const webhookController = new StripeWebhookController();

export const stripeWebhookRoutes = new Elysia({ prefix: '/webhooks' })
  .post('/stripe', async ({ body, headers }) => {
    const signature = headers['stripe-signature'];

    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    return await webhookController.handleWebhook(
      JSON.stringify(body),
      signature
    );
  });
