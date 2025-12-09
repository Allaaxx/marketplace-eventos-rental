import { db, inventoryCalendar, products, productComponents } from '@infrastructure/database';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { eachDayOfInterval } from 'date-fns';

export class InventoryService {
  async checkAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number
  ): Promise<boolean> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      with: {
        components: true,
      },
    });

    if (!product) {
      return false;
    }

    // For bundles, check component availability
    if (product.type === 'bundle' && product.components) {
      for (const component of product.components) {
        const componentAvailable = await this.checkComponentAvailability(
          component.id,
          startDate,
          endDate,
          component.quantity * quantity
        );

        if (!componentAvailable) {
          return false;
        }
      }
    } else {
      // Check product availability
      const dates = eachDayOfInterval({ start: startDate, end: endDate });

      for (const date of dates) {
        const inventory = await db.query.inventoryCalendar.findFirst({
          where: and(
            eq(inventoryCalendar.productId, productId),
            eq(inventoryCalendar.date, date)
          ),
        });

        const available = inventory
          ? inventory.quantityAvailable - inventory.quantityReserved
          : product.quantity;

        if (available < quantity) {
          return false;
        }
      }
    }

    return true;
  }

  private async checkComponentAvailability(
    componentId: string,
    startDate: Date,
    endDate: Date,
    quantity: number
  ): Promise<boolean> {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of dates) {
      const inventory = await db.query.inventoryCalendar.findFirst({
        where: and(
          eq(inventoryCalendar.componentId, componentId),
          eq(inventoryCalendar.date, date)
        ),
      });

      const available = inventory
        ? inventory.quantityAvailable - inventory.quantityReserved
        : 0;

      if (available < quantity) {
        return false;
      }
    }

    return true;
  }

  async reserveInventory(
    bookingId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    // Implementation to reserve inventory in calendar
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of dates) {
      await db.insert(inventoryCalendar).values({
        productId: bookingId, // This should be replaced with actual product IDs
        date,
        quantityAvailable: 0,
        quantityReserved: 1,
        bookingId,
      });
    }
  }
}
