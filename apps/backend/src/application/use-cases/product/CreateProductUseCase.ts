import { Product, ProductType } from '@domain/entities/Product';
import { IProductRepository } from '@domain/repositories/IProductRepository';
import { IShopRepository } from '@domain/repositories/IShopRepository';

export interface CreateProductInput {
  shopId: string;
  vendorId: string;
  name: string;
  description?: string;
  type: ProductType;
  price: number;
  dailyRate?: number;
  images?: string[];
  quantity: number;
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

  async execute(input: CreateProductInput): Promise<Product> {
    const shop = await this.shopRepository.findById(input.shopId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== input.vendorId) {
      throw new Error('You are not authorized to create products for this shop');
    }

    if (!shop.isActive) {
      throw new Error('Shop is not active');
    }

    // Validate rental product
    if (input.type === 'rental' && !input.dailyRate) {
      throw new Error('Daily rate is required for rental products');
    }

    // Generate slug
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const product = await this.productRepository.create({
      shopId: input.shopId,
      name: input.name,
      slug,
      description: input.description,
      type: input.type,
      price: input.price.toFixed(2),
      dailyRate: input.dailyRate?.toFixed(2),
      images: input.images || [],
      quantity: input.quantity,
      minRentalDays: input.minRentalDays || 1,
      maxRentalDays: input.maxRentalDays,
      category: input.category,
      tags: input.tags || [],
      isActive: true,
    });

    return product;
  }
}
