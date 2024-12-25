ALTER TABLE `users` RENAME TO `user`;
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);

DROP INDEX `users_username_unique`;
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);