import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ShopEntity } from '@domain/entities/Shop';

export interface CreateShopInput {
  ownerId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export class CreateShopUseCase {
  constructor(
    private readonly shopRepository: IShopRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: CreateShopInput): Promise<ShopEntity> {
    const user = await this.userRepository.findById(input.ownerId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'vendor') {
      throw new Error('Only vendors can create shops');
    }

    const existingShops = await this.shopRepository.findByOwnerId(input.ownerId);
    if (existingShops.length > 0) {
      throw new Error('User already has a shop');
    }

    const slug = this.generateSlug(input.name);
    const existingShop = await this.shopRepository.findBySlug(slug);
    if (existingShop) {
      throw new Error('Shop name already taken');
    }

    const shop = await this.shopRepository.create({
      ownerId: input.ownerId,
      name: input.name,
      slug,
      description: input.description,
      address: input.address,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      phone: input.phone,
      stripeOnboardingComplete: false,
      isActive: true,
    });

    return new ShopEntity(shop);
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
