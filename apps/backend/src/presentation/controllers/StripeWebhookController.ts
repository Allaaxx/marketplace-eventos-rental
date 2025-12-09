import { StripeService } from '@application/services/StripeService';
import { ProcessPaymentWebhookUseCase } from '@application/use-cases/booking/ProcessPaymentWebhookUseCase';
import { BookingRepository } from '@infrastructure/repositories/BookingRepository';
import { InventoryService } from '@application/services/InventoryService';

export class StripeWebhookController {
  private stripeService = new StripeService();
  private bookingRepository = new BookingRepository();
  private inventoryService = new InventoryService();

  async handleWebhook(payload: string | Buffer, signature: string) {
    const event = await this.stripeService.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const useCase = new ProcessPaymentWebhookUseCase(
          this.bookingRepository,
          this.inventoryService
        );
        return await useCase.execute(session as any);

      case 'account.updated':
        // Handle Stripe Connect account updates
        console.log('Account updated:', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}
