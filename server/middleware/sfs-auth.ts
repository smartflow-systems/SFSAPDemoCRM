/**
 * SFS Shared Auth Middleware
 *
 * Drop this file into any SFS repo: server/middleware/sfs-auth.ts
 * Requires: npm install jsonwebtoken @types/jsonwebtoken
 * Requires env: SFS_JWT_SECRET (same value as SFS-Backend)
 *
 * Usage:
 *   import { requireAuth, requireRole, requireProduct } from './middleware/sfs-auth'
 *   router.get('/dashboard', requireAuth, requireProduct('barber-booker'), handler)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface SFSTokenPayload {
  userId: string;
  orgId: string;
  email: string;
  role: "owner" | "admin" | "member";
  plan: "free" | "starter" | "pro" | "enterprise";
}

declare global {
  namespace Express {
    interface Request {
      user?: SFSTokenPayload;
    }
  }
}

const SFS_BACKEND_URL = process.env.SFS_BACKEND_URL || "https://sfs-backend.replit.app";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const secret = process.env.SFS_JWT_SECRET;
  if (!secret) throw new Error("SFS_JWT_SECRET env var is missing");

  try {
    req.user = jwt.verify(token, secret) as SFSTokenPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: SFSTokenPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

export function requirePlan(...plans: SFSTokenPayload["plan"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !plans.includes(req.user.plan)) {
      return res.status(403).json({ error: "Upgrade required", requiredPlans: plans });
    }
    next();
  };
}

// Checks SFS-Backend to verify the org has an active subscription to this product.
// Use sparingly on sensitive routes — it makes an outbound HTTP call.
export function requireProduct(productSlug: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = req.headers.authorization?.split(" ")[1];
      const response = await fetch(`${SFS_BACKEND_URL}/api/products/${productSlug}/access`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json() as { hasAccess: boolean };
      if (!data.hasAccess) return res.status(403).json({ error: "No active subscription to this product" });
      next();
    } catch {
      res.status(503).json({ error: "Could not verify product access" });
    }
  };
}
