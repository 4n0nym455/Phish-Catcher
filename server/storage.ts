import {
  users,
  scans,
  threats,
  reports,
  breaches,
  type User,
  type UpsertUser,
  type Scan,
  type InsertScan,
  type Threat,
  type InsertThreat,
  type Report,
  type InsertReport,
  type Breach,
  type InsertBreach,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  getUserScans(userId: string, limit?: number): Promise<Scan[]>;
  updateScan(id: string, updates: Partial<Scan>): Promise<Scan>;
  
  // Threat operations
  createThreat(threat: InsertThreat): Promise<Threat>;
  getActiveThreats(limit?: number): Promise<Threat[]>;
  getThreat(id: string): Promise<Threat | undefined>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getUserReports(userId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  
  // Breach operations
  createBreach(breach: InsertBreach): Promise<Breach>;
  getBreachesByEmail(email: string): Promise<Breach[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    totalScans: number;
    safeScans: number;
    threatsDetected: number;
    breachedAccounts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Scan operations
  async createScan(scanData: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(scanData).returning();
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async getUserScans(userId: string, limit: number = 10): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt))
      .limit(limit);
  }

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan> {
    const [scan] = await db
      .update(scans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scans.id, id))
      .returning();
    return scan;
  }

  // Threat operations
  async createThreat(threatData: InsertThreat): Promise<Threat> {
    const [threat] = await db.insert(threats).values(threatData).returning();
    return threat;
  }

  async getActiveThreats(limit: number = 10): Promise<Threat[]> {
    return await db
      .select()
      .from(threats)
      .where(eq(threats.isActive, true))
      .orderBy(desc(threats.createdAt))
      .limit(limit);
  }

  async getThreat(id: string): Promise<Threat | undefined> {
    const [threat] = await db.select().from(threats).where(eq(threats.id, id));
    return threat;
  }

  // Report operations
  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  async getUserReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  // Breach operations
  async createBreach(breachData: InsertBreach): Promise<Breach> {
    const [breach] = await db.insert(breaches).values(breachData).returning();
    return breach;
  }

  async getBreachesByEmail(email: string): Promise<Breach[]> {
    return await db
      .select()
      .from(breaches)
      .where(eq(breaches.email, email))
      .orderBy(desc(breaches.createdAt));
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    totalScans: number;
    safeScans: number;
    threatsDetected: number;
    breachedAccounts: number;
  }> {
    // Get total scans
    const [totalResult] = await db
      .select({ count: count() })
      .from(scans)
      .where(eq(scans.userId, userId));

    // Get safe scans (safe and low threat levels)
    const [safeResult] = await db
      .select({ count: count() })
      .from(scans)
      .where(
        and(
          eq(scans.userId, userId),
          eq(scans.threatLevel, "safe")
        )
      );

    // Get threats detected (medium, high, critical)
    const [threatResult] = await db
      .select({ count: count() })
      .from(scans)
      .where(
        and(
          eq(scans.userId, userId),
          eq(scans.type, "email") // Adjust based on your threat detection logic
        )
      );

    // Get breached accounts (from breach scans)
    const [breachResult] = await db
      .select({ count: count() })
      .from(scans)
      .where(
        and(
          eq(scans.userId, userId),
          eq(scans.type, "breach")
        )
      );

    return {
      totalScans: totalResult.count,
      safeScans: safeResult.count,
      threatsDetected: threatResult.count,
      breachedAccounts: breachResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
