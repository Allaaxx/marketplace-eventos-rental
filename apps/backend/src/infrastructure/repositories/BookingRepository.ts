import { db, bookings, bookingItems } from '@infrastructure/database';
import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { Booking } from '@domain/entities/Booking';
import { eq, and, desc } from 'drizzle-orm';

export class BookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const result = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        items: true,
      },
    });
    return result || null;
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    return await db.query.bookings.findMany({
      where: eq(bookings.customerId, customerId),
      with: {
        items: true,
      },
      orderBy: desc(bookings.createdAt),
    });
  }

  async findByShopId(shopId: string): Promise<Booking[]> {
    return await db.query.bookings.findMany({
      where: eq(bookings.shopId, shopId),
      with: {
        items: true,
      },
      orderBy: desc(bookings.createdAt),
    });
  }

  async create(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const { items, ...bookingData } = data as any;

    const [booking] = await db
      .insert(bookings)
      .values({
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (items && items.length > 0) {
      const itemsData = items.map((item: any) => ({
        bookingId: booking.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        days: item.days,
        createdAt: new Date(),
      }));

      await db.insert(bookingItems).values(itemsData);
    }

    return await this.findById(booking.id) as Booking;
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return await this.findById(booking.id) as Booking;
  }

  async delete(id: string): Promise<void> {
    await db.delete(bookingItems).where(eq(bookingItems.bookingId, id));
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async list(filters?: {
    status?: string;
    customerId?: string;
    shopId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]> {
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

    return await db.query.bookings.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
      orderBy: desc(bookings.createdAt),
      with: {
        items: true,
      },
    });
  }
}
