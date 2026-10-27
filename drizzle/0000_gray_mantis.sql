CREATE TABLE `menus` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`draft` text NOT NULL,
	`published` text,
	`updated_at` text NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menus_slug_unique` ON `menus` (`slug`);--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`rights_confirmed_at` text NOT NULL,
	`rights_source` text NOT NULL,
	`created_at` text NOT NULL
);
