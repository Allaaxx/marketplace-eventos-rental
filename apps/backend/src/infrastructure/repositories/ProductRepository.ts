import { eq, and, like, or } from 'drizzle-orm';
import { db, products, productComponents } from '@infrastructure/database';
import { Product } from '@domain/entities/Product';
import { IProductRepository } from '@domain/repositories/IProductRepository';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(productComponents, eq(products.id, productComponents.bundleId))
      .where(eq(products.id, id))
      .limit(1);

    if (!result[0]) return null;

    const product = result[0].products;
    const components = result
      .filter((r) => r.product_components)
      .map((r) => r.product_components!);

    return {
      ...product,
      components: components.length > 0 ? components : undefined,
    };
  }

  async findByShopId(shopId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.shopId, shopId));
  }

  async findBySlug(shopId: string, slug: string): Promise<Product | null> {
    const result = await db
      .select()
      .from(products)
      .where(and(eq(products.shopId, shopId), eq(products.slug, slug)))
      .limit(1);
    return result[0] || null;
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const result = await db
      .insert(products)
      .values({
        ...productData,
        images: productData.images || [],
        tags: productData.tags || [],
        quantity: productData.quantity || 1,
        minRentalDays: productData.minRentalDays || 1,
        isActive: productData.isActive ?? true,
      })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const result = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Product not found');
    }
    
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async list(filters?: {
    type?: string;
    category?: string;
    isActive?: boolean;
    shopId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products);

    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(products.type, filters.type as any));
    }

    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }

    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    if (filters?.shopId) {
      conditions.push(eq(products.shopId, filters.shopId));
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

  async search(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        or(
          like(products.name, `%${query}%`),
          like(products.description, `%${query}%`)
        )
      )
      .limit(50);
  }
}
