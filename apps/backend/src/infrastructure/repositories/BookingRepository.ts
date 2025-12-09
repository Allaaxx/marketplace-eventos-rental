import { IBookingRepository } from '@domain/repositories/IBookingRepository';
import { Booking } from '@domain/entities/Booking';
import { db, bookings } from '@infrastructure/database';
import { eq, and } from 'drizzle-orm';

export class BookingRepository implements IBookingRepository {
  async findById(id: string): Promise<Booking | null> {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        items: true,
      },
    });

    return booking || null;
  }

  async findByCustomerId(customerId: string): Promise<Booking[]> {
    const bookingList = await db.query.bookings.findMany({
      where: eq(bookings.customerId, customerId),
      with: {
        items: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    return bookingList;
  }

  async findByShopId(shopId: string): Promise<Booking[]> {
    const bookingList = await db.query.bookings.findMany({
      where: eq(bookings.shopId, shopId),
      with: {
        items: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    return bookingList;
  }

  async create(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values({
        ...data,
        status: data.status || 'PENDING_VENDOR_REVIEW',
      })
      .returning();

    return booking;
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

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
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

    const bookingList = await db.query.bookings.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        items: true,
      },
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    return bookingList;
  }
}
