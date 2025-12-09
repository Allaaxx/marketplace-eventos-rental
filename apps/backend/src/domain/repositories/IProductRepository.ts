import { Product } from '@domain/entities/Product';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByShopId(shopId: string): Promise<Product[]>;
  findBySlug(shopId: string, slug: string): Promise<Product | null>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  list(filters?: {
    type?: string;
    category?: string;
    isActive?: boolean;
    shopId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
}
