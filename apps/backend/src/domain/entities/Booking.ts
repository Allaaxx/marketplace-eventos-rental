export type BookingStatus =
  | 'PENDING_VENDOR_REVIEW'
  | 'APPROVED_AWAITING_PAYMENT'
  | 'EXPIRED_NO_PAYMENT'
  | 'PAID_CONFIRMED'
  | 'ACTIVE'
  | 'RETURNED'
  | 'COMPLETED'
  | 'REJECTED_BY_VENDOR'
  | 'CANCELLED_BY_CUSTOMER';

export interface BookingItem {
  id: string;
  bookingId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  days: number;
  createdAt: Date;
}

export interface Booking {
  id: string;
  customerId: string;
  shopId: string;
  status: BookingStatus;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
  platformFee?: string;
  vendorAmount?: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  paymentDate?: Date;
  notes?: string;
  rejectionReason?: string;
  deliveryAddress?: string;
  items?: BookingItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class BookingEntity {
  constructor(private readonly booking: Booking) {}

  get id(): string {
    return this.booking.id;
  }

  get customerId(): string {
    return this.booking.customerId;
  }

  get shopId(): string {
    return this.booking.shopId;
  }

  get status(): BookingStatus {
    return this.booking.status;
  }

  get totalAmount(): number {
    return parseFloat(this.booking.totalAmount);
  }

  isPending(): boolean {
    return this.booking.status === 'PENDING_VENDOR_REVIEW';
  }

  isApproved(): boolean {
    return this.booking.status === 'APPROVED_AWAITING_PAYMENT';
  }

  isPaid(): boolean {
    return this.booking.status === 'PAID_CONFIRMED';
  }

  isActive(): boolean {
    return this.booking.status === 'ACTIVE';
  }

  isCompleted(): boolean {
    return this.booking.status === 'COMPLETED';
  }

  isRejected(): boolean {
    return this.booking.status === 'REJECTED_BY_VENDOR';
  }

  isCancelled(): boolean {
    return this.booking.status === 'CANCELLED_BY_CUSTOMER';
  }

  canBeApproved(): boolean {
    return this.isPending();
  }

  canBeRejected(): boolean {
    return this.isPending();
  }

  canBePaid(): boolean {
    return this.isApproved();
  }

  canBeCancelled(): boolean {
    return this.isPending() || this.isApproved();
  }

  canBeActivated(): boolean {
    return this.isPaid();
  }

  canBeReturned(): boolean {
    return this.isActive();
  }

  canBeCompleted(): boolean {
    return this.booking.status === 'RETURNED';
  }

  getDurationInDays(): number {
    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  toJSON(): Booking {
    return { ...this.booking };
  }
}
