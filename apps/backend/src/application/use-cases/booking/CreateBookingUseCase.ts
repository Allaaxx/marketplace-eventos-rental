import { Booking, BookingItem } from '@domain/entities/Booking';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IProductRepository } from '@domain/repositories/IProductRepository';
import { InventoryService } from '@application/services/InventoryService';
import { nanoid } from 'nanoid';

export interface CreateBookingInput {
  customerId: string;
  shopId: string;
  startDate: Date;
  endDate: Date;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
  deliveryAddress?: string;
}

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly productRepository: IProductRepository,
    private readonly inventoryService: InventoryService
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    // Validate dates
    if (input.startDate >= input.endDate) {
      throw new Error('Start date must be before end date');
    }

    if (input.startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // Calculate duration
    const duration = Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Fetch products and validate availability
    const items: Omit<BookingItem, 'id' | 'bookingId' | 'createdAt'>[] = [];
    let totalAmount = 0;

    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not available`);
      }

      if (product.shopId !== input.shopId) {
        throw new Error(`Product ${product.name} does not belong to this shop`);
      }

      // Check availability
      const isAvailable = await this.inventoryService.checkAvailability(
        item.productId,
        input.startDate,
        input.endDate,
        item.quantity
      );

      if (!isAvailable) {
        throw new Error(`Product ${product.name} is not available for the selected dates`);
      }

      // Calculate price
      const unitPrice = product.type === 'rental' && product.dailyRate
        ? parseFloat(product.dailyRate) * duration
        : parseFloat(product.price);

      const itemTotal = unitPrice * item.quantity;

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: itemTotal.toFixed(2),
        days: duration,
      });

      totalAmount += itemTotal;
    }

    // Create booking
    const booking = await this.bookingRepository.create({
      customerId: input.customerId,
      shopId: input.shopId,
      status: 'PENDING_VENDOR_REVIEW',
      startDate: input.startDate,
      endDate: input.endDate,
      totalAmount: totalAmount.toFixed(2),
      notes: input.notes,
      deliveryAddress: input.deliveryAddress,
    });

    return booking;
  }
}
