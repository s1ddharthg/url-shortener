import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const shortener = pgTable("shortener", {
    id: serial("id").primaryKey(),
    link: varchar("link", { length: 255 }).notNull(),
    code: varchar("code", { length: 255 }).notNull().unique(),
});

export const clicks = pgTable("clicks", {
    id: serial("id").primaryKey(),
    shortCode: varchar("short_code", { length: 255, }).notNull(),
    clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});