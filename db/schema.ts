import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const menus = sqliteTable("menus", {
  ownerId: text("owner_id").primaryKey(),
  slug: text("slug").notNull().unique(),
  draft: text("draft").notNull(),
  published: text("published"),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
});

export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  objectKey: text("object_key").notNull(),
  mime: text("mime").notNull(),
  rightsConfirmedAt: text("rights_confirmed_at").notNull(),
  rightsSource: text("rights_source").notNull(),
  createdAt: text("created_at").notNull(),
});

export const menuMetrics = sqliteTable("menu_metrics", {
  key: text("key").primaryKey(),
  slug: text("slug").notNull(),
  day: text("day").notNull(),
  kind: text("kind").notNull(),
  dishId: text("dish_id").notNull(),
  count: integer("count").notNull().default(0),
}, table => [index("menu_metrics_slug_day").on(table.slug, table.day)]);

export const aiUsage = sqliteTable("ai_usage", {
  key: text("key").primaryKey(),
  day: text("day").notNull(),
  count: integer("count").notNull().default(0),
});
