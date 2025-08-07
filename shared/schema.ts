import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Scan types enum
export const scanTypeEnum = pgEnum('scan_type', ['email', 'url', 'file', 'breach']);

// Threat levels enum
export const threatLevelEnum = pgEnum('threat_level', ['safe', 'low', 'medium', 'high', 'critical']);

// Scan status enum
export const scanStatusEnum = pgEnum('scan_status', ['pending', 'scanning', 'completed', 'failed']);

// Scans table
export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: scanTypeEnum("type").notNull(),
  target: text("target").notNull(), // email content, URL, filename, etc.
  status: scanStatusEnum("status").default("pending"),
  threatLevel: threatLevelEnum("threat_level").default("safe"),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).default("0.00"),
  findings: jsonb("findings"), // detailed scan results
  metadata: jsonb("metadata"), // additional scan metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scans.$inferSelect;

// Threats table for threat intelligence
export const threats = pgTable("threats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // phishing, malware, breach, etc.
  title: varchar("title").notNull(),
  description: text("description"),
  severity: threatLevelEnum("severity").notNull(),
  source: varchar("source"), // PhishTank, HaveIBeenPwned, etc.
  indicators: jsonb("indicators"), // IOCs, signatures, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertThreatSchema = createInsertSchema(threats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type Threat = typeof threats.$inferSelect;

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  type: varchar("type").notNull(), // daily, weekly, monthly, custom
  dateRange: jsonb("date_range"), // start and end dates
  data: jsonb("data").notNull(), // report data and statistics
  format: varchar("format").default("pdf"), // pdf, csv, excel
  filePath: varchar("file_path"), // stored file location
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Breach data table
export const breaches = pgTable("breaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  breachName: varchar("breach_name").notNull(),
  breachDate: timestamp("breach_date"),
  compromisedData: jsonb("compromised_data"), // types of data compromised
  source: varchar("source").default("HaveIBeenPwned"),
  severity: threatLevelEnum("severity").default("medium"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBreachSchema = createInsertSchema(breaches).omit({
  id: true,
  createdAt: true,
});

export type InsertBreach = z.infer<typeof insertBreachSchema>;
export type Breach = typeof breaches.$inferSelect;

// Relations
export const userRelations = relations(users, ({ many }) => ({
  scans: many(scans),
  reports: many(reports),
}));

export const scanRelations = relations(scans, ({ one }) => ({
  user: one(users, {
    fields: [scans.userId],
    references: [users.id],
  }),
}));

export const reportRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));
