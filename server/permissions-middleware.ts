/**
 * Permission Enforcement Middleware
 * Checks if authenticated user has required permissions
 */

import type { Request, Response, NextFunction } from 'express';
import { PermissionChecker, type Permission } from '@shared/permissions';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: 'Admin' | 'Manager' | 'Sales Rep' | 'Viewer';
      createdAt: Date;
    }
  }
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          status: 401
        }
      });
    }

    const user = req.user as Express.User;
    const checker = new PermissionChecker(user.role);

    // Check if user has any of the required permissions
    const hasPermission = permissions.some(permission =>
      checker.hasPermission(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          status: 403,
          required: permissions,
          userRole: user.role
        }
      });
    }

    next();
  };
}

/**
 * Middleware to check resource ownership
 * User can access resource if they own it OR have admin/manager role
 */
export function checkOwnership(getOwnerId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          status: 401
        }
      });
    }

    const user = req.user as Express.User;
    const resourceOwnerId = getOwnerId(req);

    // Admins and Managers can access all resources
    if (user.role === 'Admin' || user.role === 'Manager') {
      return next();
    }

    // Otherwise, must be the owner
    if (resourceOwnerId !== user.id) {
      return res.status(403).json({
        error: {
          message: 'You can only access your own resources',
          status: 403
        }
      });
    }

    next();
  };
}

/**
 * Attach user info to request for logging
 */
export function attachUserContext(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as Express.User;
    (req as any).userContext = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
  }
  next();
}

/**
 * Audit log middleware - logs all authenticated API calls
 */
export function auditLog(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as Express.User;
    const originalSend = res.send;

    res.send = function(data: any) {
      console.log('[AUDIT]', {
        timestamp: new Date().toISOString(),
        userId: user.id,
        username: user.username,
        role: user.role,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ip: req.ip
      });
      return originalSend.call(this, data);
    };
  }
  next();
}
