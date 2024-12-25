import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

const ISO_DATE_LENGTH = 30
const dateField = text({ length: ISO_DATE_LENGTH })

export const user = sqliteTable('user', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  username: text({ length: 30 }).notNull().unique(),
  password: text({ length: 100 }).notNull(),
})

export const customer = sqliteTable('customer', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  phone: text({ length: 50 }).notNull(),
})

export const pickupOccasion = sqliteTable('pickup_occasion', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  description: text({ length: 1000 }).notNull(),
  bookingOpens: dateField.notNull(),
  bookingCloses: dateField.notNull(),
  pickupOpens: dateField.notNull(),
  pickupCloses: dateField.notNull(),
})

export const productDetails = sqliteTable('product_details', {
  id: int().primaryKey(),
  name: text({ length: 200 }).notNull(),
  description: text({ length: 1000 }).notNull(),
  image: text(),
  vatPercentage: int().notNull(),
})

export const product = sqliteTable('product', {
  id: int().primaryKey(),
  stock: int().notNull(),
  price: int().notNull(),
  pickupOccasionId: int()
    .notNull()
    .references(() => pickupOccasion.id),
  productDetailsId: int()
    .notNull()
    .references(() => productDetails.id),
})

export const orderStatus = sqliteTable('order_status', {
  id: int().primaryKey(),
  status: text({ length: 50 }).notNull(),
  color: text({ length: 50 }),
})

export const order = sqliteTable('pickup_order', {
  id: int().primaryKey(),
  createdAt: dateField.notNull(),
  customerId: int()
    .notNull()
    .references(() => customer.id, { onDelete: 'cascade' }),
  pickupOccasionId: int()
    .notNull()
    .references(() => pickupOccasion.id),
  statusId: int()
    .notNull()
    .references(() => orderStatus.id),
})

export const orderItem = sqliteTable('order_item', {
  id: int().primaryKey(),
  count: int().notNull(),
  price: int().notNull(),
  productId: int()
    .notNull()
    .references(() => product.id),
  orderId: int()
    .notNull()
    .references(() => order.id, { onDelete: 'cascade' }),
})

export const session = sqliteTable('session', {
  id: text().primaryKey(),
  userId: int()
    .notNull()
    .references(() => user.id),
  expiresAt: int({ mode: 'timestamp' }).notNull(),
})
