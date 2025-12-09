import { Shop } from '@domain/entities/Shop';
import { IShopRepository } from '@domain/repositories/IShopRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

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

  async execute(input: CreateShopInput): Promise<Shop> {
    const user = await this.userRepository.findById(input.ownerId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'vendor') {
      throw new Error('Only vendors can create shops');
    }

    // Generate slug
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existingShop = await this.shopRepository.findBySlug(slug);
    if (existingShop) {
      throw new Error('Shop with this name already exists');
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

    return shop;
  }
}
