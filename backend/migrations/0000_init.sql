CREATE TABLE `customer` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(200) NOT NULL,
	`phone` text(50) NOT NULL
);

CREATE TABLE `pickup_order` (
	`id` integer PRIMARY KEY NOT NULL,
	`booking_opens` text(30) NOT NULL,
	`customer_id` integer NOT NULL,
	`pickup_occasion_id` integer NOT NULL,
	`status_id` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pickup_occasion_id`) REFERENCES `pickup_occasion`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `order_status`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `order_item` (
	`id` integer PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`price` integer NOT NULL,
	`product_id` integer NOT NULL,
	`order_id` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `pickup_order`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `order_status` (
	`id` integer PRIMARY KEY NOT NULL,
	`status` text(50) NOT NULL,
	`color` text(50)
);

CREATE TABLE `pickup_occasion` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(200) NOT NULL,
	`description` text(1000) NOT NULL,
	`booking_opens` text(30) NOT NULL
);

CREATE TABLE `product_details` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(200) NOT NULL,
	`description` text(1000) NOT NULL,
	`image` text,
	`vat_percentage` integer NOT NULL
);

CREATE TABLE `product` (
	`id` integer PRIMARY KEY NOT NULL,
	`stock` integer NOT NULL,
	`price` integer NOT NULL,
	`pickup_occasion_id` integer NOT NULL,
	`product_details_id` integer NOT NULL,
	FOREIGN KEY (`pickup_occasion_id`) REFERENCES `pickup_occasion`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_details_id`) REFERENCES `product_details`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(200) NOT NULL,
	`username` text(30) NOT NULL,
	`password` text(100) NOT NULL
);

CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);