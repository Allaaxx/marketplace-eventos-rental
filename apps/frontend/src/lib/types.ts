export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  city?: string;
  state?: string;
  stripeOnboardingComplete: boolean;
  isActive: boolean;
}

export type ProductType = 'rental' | 'sale' | 'bundle';

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
  category?: string;
  tags: string[];
  isActive: boolean;
}

export type BookingStatus =
  | 'PENDING_VENDOR_REVIEW'
  | 'APPROVED_AWAITING_PAYMENT'
  | 'PAID_CONFIRMED'
  | 'ACTIVE'
  | 'RETURNED'
  | 'COMPLETED'
  | 'REJECTED_BY_VENDOR'
  | 'CANCELLED_BY_CUSTOMER';

export interface Booking {
  id: string;
  shopId: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  totalAmount: number;
  deliveryAddress?: string;
  items?: BookingItem[];
  createdAt: string;
}

export interface BookingItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  days: number;
}
