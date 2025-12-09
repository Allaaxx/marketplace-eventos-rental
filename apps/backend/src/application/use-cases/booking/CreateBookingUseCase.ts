import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IProductRepository } from '@domain/repositories/IProductRepository';
import { BookingEntity } from '@domain/entities/Booking';
import { DateRange } from '@domain/value-objects/DateRange';
import { AvailabilityService } from '@application/services/AvailabilityService';

export interface CreateBookingInput {
  customerId: string;
  shopId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  startDate: Date;
  endDate: Date;
  deliveryAddress?: string;
  notes?: string;
}

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly productRepository: IProductRepository,
    private readonly availabilityService: AvailabilityService
  ) {}

  async execute(input: CreateBookingInput): Promise<BookingEntity> {
    const dateRange = new DateRange(input.startDate, input.endDate);
    const days = dateRange.getDurationInDays();

    // Validate availability for all products
    for (const item of input.items) {
      const isAvailable = await this.availabilityService.checkAvailability(
        item.productId,
        input.startDate,
        input.endDate,
        item.quantity
      );

      if (!isAvailable) {
        throw new Error(`Product ${item.productId} is not available for the selected dates`);
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const bookingItems = [];

    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.shopId !== input.shopId) {
        throw new Error('All products must belong to the same shop');
      }

      const unitPrice = product.type === 'rental' && product.dailyRate
        ? parseFloat(product.dailyRate) * days
        : parseFloat(product.price);

      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      bookingItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        days: product.type === 'rental' ? days : 1,
      });
    }

    // Create booking
    const booking = await this.bookingRepository.create({
      customerId: input.customerId,
      shopId: input.shopId,
      status: 'PENDING_VENDOR_REVIEW',
      startDate: input.startDate,
      endDate: input.endDate,
      totalAmount: totalAmount.toFixed(2),
      deliveryAddress: input.deliveryAddress,
      notes: input.notes,
      items: bookingItems,
    });

    return new BookingEntity(booking);
  }
}
