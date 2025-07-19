import { 
  users, 
  products, 
  inventorySessions, 
  inventoryItems,
  type User, 
  type InsertUser,
  type Product,
  type InsertProduct,
  type InventorySession,
  type InsertInventorySession,
  type InventoryItem,
  type InsertInventoryItem
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  createInventorySession(session: InsertInventorySession): Promise<InventorySession>;
  getInventorySession(id: number): Promise<InventorySession | undefined>;
  updateInventorySession(id: number, updates: Partial<InventorySession>): Promise<InventorySession | undefined>;
  
  addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItemsBySession(sessionId: number): Promise<InventoryItem[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product || undefined;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    // First check main barcode (case/bottle)
    let [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    
    if (!product) {
      // Check individual barcode (single can/bottle)
      [product] = await db.select().from(products).where(eq(products.individualBarcode, barcode));
    }
    
    if (!product) {
      // Check six-pack barcode
      [product] = await db.select().from(products).where(eq(products.sixPackBarcode, barcode));
    }
    
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async createInventorySession(insertSession: InsertInventorySession): Promise<InventorySession> {
    const [session] = await db
      .insert(inventorySessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getInventorySession(id: number): Promise<InventorySession | undefined> {
    const [session] = await db.select().from(inventorySessions).where(eq(inventorySessions.id, id));
    return session || undefined;
  }

  async updateInventorySession(id: number, updates: Partial<InventorySession>): Promise<InventorySession | undefined> {
    const [session] = await db
      .update(inventorySessions)
      .set(updates)
      .where(eq(inventorySessions.id, id))
      .returning();
    return session || undefined;
  }

  async addInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getInventoryItemsBySession(sessionId: number): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
