import { Booking, BookingItem } from '@domain/entities/Booking';

export interface BookingDTO {
  id: string;
  customerId: string;
  shopId: string;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  platformFee?: number;
  vendorAmount?: number;
  deliveryAddress?: string;
  notes?: string;
  items?: BookingItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingItemDTO {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  days: number;
}

export class BookingMapper {
  static toDTO(booking: Booking): BookingDTO {
    return {
      id: booking.id,
      customerId: booking.customerId,
      shopId: booking.shopId,
      status: booking.status,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      totalAmount: parseFloat(booking.totalAmount),
      platformFee: booking.platformFee ? parseFloat(booking.platformFee) : undefined,
      vendorAmount: booking.vendorAmount ? parseFloat(booking.vendorAmount) : undefined,
      deliveryAddress: booking.deliveryAddress,
      notes: booking.notes,
      items: booking.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice),
        days: item.days,
      })),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
