import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || false,
  credentials: false
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

const config = JSON.parse(readFileSync("./public/site.config.json", "utf-8"));

const dataDir = "./data";
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const leadsFile = join(dataDir, "leads.json");

if (!existsSync(leadsFile)) {
  writeFileSync(leadsFile, JSON.stringify({ leads: [] }, null, 2));
}

function readLeads() {
  try {
    const data = JSON.parse(readFileSync(leadsFile, "utf-8"));
    return Array.isArray(data.leads) ? data : { leads: [] };
  } catch (error) {
    console.error("Error reading leads:", error);
    return { leads: [] };
  }
}

function writeLeads(data) {
  try {
    writeFileSync(leadsFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing leads:", error);
    return false;
  }
}

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function requireAdmin(req, res, next) {
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({
      success: false,
      message: "ADMIN_API_TOKEN is not configured"
    });
  }

  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  if (token !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: "Admin auth required"
    });
  }

  next();
}

async function notifyNewLead(lead) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lead.created",
        product: "barber-booker-v1",
        source: "v0.2-barber-demo",
        lead
      })
    });
  } catch (error) {
    console.error("Lead webhook failed:", error.message);
  }
}

function csvEscape(value) {
  const safe = String(value ?? "");
  return `"${safe.replaceAll('"', '""')}"`;
}

function leadsToCsv(leads) {
  const headers = [
    "id",
    "firstName",
    "lastName",
    "email",
    "company",
    "phone",
    "source",
    "status",
    "notes",
    "lastContactedAt",
    "nextFollowUpAt",
    "createdAt",
    "updatedAt"
  ];

  const rows = leads.map((lead) =>
    headers.map((key) => csvEscape(lead[key])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    siteName: config.siteName,
    version: config.version
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    siteName: config.siteName,
    version: config.version
  });
});

app.post("/api/leads", async (req, res) => {
  try {
    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = normaliseEmail(req.body.email);
    const company = String(req.body.company || "").trim();
    const phone = String(req.body.phone || "").trim();
    const source = String(req.body.source || "direct").trim();

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, and email are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const data = readLeads();

    const existingLead = data.leads.find((lead) =>
      normaliseEmail(lead.email) === email
    );

    if (existingLead) {
      return res.status(200).json({
        success: true,
        message: "Lead already exists",
        leadId: existingLead.id
      });
    }

    const now = new Date().toISOString();

    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      firstName,
      lastName,
      email,
      company,
      phone,
      source,
      status: "new",
      notes: "",
      lastContactedAt: null,
      nextFollowUpAt: null,
      createdAt: now,
      updatedAt: now
    };

    data.leads.push(newLead);

    if (!writeLeads(data)) {
      throw new Error("Failed to save lead");
    }

    console.log(`✓ New lead captured: ${email}`);

    await notifyNewLead(newLead);

    return res.status(201).json({
      success: true,
      message: "Lead captured successfully",
      leadId: newLead.id
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.get("/api/leads", requireAdmin, (_req, res) => {
  try {
    const data = readLeads();

    return res.json({
      success: true,
      count: data.leads.length,
      leads: data.leads
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads"
    });
  }
});

app.patch("/api/leads/:id", requireAdmin, (req, res) => {
  try {
    const allowedStatuses = ["new", "contacted", "demo_booked", "won", "lost"];
    const data = readLeads();
    const lead = data.leads.find((item) => item.id === req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    if (req.body.status) {
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Use one of: ${allowedStatuses.join(", ")}`
        });
      }

      lead.status = req.body.status;
    }

    if (typeof req.body.notes === "string") {
      lead.notes = req.body.notes.trim();
    }

    if (typeof req.body.lastContactedAt === "string") {
      lead.lastContactedAt = req.body.lastContactedAt;
    }

    if (typeof req.body.nextFollowUpAt === "string") {
      lead.nextFollowUpAt = req.body.nextFollowUpAt;
    }

    lead.updatedAt = new Date().toISOString();

    if (!writeLeads(data)) {
      throw new Error("Failed to update lead");
    }

    return res.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error("Lead update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lead"
    });
  }
});

app.get("/api/leads.csv", requireAdmin, (_req, res) => {
  try {
    const data = readLeads();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sfs-leads.csv");

    return res.send(leadsToCsv(data.leads));
  } catch (error) {
    console.error("CSV export error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export leads"
    });
  }
});

app.get("/api/payment-link", (_req, res) => {
  const url = process.env.STRIPE_PAYMENT_LINK_BARBER;

  if (!url) {
    return res.status(501).json({
      success: false,
      message: "STRIPE_PAYMENT_LINK_BARBER is not configured yet"
    });
  }

  return res.json({
    success: true,
    url
  });
});

app.post("/api/stripe/checkout", (_req, res) => {
  const url = process.env.STRIPE_PAYMENT_LINK_BARBER;

  if (!url) {
    return res.status(501).json({
      success: false,
      message: "Stripe Payment Link is not configured yet"
    });
  }

  return res.json({
    success: true,
    message: "Redirect to Stripe Payment Link",
    url
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`serving on ${port}`);
});

export default app;
