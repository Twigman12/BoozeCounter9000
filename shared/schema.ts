import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  isActive: boolean("is_active").default(true),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  alcoholContent: boolean("alcohol_content").default(false),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id"),
  supplierId: integer("supplier_id"),
  size: text("size"), // "750ml", "24-pack", etc.
  alcoholContent: decimal("alcohol_content", { precision: 4, scale: 2 }), // ABV percentage
  parLevel: integer("par_level"),
  minLevel: integer("min_level"),
  maxLevel: integer("max_level"),
  unitOfMeasure: text("unit_of_measure").default("each"), // "each", "case", "bottle", "oz"
  unitsPerCase: integer("units_per_case").default(1), // How many individual units in this package
  barcode: text("barcode"),
  individualBarcode: text("individual_barcode"),
  sixPackBarcode: text("six_pack_barcode"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastCountQuantity: decimal("last_count_quantity", { precision: 10, scale: 2 }),
  lastCountDate: timestamp("last_count_date"),
});

export const inventorySessions = pgTable("inventory_sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  userId: integer("user_id"),
  totalItems: integer("total_items").default(0),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default("0"),
  syncedToMarginEdge: boolean("synced_to_margin_edge").default(false),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Main Bar", "Wine Cellar", "Storage Room"
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  productId: integer("product_id").notNull(),
  locationId: integer("location_id"),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  recordedAt: timestamp("recorded_at").notNull(),
  recognitionConfidence: decimal("recognition_confidence", { precision: 5, scale: 2 }),
  notes: text("notes"),
});

export const costAnalysis = pgTable("cost_analysis", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  sessionId: integer("session_id").notNull(),
  quantityOnHand: decimal("quantity_on_hand", { precision: 10, scale: 2 }).notNull(),
  totalCostValue: decimal("total_cost_value", { precision: 12, scale: 2 }).notNull(),
  totalRetailValue: decimal("total_retail_value", { precision: 12, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 10, scale: 4 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertInventorySessionSchema = createInsertSchema(inventorySessions).omit({
  id: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

export const insertCostAnalysisSchema = createInsertSchema(costAnalysis).omit({
  id: true,
  calculatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InventorySession = typeof inventorySessions.$inferSelect;
export type InsertInventorySession = z.infer<typeof insertInventorySessionSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type CostAnalysis = typeof costAnalysis.$inferSelect;
export type InsertCostAnalysis = z.infer<typeof insertCostAnalysisSchema>;
