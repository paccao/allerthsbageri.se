import { type InferSelectModel } from 'drizzle-orm'
import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

const ISO_DATE_LENGTH = 30
const dateField = text({ length: ISO_DATE_LENGTH })

export const userTable = sqliteTable('user', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  username: text({ length: 30 }).notNull().unique(),
  password: text({ length: 100 }).notNull(),
})

export type User = InferSelectModel<typeof userTable>

export const customerTable = sqliteTable('customer', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  phone: text({ length: 50 }).notNull().unique(),
})

export type Customer = InferSelectModel<typeof customerTable>

export const pickupOccasionTable = sqliteTable('pickup_occasion', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  description: text({ length: 1000 }).notNull(),
  bookingStart: dateField.notNull(),
  bookingEnd: dateField.notNull(),
  pickupStart: dateField.notNull(),
  pickupEnd: dateField.notNull(),
})

export const productDetailsTable = sqliteTable('product_details', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  description: text({ length: 1000 }).notNull(),
  image: text(),
  vatPercentage: int().notNull(),
})

export const productTable = sqliteTable('product', {
  id: int().primaryKey(),
  stock: int().notNull(),
  price: int().notNull(),
  // TODO: Limit how many products of a certain kind that a customer should be allowed to order for the same pickupOccasion
  // For example, it's better to allow
  // NOTE: important to limit by customer and pickup occasion, rather than by order and pickup occasion.
  // Otherwise, a customer could create multiple orders to effectively bypass the limit
  // So, the endpoint should ensure the ordered product count is available in the stock.
  // It should also ensure the customer so far have ordered less than the specified maxPerCustomer.
  // Otherwise, show a friendly error message, and offer to order the other products
  // TODO: We also need to handle what happens if there are multiple orders at the same time and the stock just run out.
  // In that case, we should show a message to reach out to see if it can be solved in another way.
  maxPerCustomer: int(),
  pickupOccasionId: int()
    .notNull()
    .references(() => pickupOccasionTable.id),
  productDetailsId: int()
    .notNull()
    .references(() => productDetailsTable.id),
})

export const orderStatusTable = sqliteTable('order_status', {
  id: int().primaryKey(),
  status: text({ length: 50 }).notNull(),
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
export const orderTable = sqliteTable('customer_order', {
  id: int().primaryKey(),
  createdAt: dateField.notNull().$defaultFn(() => new Date().toISOString()),
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
  id: int().primaryKey(),
  count: int().notNull(),
  price: int().notNull(),
  productId: int()
    .notNull()
    .references(() => productTable.id),
  orderId: int()
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
