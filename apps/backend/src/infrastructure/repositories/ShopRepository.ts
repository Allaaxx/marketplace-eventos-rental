import { db, shops } from '@infrastructure/database';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { Shop } from '@domain/entities/Shop';
import { eq, and, desc } from 'drizzle-orm';

export class ShopRepository implements IShopRepository {
  async findById(id: string): Promise<Shop | null> {
    const result = await db.query.shops.findFirst({
      where: eq(shops.id, id),
    });
    return result || null;
  }

  async findBySlug(slug: string): Promise<Shop | null> {
    const result = await db.query.shops.findFirst({
      where: eq(shops.slug, slug),
    });
    return result || null;
  }

  async findByOwnerId(ownerId: string): Promise<Shop[]> {
    return await db.query.shops.findMany({
      where: eq(shops.ownerId, ownerId),
    });
  }

  async create(data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop> {
    const [shop] = await db
      .insert(shops)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return shop;
  }

  async update(id: string, data: Partial<Shop>): Promise<Shop> {
    const [shop] = await db
      .update(shops)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(shops.id, id))
      .returning();
    return shop;
  }

  async delete(id: string): Promise<void> {
    await db.delete(shops).where(eq(shops.id, id));
  }

  async list(filters?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Shop[]> {
    const conditions = [];

    if (filters?.isActive !== undefined) {
      conditions.push(eq(shops.isActive, filters.isActive));
    }

    const query = db.query.shops.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
      orderBy: desc(shops.createdAt),
    });

    return await query;
  }
}
