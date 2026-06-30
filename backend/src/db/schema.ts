import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const shortener = pgTable("shortener", {
    id: serial("id").primaryKey(),
    link: varchar("link", { length: 255 }).notNull(),
    code: varchar("code", { length: 255 }).notNull().unique(),
});