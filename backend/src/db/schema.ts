import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const shortener = pgTable("shortener", {
    id: serial("id").primaryKey(),
    link: varchar("link", { length: 255 }).notNull(),
    code: varchar("code", { length: 255 }).notNull().unique(),
});

export const clicks = pgTable("clicks", {
    id: serial("id").primaryKey(),
    shortCode: varchar("short_code", { length: 255, }).notNull(),
    ip: varchar("ip", { length: 255, }),
    userAgent: text("user_agent"),
    clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});