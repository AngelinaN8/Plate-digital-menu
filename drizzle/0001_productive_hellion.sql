CREATE TABLE `ai_usage` (
	`key` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menu_metrics` (
	`key` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`dish_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `menu_metrics_slug_day` ON `menu_metrics` (`slug`,`day`);