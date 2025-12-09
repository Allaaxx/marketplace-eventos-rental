export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'BRL') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  calculatePercentage(percentage: number): Money {
    return new Money((this.amount * percentage) / 100, this.currency);
  }

  toStripeAmount(): number {
    return Math.round(this.amount * 100);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
