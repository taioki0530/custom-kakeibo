CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`asset_type` text DEFAULT 'other' NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`is_preset` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_name_unique` ON `assets` (`name`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`color` text,
	`is_preset` integer DEFAULT false,
	`sort_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`date` integer NOT NULL,
	`category_id` integer,
	`memo` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
