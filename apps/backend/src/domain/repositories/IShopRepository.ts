import { Shop } from '@domain/entities/Shop';

export interface IShopRepository {
  findById(id: string): Promise<Shop | null>;
  findBySlug(slug: string): Promise<Shop | null>;
  findByOwnerId(ownerId: string): Promise<Shop[]>;
  create(shop: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shop>;
  update(id: string, data: Partial<Shop>): Promise<Shop>;
  delete(id: string): Promise<void>;
  list(filters?: { isActive?: boolean; limit?: number; offset?: number }): Promise<Shop[]>;
}
