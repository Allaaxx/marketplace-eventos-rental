import { ShopRepository } from '@infrastructure/repositories/ShopRepository';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { CreateShopUseCase } from '@application/use-cases/shop/CreateShopUseCase';
import { StripeService } from '@application/services/StripeService';

export class ShopController {
  private shopRepository = new ShopRepository();
  private userRepository = new UserRepository();
  private stripeService = new StripeService();

  async create(data: any, ownerId: string) {
    const useCase = new CreateShopUseCase(this.shopRepository, this.userRepository);
    return await useCase.execute({ ...data, ownerId });
  }

  async list(filters?: any) {
    return await this.shopRepository.list(filters);
  }

  async getById(id: string) {
    const shop = await this.shopRepository.findById(id);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop;
  }

  async getBySlug(slug: string) {
    const shop = await this.shopRepository.findBySlug(slug);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop;
  }

  async update(id: string, data: any, ownerId: string) {
    const shop = await this.shopRepository.findById(id);

    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== ownerId) {
      throw new Error('Unauthorized to update this shop');
    }

    return await this.shopRepository.update(id, data);
  }

  async initiateStripeOnboarding(shopId: string, ownerId: string) {
    const shop = await this.shopRepository.findById(shopId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.ownerId !== ownerId) {
      throw new Error('Unauthorized');
    }

    const user = await this.userRepository.findById(ownerId);
    if (!user) {
      throw new Error('User not found');
    }

    let stripeAccountId = shop.stripeAccountId;

    if (!stripeAccountId) {
      const account = await this.stripeService.createConnectAccount(user.email);
      stripeAccountId = account.id;

      await this.shopRepository.update(shopId, {
        stripeAccountId,
      });
    }

    const onboardingUrl = await this.stripeService.createConnectAccountLink(stripeAccountId);

    return { onboardingUrl };
  }
}
