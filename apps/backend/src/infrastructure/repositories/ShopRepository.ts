import { eq, and } from 'drizzle-orm';
import { db, shops } from '@infrastructure/database';
import { Shop } from '@domain/entities/Shop';
import { IShopRepository } from '@domain/repositories/IShopRepository';

export class ShopRepository implements IShopRepository {
  async findById(id: string): Promise<Shop | null> {
    const result = await db.select().from(shops).where(eq(shops.id, id)).limit(1);
    return result[0] || null;
  }

  async findBySlug(slug: string): Promise<Shop | null> {
    const result = await db.select().from(shops).where(eq(shops.slug, slug)).limit(1);
    return result[0] || null;
  }

  async findByOwnerId(ownerId: string): Promise<Shop[]> {
    return await db.select().from(shops).where(eq(shops.ownerId, ownerId));
  }

  async create(shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop> {
    const result = await db
      .insert(shops)
      .values({
        ...shopData,
        stripeOnboardingComplete: shopData.stripeOnboardingComplete || false,
        isActive: shopData.isActive ?? true,
      })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<Shop>): Promise<Shop> {
    const result = await db
      .update(shops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shops.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Shop not found');
    }
    
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(shops).where(eq(shops.id, id));
  }

  async list(filters?: { isActive?: boolean; limit?: number; offset?: number }): Promise<Shop[]> {
    let query = db.select().from(shops);

    if (filters?.isActive !== undefined) {
      query = query.where(eq(shops.isActive, filters.isActive)) as any;
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
