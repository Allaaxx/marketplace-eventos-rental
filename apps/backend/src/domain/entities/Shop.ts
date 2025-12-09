export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ShopEntity {
  constructor(private readonly shop: Shop) {}

  get id(): string {
    return this.shop.id;
  }

  get ownerId(): string {
    return this.shop.ownerId;
  }

  get name(): string {
    return this.shop.name;
  }

  get slug(): string {
    return this.shop.slug;
  }

  isOwner(userId: string): boolean {
    return this.shop.ownerId === userId;
  }

  isActive(): boolean {
    return this.shop.isActive;
  }

  canAcceptBookings(): boolean {
    return this.shop.isActive && this.shop.stripeOnboardingComplete;
  }

  hasStripeOnboarded(): boolean {
    return this.shop.stripeOnboardingComplete;
  }

  toJSON(): Shop {
    return { ...this.shop };
  }
}
