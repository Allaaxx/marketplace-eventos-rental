import { IShopRepository } from '@domain/repositories/IShopRepository';
import { Shop } from '@domain/entities/Shop';
import { db, shops } from '@infrastructure/database';
import { eq } from 'drizzle-orm';

export class ShopRepository implements IShopRepository {
  async findById(id: string): Promise<Shop | null> {
    const shop = await db.query.shops.findFirst({
      where: eq(shops.id, id),
    });

    return shop || null;
  }

  async findBySlug(slug: string): Promise<Shop | null> {
    const shop = await db.query.shops.findFirst({
      where: eq(shops.slug, slug),
    });

    return shop || null;
  }

  async findByOwnerId(ownerId: string): Promise<Shop[]> {
    const shopList = await db.query.shops.findMany({
      where: eq(shops.ownerId, ownerId),
    });

    return shopList;
  }

  async create(data: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop> {
    const [shop] = await db
      .insert(shops)
      .values({
        ...data,
        stripeOnboardingComplete: data.stripeOnboardingComplete || false,
        isActive: data.isActive ?? true,
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

    if (!shop) {
      throw new Error('Shop not found');
    }

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
    let query = db.query.shops.findMany({
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    });

    if (filters?.isActive !== undefined) {
      query = db.query.shops.findMany({
        where: eq(shops.isActive, filters.isActive),
        limit: filters?.limit || 20,
        offset: filters?.offset || 0,
      });
    }

    return await query;
  }
}
