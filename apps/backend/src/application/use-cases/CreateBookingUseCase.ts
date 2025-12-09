import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { IProductRepository } from '@domain/repositories/IProductRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { Booking } from '@domain/entities/Booking';
import { DateRange } from '@domain/value-objects/DateRange';
import { Money } from '@domain/value-objects/Money';
import { AvailabilityService } from '@application/services/AvailabilityService';

export interface CreateBookingDTO {
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
    private bookingRepository: IBookingRepository,
    private productRepository: IProductRepository,
    private shopRepository: IShopRepository,
    private availabilityService: AvailabilityService
  ) {}

  async execute(dto: CreateBookingDTO): Promise<Booking> {
    // Validate shop exists and is active
    const shop = await this.shopRepository.findById(dto.shopId);
    if (!shop || !shop.isActive) {
      throw new Error('Shop not found or inactive');
    }

    // Validate date range
    const dateRange = new DateRange(dto.startDate, dto.endDate);
    const days = dateRange.getDurationInDays();

    // Validate products and calculate total
    let totalAmount = new Money(0);
    const bookingItems = [];

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);
      
      if (!product || !product.isActive) {
        throw new Error(`Product ${item.productId} not found or inactive`);
      }

      if (product.shopId !== dto.shopId) {
        throw new Error(`Product ${item.productId} does not belong to this shop`);
      }

      // Check availability
      const isAvailable = await this.availabilityService.checkAvailability(
        item.productId,
        dto.startDate,
        dto.endDate,
        item.quantity
      );

      if (!isAvailable) {
        throw new Error(`Product ${product.name} is not available for the selected dates`);
      }

      // Calculate price
      const unitPrice = product.type === 'rental' && product.dailyRate
        ? parseFloat(product.dailyRate) * days
        : parseFloat(product.price);

      const itemTotal = unitPrice * item.quantity;
      totalAmount = totalAmount.add(new Money(itemTotal));

      bookingItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: itemTotal.toFixed(2),
        days,
      });
    }

    // Calculate platform fee (10%)
    const platformFee = totalAmount.calculatePercentage(10);
    const vendorAmount = totalAmount.subtract(platformFee);

    // Create booking
    const booking = await this.bookingRepository.create({
      customerId: dto.customerId,
      shopId: dto.shopId,
      status: 'PENDING_VENDOR_REVIEW',
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalAmount: totalAmount.getAmount().toFixed(2),
      platformFee: platformFee.getAmount().toFixed(2),
      vendorAmount: vendorAmount.getAmount().toFixed(2),
      deliveryAddress: dto.deliveryAddress,
      notes: dto.notes,
    });

    // TODO: Create booking items in database

    return booking;
  }
}
