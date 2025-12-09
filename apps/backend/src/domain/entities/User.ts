export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  constructor(private readonly user: User) {}

  get id(): string {
    return this.user.id;
  }

  get email(): string {
    return this.user.email;
  }

  get name(): string {
    return this.user.name;
  }

  get role(): UserRole {
    return this.user.role;
  }

  isVendor(): boolean {
    return this.user.role === 'vendor';
  }

  isCustomer(): boolean {
    return this.user.role === 'customer';
  }

  isAdmin(): boolean {
    return this.user.role === 'admin';
  }

  canManageShop(shopOwnerId: string): boolean {
    return this.user.id === shopOwnerId || this.isAdmin();
  }

  toJSON(): User {
    return { ...this.user };
  }
}
