import { IProductRepository } from '@domain/repositories/IProductRepository';
import { Product } from '@domain/entities/Product';
import { db, products } from '@infrastructure/database';
import { eq, and, like, or } from 'drizzle-orm';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        components: true,
      },
    });

    return product || null;
  }

  async findByShopId(shopId: string): Promise<Product[]> {
    const productList = await db.query.products.findMany({
      where: eq(products.shopId, shopId),
      with: {
        components: true,
      },
    });

    return productList;
  }

  async findBySlug(shopId: string, slug: string): Promise<Product | null> {
    const product = await db.query.products.findFirst({
      where: and(eq(products.shopId, shopId), eq(products.slug, slug)),
      with: {
        components: true,
      },
    });

    return product || null;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...data,
        isActive: data.isActive ?? true,
        images: data.images || [],
        tags: data.tags || [],
      })
      .returning();

    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
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

    const productList = await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        components: true,
      },
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    });

    return productList;
  }

  async search(query: string): Promise<Product[]> {
    const productList = await db.query.products.findMany({
      where: or(
        like(products.name, `%${query}%`),
        like(products.description, `%${query}%`)
      ),
      with: {
        components: true,
      },
      limit: 20,
    });

    return productList;
  }
}
