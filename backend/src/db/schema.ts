import { type InferSelectModel } from 'drizzle-orm'
import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

const ISO_DATE_LENGTH = 30
const dateField = () => text({ length: ISO_DATE_LENGTH })

export const userTable = sqliteTable('user', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 200 }).notNull(),
  username: text({ length: 30 }).notNull().unique(),
  password: text({ length: 100 }).notNull(),
})

export type User = InferSelectModel<typeof userTable>

export const customerTable = sqliteTable('customer', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 200 }).notNull(),
  phone: text({ length: 50 }).notNull().unique(),
})

export type Customer = InferSelectModel<typeof customerTable>

export const pickupOccasionTable = sqliteTable('pickup_occasion', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 200 }).notNull(),
  location: text({ length: 150 }).notNull(),
  // IDEA: Maybe rename to bookingStart/bookingEnd to orderStart/orderEnd
  bookingStart: dateField().notNull(),
  bookingEnd: dateField().notNull(),
  pickupStart: dateField().notNull(),
  pickupEnd: dateField().notNull(),
})

export const productDetailsTable = sqliteTable('product_details', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text({ length: 200 }).notNull(),
  description: text({ length: 1000 }).notNull(),
  image: text(),
  // IDEA: Maybe store VAT rates as standardised values in a separate table.
  // This would allow us to update the VAT values easily when they change.
  // We could also preseve old VAT values (for historical stats) by adding new rows for updated VAT rates.
  // If we do this, we could have columns on the VAT table with `validFrom` (date) and `validTo` (date) to disallow using old VAT rates after a certain time.
  vatPercentage: int().notNull(),
})

export const productTable = sqliteTable('product', {
  id: int().primaryKey({ autoIncrement: true }),
  stock: int().notNull(),
  price: int().notNull(),
  /**
   * This limits how many items of this kind of product that can be ordered per customer per pickup occasion.
   * Note that this applies is both applies in the same order, or if there are multiple orders from the same customer.
   */
  maxPerCustomer: int(),
  pickupOccasionId: int()
    .notNull()
    .references(() => pickupOccasionTable.id),
  productDetailsId: int()
    .notNull()
    .references(() => productDetailsTable.id),
})

export const orderStatusTable = sqliteTable('order_status', {
  id: int().primaryKey({ autoIncrement: true }),
  status: text({ length: 50 }).notNull(),
  /**
   * The default order status for new orders.
   * There should only be one.
   */
  isDefault: int({ mode: 'boolean' }).default(false).notNull(),
  color: text({ length: 50 }),
})

// IDEA: customer_orders could be used for both products and activities.
// If the products and activities themselves refer to the pickup date or the activity date,
// then we could remove the pickupOccasionId from the customer_order.
// However, we should only create one order per pickup occasion, and activity
// to allow us to set the order's statusId to highlight that the products were delivered or that the course was delivered
// IDEA: Maybe the order and product concept could be generalized to be reused
// Or, it might be better to keep two distinct tables since they represent very different things
// Two separate tables make it easier to change
export const orderTable = sqliteTable('order_table', {
  id: text()
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: dateField()
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  customerId: int()
    .notNull()
    .references(() => customerTable.id, { onDelete: 'cascade' }),
  pickupOccasionId: int()
    .notNull()
    .references(() => pickupOccasionTable.id),
  statusId: int()
    .notNull()
    .references(() => orderStatusTable.id),
})

export const orderItemTable = sqliteTable('order_item', {
  id: int().primaryKey({ autoIncrement: true }),
  count: int().notNull(),
  price: int().notNull(),
  productId: int()
    .notNull()
    .references(() => productTable.id),
  orderId: text()
    .notNull()
    .references(() => orderTable.id, { onDelete: 'cascade' }),
})

export const sessionTable = sqliteTable('session', {
  id: text().primaryKey(),
  userId: int()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  expiresAt: int({ mode: 'timestamp' }).notNull(),
})

export type Session = InferSelectModel<typeof sessionTable>
