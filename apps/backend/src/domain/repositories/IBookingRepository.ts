import { Booking } from '@domain/entities/Booking';

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  findByShopId(shopId: string): Promise<Booking[]>;
  create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  update(id: string, data: Partial<Booking>): Promise<Booking>;
  delete(id: string): Promise<void>;
  list(filters?: {
    status?: string;
    customerId?: string;
    shopId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]>;
}
