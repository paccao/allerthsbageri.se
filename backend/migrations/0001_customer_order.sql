ALTER TABLE `pickup_order` RENAME TO `customer_order`;
PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_customer_order` (
	`id` integer PRIMARY KEY NOT NULL,
	`booking_opens` text(30) NOT NULL,
	`customer_id` integer NOT NULL,
	`pickup_occasion_id` integer NOT NULL,
	`status_id` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pickup_occasion_id`) REFERENCES `pickup_occasion`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `order_status`(`id`) ON UPDATE no action ON DELETE no action
);

INSERT INTO `__new_customer_order`("id", "booking_opens", "customer_id", "pickup_occasion_id", "status_id") SELECT "id", "booking_opens", "customer_id", "pickup_occasion_id", "status_id" FROM `customer_order`;
DROP TABLE `customer_order`;
ALTER TABLE `__new_customer_order` RENAME TO `customer_order`;
PRAGMA foreign_keys=ON;
CREATE TABLE `__new_order_item` (
	`id` integer PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`price` integer NOT NULL,
	`product_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `customer_order`(`id`) ON UPDATE no action ON DELETE cascade
);

INSERT INTO `__new_order_item`("id", "count", "price", "product_id", "order_id") SELECT "id", "count", "price", "product_id", "order_id" FROM `order_item`;
DROP TABLE `order_item`;
ALTER TABLE `__new_order_item` RENAME TO `order_item`;