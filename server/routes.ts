import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertScanSchema, insertThreatSchema, insertReportSchema } from "@shared/schema";
import multer from "multer";
import crypto from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /\.(pdf|doc|docx|txt|zip|exe|js|html|htm|php)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Mock ML analysis functions
async function analyzeEmailContent(content: string): Promise<{
  threatLevel: string;
  riskScore: number;
  findings: any;
}> {
  // Mock ML analysis - in production, this would call actual ML models
  const suspiciousKeywords = ['urgent', 'verify', 'suspended', 'click here', 'act now', 'limited time'];
  const foundKeywords = suspiciousKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  const riskScore = Math.min(foundKeywords.length * 20, 100);
  let threatLevel = 'safe';
  
  if (riskScore > 60) threatLevel = 'high';
  else if (riskScore > 30) threatLevel = 'medium';
  else if (riskScore > 10) threatLevel = 'low';
  
  return {
    threatLevel,
    riskScore,
    findings: {
      suspiciousKeywords: foundKeywords,
      hasUrgentLanguage: foundKeywords.length > 0,
      linkCount: (content.match(/https?:\/\/[^\s]+/g) || []).length,
      analysis: 'Email analyzed for phishing indicators'
    }
  };
}

async function analyzeURL(url: string): Promise<{
  threatLevel: string;
  riskScore: number;
  findings: any;
}> {
  // Mock URL analysis - integrate with PhishTank API
  const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'shortened.link'];
  const hasHttps = url.startsWith('https://');
  const hasSuspiciousDomain = suspiciousDomains.some(domain => url.includes(domain));
  
  let riskScore = 0;
  if (!hasHttps) riskScore += 30;
  if (hasSuspiciousDomain) riskScore += 40;
  if (url.includes('phishing') || url.includes('malicious')) riskScore += 80;
  
  let threatLevel = 'safe';
  if (riskScore > 60) threatLevel = 'high';
  else if (riskScore > 30) threatLevel = 'medium';
  else if (riskScore > 10) threatLevel = 'low';
  
  return {
    threatLevel,
    riskScore,
    findings: {
      hasHttps,
      hasSuspiciousDomain,
      domainAge: 'Unknown',
      reputation: 'Unknown',
      analysis: 'URL analyzed for malicious indicators'
    }
  };
}

async function analyzeFile(filename: string, buffer: Buffer): Promise<{
  threatLevel: string;
  riskScore: number;
  findings: any;
}> {
  // Mock file analysis
  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const suspiciousExtensions = ['.exe', '.scr', '.bat', '.cmd'];
  const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
    filename.toLowerCase().endsWith(ext)
  );
  
  let riskScore = 0;
  if (hasSuspiciousExtension) riskScore += 50;
  if (buffer.length > 5 * 1024 * 1024) riskScore += 20; // Large files
  
  let threatLevel = 'safe';
  if (riskScore > 60) threatLevel = 'high';
  else if (riskScore > 30) threatLevel = 'medium';
  else if (riskScore > 10) threatLevel = 'low';
  
  return {
    threatLevel,
    riskScore,
    findings: {
      fileHash,
      fileSize: buffer.length,
      hasSuspiciousExtension,
      scanDate: new Date().toISOString(),
      analysis: 'File analyzed for malicious content'
    }
  };
}

async function checkBreaches(email: string): Promise<{
  threatLevel: string;
  riskScore: number;
  findings: any;
}> {
  // Mock breach check - integrate with HaveIBeenPwned API
  const knownBreaches = ['Adobe', 'LinkedIn', 'Yahoo', 'Equifax'];
  const foundBreaches = knownBreaches.filter(() => Math.random() > 0.7); // Random for demo
  
  const riskScore = foundBreaches.length * 25;
  let threatLevel = 'safe';
  
  if (riskScore > 60) threatLevel = 'high';
  else if (riskScore > 30) threatLevel = 'medium';
  else if (riskScore > 10) threatLevel = 'low';
  
  return {
    threatLevel,
    riskScore,
    findings: {
      foundBreaches,
      breachCount: foundBreaches.length,
      checkedDate: new Date().toISOString(),
      analysis: 'Email checked against known data breaches'
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Scan routes
  app.post('/api/scans/email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailContent, emailHeaders } = req.body;
      
      if (!emailContent) {
        return res.status(400).json({ message: "Email content is required" });
      }

      // Create pending scan
      const scan = await storage.createScan({
        userId,
        type: 'email',
        target: emailContent,
        status: 'scanning',
        metadata: { headers: emailHeaders }
      });

      // Analyze email content
      const analysis = await analyzeEmailContent(emailContent);
      
      // Update scan with results
      const updatedScan = await storage.updateScan(scan.id, {
        status: 'completed',
        threatLevel: analysis.threatLevel as any,
        riskScore: analysis.riskScore.toString(),
        findings: analysis.findings
      });

      res.json(updatedScan);
    } catch (error) {
      console.error("Error scanning email:", error);
      res.status(500).json({ message: "Failed to scan email" });
    }
  });

  app.post('/api/scans/url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const scan = await storage.createScan({
        userId,
        type: 'url',
        target: url,
        status: 'scanning'
      });

      const analysis = await analyzeURL(url);
      
      const updatedScan = await storage.updateScan(scan.id, {
        status: 'completed',
        threatLevel: analysis.threatLevel as any,
        riskScore: analysis.riskScore.toString(),
        findings: analysis.findings
      });

      res.json(updatedScan);
    } catch (error) {
      console.error("Error scanning URL:", error);
      res.status(500).json({ message: "Failed to scan URL" });
    }
  });

  app.post('/api/scans/file', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      const scan = await storage.createScan({
        userId,
        type: 'file',
        target: file.originalname,
        status: 'scanning',
        metadata: { 
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }
      });

      const analysis = await analyzeFile(file.originalname, file.buffer);
      
      const updatedScan = await storage.updateScan(scan.id, {
        status: 'completed',
        threatLevel: analysis.threatLevel as any,
        riskScore: analysis.riskScore.toString(),
        findings: analysis.findings
      });

      res.json(updatedScan);
    } catch (error) {
      console.error("Error scanning file:", error);
      res.status(500).json({ message: "Failed to scan file" });
    }
  });

  app.post('/api/scans/breach', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const scan = await storage.createScan({
        userId,
        type: 'breach',
        target: email,
        status: 'scanning'
      });

      const analysis = await checkBreaches(email);
      
      const updatedScan = await storage.updateScan(scan.id, {
        status: 'completed',
        threatLevel: analysis.threatLevel as any,
        riskScore: analysis.riskScore.toString(),
        findings: analysis.findings
      });

      res.json(updatedScan);
    } catch (error) {
      console.error("Error checking breach:", error);
      res.status(500).json({ message: "Failed to check breach" });
    }
  });

  // Get user scans
  app.get('/api/scans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const scans = await storage.getUserScans(userId, limit);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Threat intelligence
  app.get('/api/threats', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const threats = await storage.getActiveThreats(limit);
      res.json(threats);
    } catch (error) {
      console.error("Error fetching threats:", error);
      res.status(500).json({ message: "Failed to fetch threats" });
    }
  });

  // Reports
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = req.body;
      
      const report = await storage.createReport({
        ...reportData,
        userId
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
