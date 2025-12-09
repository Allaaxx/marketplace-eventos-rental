import { pgTable, text, varchar, timestamp, uuid, integer, decimal, boolean, pgEnum, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'vendor', 'admin']);
export const productTypeEnum = pgEnum('product_type', ['rental', 'sale', 'bundle']);
export const bookingStatusEnum = pgEnum('booking_status', [
  'PENDING_VENDOR_REVIEW',
  'APPROVED_AWAITING_PAYMENT',
  'EXPIRED_NO_PAYMENT',
  'PAID_CONFIRMED',
  'ACTIVE',
  'RETURNED',
  'COMPLETED',
  'REJECTED_BY_VENDOR',
  'CANCELLED_BY_CUSTOMER',
]);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('customer'),
  avatar: text('avatar'),
  phone: varchar('phone', { length: 20 }),
  emailVerified: boolean('email_verified').default(false),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Shops Table
export const shops = pgTable('shops', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  banner: text('banner'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  stripeAccountId: text('stripe_account_id'),
  stripeOnboardingComplete: boolean('stripe_onboarding_complete').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').references(() => shops.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  type: productTypeEnum('type').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
  images: jsonb('images').$type<string[]>().default([]),
  quantity: integer('quantity').default(1),
  minRentalDays: integer('min_rental_days').default(1),
  maxRentalDays: integer('max_rental_days'),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  shopSlugUnique: unique().on(table.shopId, table.slug),
}));

// Product Components Table (for bundles)
export const productComponents = pgTable('product_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  bundleId: uuid('bundle_id').references(() => products.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  quantity: integer('quantity').notNull().default(1),
  isShared: boolean('is_shared').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  shopId: uuid('shop_id').references(() => shops.id).notNull(),
  status: bookingStatusEnum('status').notNull().default('PENDING_VENDOR_REVIEW'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 10, scale: 2 }),
  vendorAmount: decimal('vendor_amount', { precision: 10, scale: 2 }),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeCheckoutSessionId: text('stripe_checkout_session_id'),
  paymentDate: timestamp('payment_date'),
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  deliveryAddress: text('delivery_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Booking Items Table
export const bookingItems = pgTable('booking_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  days: integer('days').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory Calendar Table
export const inventoryCalendar = pgTable('inventory_calendar', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  componentId: uuid('component_id').references(() => productComponents.id),
  date: timestamp('date').notNull(),
  quantityAvailable: integer('quantity_available').notNull(),
  quantityReserved: integer('quantity_reserved').notNull().default(0),
  bookingId: uuid('booking_id').references(() => bookings.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productDateUnique: unique().on(table.productId, table.date),
}));

// Reviews Table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  shopId: uuid('shop_id').references(() => shops.id).notNull(),
  productId: uuid('product_id').references(() => products.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  response: text('response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payouts Table
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').references(() => shops.id).notNull(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  stripeTransferId: text('stripe_transfer_id'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shops: many(shops),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const shopsRelations = relations(shops, ({ one, many }) => ({
  owner: one(users, { fields: [shops.ownerId], references: [users.id] }),
  products: many(products),
  bookings: many(bookings),
  reviews: many(reviews),
  payouts: many(payouts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, { fields: [products.shopId], references: [shops.id] }),
  components: many(productComponents),
  bookingItems: many(bookingItems),
  inventoryCalendar: many(inventoryCalendar),
  reviews: many(reviews),
}));

export const productComponentsRelations = relations(productComponents, ({ one, many }) => ({
  bundle: one(products, { fields: [productComponents.bundleId], references: [products.id] }),
  inventoryCalendar: many(inventoryCalendar),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, { fields: [bookings.customerId], references: [users.id] }),
  shop: one(shops, { fields: [bookings.shopId], references: [shops.id] }),
  items: many(bookingItems),
  reviews: many(reviews),
  payouts: many(payouts),
  inventoryCalendar: many(inventoryCalendar),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, { fields: [bookingItems.bookingId], references: [bookings.id] }),
  product: one(products, { fields: [bookingItems.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  customer: one(users, { fields: [reviews.customerId], references: [users.id] }),
  shop: one(shops, { fields: [reviews.shopId], references: [shops.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  shop: one(shops, { fields: [payouts.shopId], references: [shops.id] }),
  booking: one(bookings, { fields: [payouts.bookingId], references: [bookings.id] }),
}));
