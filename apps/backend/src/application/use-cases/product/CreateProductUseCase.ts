import { IProductRepository } from '@domain/repositories/IProductRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { ProductEntity, ProductType } from '@domain/entities/Product';

export interface CreateProductInput {
  shopId: string;
  vendorId: string;
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  dailyRate?: number;
  images?: string[];
  quantity?: number;
  minRentalDays?: number;
  maxRentalDays?: number;
  category?: string;
  tags?: string[];
  components?: {
    name: string;
    description?: string;
    quantity: number;
    isShared: boolean;
  }[];
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly shopRepository: IShopRepository
  ) {}

  async execute(input: CreateProductInput): Promise<ProductEntity> {
    const shop = await this.shopRepository.findById(input.shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== input.vendorId) {
      throw new Error('Only shop owner can create products');
    }

    if (input.type === 'rental' && !input.dailyRate) {
      throw new Error('Daily rate is required for rental products');
    }

    if (input.type === 'bundle' && (!input.components || input.components.length === 0)) {
      throw new Error('Bundles must have at least one component');
    }

    const slug = this.generateSlug(input.name);

    const product = await this.productRepository.create({
      shopId: input.shopId,
      name: input.name,
      slug,
      description: input.description,
      type: input.type,
      price: input.price.toFixed(2),
      dailyRate: input.dailyRate?.toFixed(2),
      images: input.images || [],
      quantity: input.quantity || 1,
      minRentalDays: input.minRentalDays || 1,
      maxRentalDays: input.maxRentalDays,
      category: input.category,
      tags: input.tags || [],
      isActive: true,
    });

    return new ProductEntity(product);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
