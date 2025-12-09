import { db, inventoryCalendar, products, productComponents } from '@infrastructure/database';
import { eq, and, between, sql } from 'drizzle-orm';
import { eachDayOfInterval } from 'date-fns';

export class AvailabilityService {
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
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      return false;
    }

    // For bundles, check component availability
    if (product.type === 'bundle' && product.components && product.components.length > 0) {
      return await this.checkBundleAvailability(product.components, startDate, endDate, quantity);
    }

    // For simple products, check direct availability
    return await this.checkSimpleProductAvailability(productId, startDate, endDate, quantity);
  }

  private async checkSimpleProductAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    requestedQuantity: number
  ): Promise<boolean> {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of dates) {
      const inventory = await db.query.inventoryCalendar.findFirst({
        where: and(
          eq(inventoryCalendar.productId, productId),
          eq(inventoryCalendar.date, date)
        ),
      });

      const availableQty = inventory
        ? inventory.quantityAvailable - inventory.quantityReserved
        : (await db.query.products.findFirst({ where: eq(products.id, productId) }))?.quantity || 0;

      if (availableQty < requestedQuantity) {
        return false;
      }
    }

    return true;
  }

  private async checkBundleAvailability(
    components: typeof productComponents.$inferSelect[],
    startDate: Date,
    endDate: Date,
    bundleQuantity: number
  ): Promise<boolean> {
    for (const component of components) {
      const requiredQuantity = component.quantity * bundleQuantity;
      const dates = eachDayOfInterval({ start: startDate, end: endDate });

      for (const date of dates) {
        const inventory = await db.query.inventoryCalendar.findFirst({
          where: and(
            eq(inventoryCalendar.componentId, component.id),
            eq(inventoryCalendar.date, date)
          ),
        });

        const availableQty = inventory
          ? inventory.quantityAvailable - inventory.quantityReserved
          : component.quantity;

        if (availableQty < requiredQuantity) {
          return false;
        }
      }
    }

    return true;
  }

  async reserveInventory(
    bookingId: string,
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number
  ): Promise<void> {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of dates) {
      await db
        .insert(inventoryCalendar)
        .values({
          productId,
          date,
          quantityAvailable: quantity,
          quantityReserved: quantity,
          bookingId,
        })
        .onConflictDoUpdate({
          target: [inventoryCalendar.productId, inventoryCalendar.date],
          set: {
            quantityReserved: sql`${inventoryCalendar.quantityReserved} + ${quantity}`,
          },
        });
    }
  }

  async releaseInventory(bookingId: string): Promise<void> {
    await db
      .delete(inventoryCalendar)
      .where(eq(inventoryCalendar.bookingId, bookingId));
  }
}
