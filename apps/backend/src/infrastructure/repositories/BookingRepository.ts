import { eq, and } from 'drizzle-orm';
import { db, bookings, bookingItems } from '@infrastructure/database';
import { Booking } from '@domain/entities/Booking';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';

export class BookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(bookingItems, eq(bookings.id, bookingItems.bookingId))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!result[0]) return null;

    const booking = result[0].bookings;
    const items = result
      .filter((r) => r.booking_items)
      .map((r) => r.booking_items!);

    return {
      ...booking,
      items: items.length > 0 ? items : undefined,
    };
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }

  async findByShopId(shopId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.shopId, shopId));
  }

  async create(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const result = await db
      .insert(bookings)
      .values({
        ...bookingData,
        status: bookingData.status || 'PENDING_VENDOR_REVIEW',
      })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    const result = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Booking not found');
    }
    
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async list(filters?: {
    status?: string;
    customerId?: string;
    shopId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]> {
    let query = db.select().from(bookings);

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status as any));
    }

    if (filters?.customerId) {
      conditions.push(eq(bookings.customerId, filters.customerId));
    }

    if (filters?.shopId) {
      conditions.push(eq(bookings.shopId, filters.shopId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }

    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  }
}
