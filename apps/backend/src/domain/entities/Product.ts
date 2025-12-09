export type ProductType = 'rental' | 'sale' | 'bundle';

export interface ProductComponent {
  id: string;
  bundleId: string;
  name: string;
  description?: string;
  quantity: number;
  isShared: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  type: ProductType;
  price: string;
  dailyRate?: string;
  images: string[];
  quantity: number;
  minRentalDays: number;
  maxRentalDays?: number;
  category?: string;
  tags: string[];
  isActive: boolean;
  components?: ProductComponent[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProductEntity {
  constructor(private readonly product: Product) {}

  get id(): string {
    return this.product.id;
  }

  get shopId(): string {
    return this.product.shopId;
  }

  get type(): ProductType {
    return this.product.type;
  }

  get name(): string {
    return this.product.name;
  }

  get price(): number {
    return parseFloat(this.product.price);
  }

  get dailyRate(): number | undefined {
    return this.product.dailyRate ? parseFloat(this.product.dailyRate) : undefined;
  }

  isRental(): boolean {
    return this.product.type === 'rental';
  }

  isSale(): boolean {
    return this.product.type === 'sale';
  }

  isBundle(): boolean {
    return this.product.type === 'bundle';
  }

  isActive(): boolean {
    return this.product.isActive;
  }

  calculatePrice(days: number = 1): number {
    if (this.isRental() && this.dailyRate) {
      return this.dailyRate * days;
    }
    return this.price;
  }

  hasComponents(): boolean {
    return this.isBundle() && (this.product.components?.length ?? 0) > 0;
  }

  getComponents(): ProductComponent[] {
    return this.product.components || [];
  }

  toJSON(): Product {
    return { ...this.product };
  }
}
