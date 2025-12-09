import { db, inventoryCalendar, products, productComponents } from '@infrastructure/database';
import { eq, and, gte, lte, between } from 'drizzle-orm';
import { eachDayOfInterval } from 'date-fns';

export class AvailabilityService {
  /**
   * Check if a product is available for the given date range
   */
  async checkAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    requestedQuantity: number
  ): Promise<boolean> {
    // Get product
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    
    if (!product[0]) {
      throw new Error('Product not found');
    }

    const productData = product[0];

    // If it's a bundle, check component availability
    if (productData.type === 'bundle') {
      return await this.checkBundleAvailability(productId, startDate, endDate, requestedQuantity);
    }

    // For regular products, check inventory calendar
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of dates) {
      const inventory = await db
        .select()
        .from(inventoryCalendar)
        .where(
          and(
            eq(inventoryCalendar.productId, productId),
            eq(inventoryCalendar.date, date)
          )
        )
        .limit(1);

      if (inventory[0]) {
        const available = inventory[0].quantityAvailable - inventory[0].quantityReserved;
        if (available < requestedQuantity) {
          return false;
        }
      } else {
        // If no inventory record exists, check against product quantity
        if (productData.quantity < requestedQuantity) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check availability for bundles by checking all components
   */
  private async checkBundleAvailability(
    bundleId: string,
    startDate: Date,
    endDate: Date,
    requestedQuantity: number
  ): Promise<boolean> {
    // Get all components of the bundle
    const components = await db
      .select()
      .from(productComponents)
      .where(eq(productComponents.bundleId, bundleId));

    if (components.length === 0) {
      return true; // No components to check
    }

    // Check each component's availability
    for (const component of components) {
      const requiredQuantity = component.quantity * requestedQuantity;
      const dates = eachDayOfInterval({ start: startDate, end: endDate });

      for (const date of dates) {
        const inventory = await db
          .select()
          .from(inventoryCalendar)
          .where(
            and(
              eq(inventoryCalendar.componentId, component.id),
              eq(inventoryCalendar.date, date)
            )
          )
          .limit(1);

        if (inventory[0]) {
          const available = inventory[0].quantityAvailable - inventory[0].quantityReserved;
          if (available < requiredQuantity) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Reserve inventory for a booking
   */
  async reserveInventory(
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number,
    bookingId: string
  ): Promise<void> {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    for (const date of dates) {
      // Check if inventory record exists
      const existing = await db
        .select()
        .from(inventoryCalendar)
        .where(
          and(
            eq(inventoryCalendar.productId, productId),
            eq(inventoryCalendar.date, date)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Update existing record
        await db
          .update(inventoryCalendar)
          .set({
            quantityReserved: existing[0].quantityReserved + quantity,
            bookingId,
          })
          .where(eq(inventoryCalendar.id, existing[0].id));
      } else {
        // Create new inventory record
        const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        
        if (product[0]) {
          await db.insert(inventoryCalendar).values({
            productId,
            date,
            quantityAvailable: product[0].quantity,
            quantityReserved: quantity,
            bookingId,
          });
        }
      }
    }
  }
}
