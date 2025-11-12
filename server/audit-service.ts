import { Request } from 'express';
import type { InsertAuditLog } from '../shared/schema';

export class AuditService {
  constructor(private storage: any) {}

  /**
   * Log an action to the audit trail
   */
  async log(params: {
    tenantId: string;
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    changes?: any;
    req?: Request;
  }): Promise<void> {
    try {
      const auditLog: InsertAuditLog = {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes,
        ipAddress: params.req ? this.getClientIP(params.req) : undefined,
        userAgent: params.req ? params.req.get('user-agent') : undefined,
      };

      await this.storage.createAuditLog(auditLog);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break the main operation
    }
  }

  /**
   * Log user login
   */
  async logLogin(tenantId: string, userId: string, req: Request): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'login',
      req,
    });
  }

  /**
   * Log user logout
   */
  async logLogout(tenantId: string, userId: string, req: Request): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'logout',
      req,
    });
  }

  /**
   * Log entity creation
   */
  async logCreate(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    data: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'create',
      entityType,
      entityId,
      changes: { after: data },
      req,
    });
  }

  /**
   * Log entity update
   */
  async logUpdate(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    before: any,
    after: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'update',
      entityType,
      entityId,
      changes: { before, after },
      req,
    });
  }

  /**
   * Log entity deletion
   */
  async logDelete(
    tenantId: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    data: any,
    req?: Request
  ): Promise<void> {
    await this.log({
      tenantId,
      userId,
      action: 'delete',
      entityType,
      entityId,
      changes: { before: data },
      req,
    });
  }

  /**
   * Get audit logs for a tenant
   */
  async getAuditLogs(
    tenantId: string,
    options: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    return await this.storage.getAuditLogs(tenantId, options);
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(req: Request): string {
    const forwarded = req.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
