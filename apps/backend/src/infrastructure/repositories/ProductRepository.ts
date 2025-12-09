import { db, products, productComponents } from '@infrastructure/database';
import { IProductRepository } from '@domain/repositories/IProductRepository';
import { Product } from '@domain/entities/Product';
import { eq, and, like, desc, or } from 'drizzle-orm';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        components: true,
      },
    });
    return result || null;
  }

  async findByShopId(shopId: string): Promise<Product[]> {
    return await db.query.products.findMany({
      where: eq(products.shopId, shopId),
      with: {
        components: true,
      },
    });
  }

  async findBySlug(shopId: string, slug: string): Promise<Product | null> {
    const result = await db.query.products.findFirst({
      where: and(eq(products.shopId, shopId), eq(products.slug, slug)),
      with: {
        components: true,
      },
    });
    return result || null;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create components if it's a bundle
    if (data.components && data.components.length > 0) {
      const componentsData = data.components.map((comp: any) => ({
        bundleId: product.id,
        name: comp.name,
        description: comp.description,
        quantity: comp.quantity,
        isShared: comp.isShared,
        createdAt: new Date(),
      }));

      await db.insert(productComponents).values(componentsData);
    }

    return await this.findById(product.id) as Product;
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
    return await this.findById(product.id) as Product;
  }

  async delete(id: string): Promise<void> {
    await db.delete(productComponents).where(eq(productComponents.bundleId, id));
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

    return await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
      orderBy: desc(products.createdAt),
      with: {
        components: true,
      },
    });
  }

  async search(query: string): Promise<Product[]> {
    return await db.query.products.findMany({
      where: or(
        like(products.name, `%${query}%`),
        like(products.description, `%${query}%`),
        like(products.category, `%${query}%`)
      ),
      limit: 20,
      with: {
        components: true,
      },
    });
  }
}
