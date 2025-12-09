import { BookingRepository } from '@infrastructure/repositories/BookingRepository';
import { ProductRepository } from '@infrastructure/repositories/ProductRepository';
import { ShopRepository } from '@infrastructure/repositories/ShopRepository';
import { CreateBookingUseCase } from '@application/use-cases/booking/CreateBookingUseCase';
import { ApproveBookingUseCase } from '@application/use-cases/booking/ApproveBookingUseCase';
import { RejectBookingUseCase } from '@application/use-cases/booking/RejectBookingUseCase';
import { InventoryService } from '@application/services/InventoryService';
import { StripeService } from '@application/services/StripeService';

export class BookingController {
  private bookingRepository = new BookingRepository();
  private productRepository = new ProductRepository();
  private shopRepository = new ShopRepository();
  private inventoryService = new InventoryService();
  private stripeService = new StripeService();

  async create(data: any, customerId: string) {
    const useCase = new CreateBookingUseCase(
      this.bookingRepository,
      this.productRepository,
      this.inventoryService
    );

    return await useCase.execute({
      customerId,
      shopId: data.shopId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      items: data.items,
      notes: data.notes,
      deliveryAddress: data.deliveryAddress,
    });
  }

  async approve(bookingId: string, vendorId: string) {
    const useCase = new ApproveBookingUseCase(
      this.bookingRepository,
      this.shopRepository,
      this.stripeService
    );

    return await useCase.execute({ bookingId, vendorId });
  }

  async reject(bookingId: string, vendorId: string, reason: string) {
    const useCase = new RejectBookingUseCase(
      this.bookingRepository,
      this.shopRepository
    );

    return await useCase.execute({ bookingId, vendorId, reason });
  }

  async getById(id: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  async listByCustomer(customerId: string) {
    return await this.bookingRepository.findByCustomerId(customerId);
  }

  async listByShop(shopId: string) {
    return await this.bookingRepository.findByShopId(shopId);
  }

  async list(filters?: any) {
    return await this.bookingRepository.list(filters);
  }

  async cancel(bookingId: string, customerId: string) {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.customerId !== customerId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (!['PENDING_VENDOR_REVIEW', 'APPROVED_AWAITING_PAYMENT'].includes(booking.status)) {
      throw new Error('Booking cannot be cancelled in its current state');
    }

    return await this.bookingRepository.update(bookingId, {
      status: 'CANCELLED_BY_CUSTOMER',
    });
  }
}
