import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});

export const sellers = sqliteTable('sellers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category').notNull(),
  rating: real('rating').notNull().default(0),
  imageUrl: text('image_url'),
  sellerId: integer('seller_id').notNull().references(() => sellers.id),
  saleType: text('sale_type').notNull().default('fixed'),
  createdAt: text('created_at').notNull(),
});

export const cart = sqliteTable('cart', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  createdAt: text('created_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  totalAmount: real('total_amount').notNull(),
  orderDate: text('order_date').notNull(),
  status: text('status').notNull().default('pending'),
  paymentType: text('payment_type'),
});

export const bids = sqliteTable('bids', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: real('amount').notNull(),
  bidDate: text('bid_date').notNull(),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  paymentType: text('payment_type').notNull(),
  paymentDate: text('payment_date').notNull(),
});

export const feedback = sqliteTable('feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  comments: text('comments').notNull(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  createdAt: text('created_at').notNull(),
});