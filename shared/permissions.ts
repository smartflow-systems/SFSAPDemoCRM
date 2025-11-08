/**
 * Enhanced Role-Based Access Control (RBAC) System
 * Defines roles, permissions, and access control logic
 */

export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  SALES_REP = 'Sales Rep',
  VIEWER = 'Viewer'
}

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Lead Management
  LEAD_CREATE = 'lead:create',
  LEAD_READ = 'lead:read',
  LEAD_READ_ALL = 'lead:read:all',
  LEAD_UPDATE = 'lead:update',
  LEAD_UPDATE_ALL = 'lead:update:all',
  LEAD_DELETE = 'lead:delete',
  LEAD_ASSIGN = 'lead:assign',

  // Opportunity Management
  OPPORTUNITY_CREATE = 'opportunity:create',
  OPPORTUNITY_READ = 'opportunity:read',
  OPPORTUNITY_READ_ALL = 'opportunity:read:all',
  OPPORTUNITY_UPDATE = 'opportunity:update',
  OPPORTUNITY_UPDATE_ALL = 'opportunity:update:all',
  OPPORTUNITY_DELETE = 'opportunity:delete',
  OPPORTUNITY_ASSIGN = 'opportunity:assign',

  // Account Management
  ACCOUNT_CREATE = 'account:create',
  ACCOUNT_READ = 'account:read',
  ACCOUNT_READ_ALL = 'account:read:all',
  ACCOUNT_UPDATE = 'account:update',
  ACCOUNT_UPDATE_ALL = 'account:update:all',
  ACCOUNT_DELETE = 'account:delete',

  // Contact Management
  CONTACT_CREATE = 'contact:create',
  CONTACT_READ = 'contact:read',
  CONTACT_READ_ALL = 'contact:read:all',
  CONTACT_UPDATE = 'contact:update',
  CONTACT_UPDATE_ALL = 'contact:update:all',
  CONTACT_DELETE = 'contact:delete',

  // Activity Management
  ACTIVITY_CREATE = 'activity:create',
  ACTIVITY_READ = 'activity:read',
  ACTIVITY_READ_ALL = 'activity:read:all',
  ACTIVITY_UPDATE = 'activity:update',
  ACTIVITY_UPDATE_ALL = 'activity:update:all',
  ACTIVITY_DELETE = 'activity:delete',

  // Reporting
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',
  REPORT_ADVANCED = 'report:advanced',

  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',

  // System
  SYSTEM_ADMIN = 'system:admin',
  AUDIT_LOG_VIEW = 'audit:view'
}

/**
 * Role-Permission mapping
 * Defines what permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Full access to everything
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,

    Permission.LEAD_CREATE,
    Permission.LEAD_READ,
    Permission.LEAD_READ_ALL,
    Permission.LEAD_UPDATE,
    Permission.LEAD_UPDATE_ALL,
    Permission.LEAD_DELETE,
    Permission.LEAD_ASSIGN,

    Permission.OPPORTUNITY_CREATE,
    Permission.OPPORTUNITY_READ,
    Permission.OPPORTUNITY_READ_ALL,
    Permission.OPPORTUNITY_UPDATE,
    Permission.OPPORTUNITY_UPDATE_ALL,
    Permission.OPPORTUNITY_DELETE,
    Permission.OPPORTUNITY_ASSIGN,

    Permission.ACCOUNT_CREATE,
    Permission.ACCOUNT_READ,
    Permission.ACCOUNT_READ_ALL,
    Permission.ACCOUNT_UPDATE,
    Permission.ACCOUNT_UPDATE_ALL,
    Permission.ACCOUNT_DELETE,

    Permission.CONTACT_CREATE,
    Permission.CONTACT_READ,
    Permission.CONTACT_READ_ALL,
    Permission.CONTACT_UPDATE,
    Permission.CONTACT_UPDATE_ALL,
    Permission.CONTACT_DELETE,

    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_READ,
    Permission.ACTIVITY_READ_ALL,
    Permission.ACTIVITY_UPDATE,
    Permission.ACTIVITY_UPDATE_ALL,
    Permission.ACTIVITY_DELETE,

    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.REPORT_ADVANCED,

    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,

    Permission.SYSTEM_ADMIN,
    Permission.AUDIT_LOG_VIEW
  ],

  [Role.MANAGER]: [
    // Can view users but not manage them
    Permission.USER_READ,

    // Full access to team's data
    Permission.LEAD_CREATE,
    Permission.LEAD_READ,
    Permission.LEAD_READ_ALL,
    Permission.LEAD_UPDATE,
    Permission.LEAD_UPDATE_ALL,
    Permission.LEAD_ASSIGN,

    Permission.OPPORTUNITY_CREATE,
    Permission.OPPORTUNITY_READ,
    Permission.OPPORTUNITY_READ_ALL,
    Permission.OPPORTUNITY_UPDATE,
    Permission.OPPORTUNITY_UPDATE_ALL,
    Permission.OPPORTUNITY_ASSIGN,

    Permission.ACCOUNT_CREATE,
    Permission.ACCOUNT_READ,
    Permission.ACCOUNT_READ_ALL,
    Permission.ACCOUNT_UPDATE,
    Permission.ACCOUNT_UPDATE_ALL,

    Permission.CONTACT_CREATE,
    Permission.CONTACT_READ,
    Permission.CONTACT_READ_ALL,
    Permission.CONTACT_UPDATE,
    Permission.CONTACT_UPDATE_ALL,

    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_READ,
    Permission.ACTIVITY_READ_ALL,
    Permission.ACTIVITY_UPDATE,
    Permission.ACTIVITY_UPDATE_ALL,

    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.REPORT_ADVANCED,

    Permission.SETTINGS_VIEW
  ],

  [Role.SALES_REP]: [
    // Can only manage their own data
    Permission.LEAD_CREATE,
    Permission.LEAD_READ,
    Permission.LEAD_UPDATE,

    Permission.OPPORTUNITY_CREATE,
    Permission.OPPORTUNITY_READ,
    Permission.OPPORTUNITY_UPDATE,

    Permission.ACCOUNT_CREATE,
    Permission.ACCOUNT_READ,
    Permission.ACCOUNT_UPDATE,

    Permission.CONTACT_CREATE,
    Permission.CONTACT_READ,
    Permission.CONTACT_UPDATE,

    Permission.ACTIVITY_CREATE,
    Permission.ACTIVITY_READ,
    Permission.ACTIVITY_UPDATE,

    Permission.REPORT_VIEW,

    Permission.SETTINGS_VIEW
  ],

  [Role.VIEWER]: [
    // Read-only access
    Permission.LEAD_READ,
    Permission.OPPORTUNITY_READ,
    Permission.ACCOUNT_READ,
    Permission.CONTACT_READ,
    Permission.ACTIVITY_READ,
    Permission.REPORT_VIEW
  ]
};

/**
 * Permission checking utilities
 */
export class PermissionChecker {
  private userRole: Role;
  private userId: string;

  constructor(userRole: Role, userId: string) {
    this.userRole = userRole;
    this.userId = userId;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.userRole];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all of the given permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if user can access a resource
   * Resources can be restricted to owner or require specific permissions
   */
  canAccessResource(
    resourceOwnerId: string | null | undefined,
    requiredPermission: Permission,
    requireOwnership: boolean = false
  ): boolean {
    // Check if user has the required permission
    if (!this.hasPermission(requiredPermission)) {
      return false;
    }

    // If ownership is not required, permission is enough
    if (!requireOwnership) {
      return true;
    }

    // Check if user is the owner
    return resourceOwnerId === this.userId;
  }

  /**
   * Check if user can modify a resource
   */
  canModifyResource(
    resourceOwnerId: string | null | undefined,
    updatePermission: Permission,
    updateAllPermission: Permission
  ): boolean {
    // Check if user has permission to update all records
    if (this.hasPermission(updateAllPermission)) {
      return true;
    }

    // Check if user has permission to update their own records and is the owner
    if (this.hasPermission(updatePermission) && resourceOwnerId === this.userId) {
      return true;
    }

    return false;
  }

  /**
   * Get user's role
   */
  getRole(): Role {
    return this.userRole;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.userRole === Role.ADMIN;
  }

  /**
   * Check if user is manager or above
   */
  isManagerOrAbove(): boolean {
    return this.userRole === Role.ADMIN || this.userRole === Role.MANAGER;
  }
}

/**
 * Permission labels for UI display
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.USER_CREATE]: 'Create Users',
  [Permission.USER_READ]: 'View Users',
  [Permission.USER_UPDATE]: 'Update Users',
  [Permission.USER_DELETE]: 'Delete Users',

  [Permission.LEAD_CREATE]: 'Create Leads',
  [Permission.LEAD_READ]: 'View Own Leads',
  [Permission.LEAD_READ_ALL]: 'View All Leads',
  [Permission.LEAD_UPDATE]: 'Update Own Leads',
  [Permission.LEAD_UPDATE_ALL]: 'Update All Leads',
  [Permission.LEAD_DELETE]: 'Delete Leads',
  [Permission.LEAD_ASSIGN]: 'Assign Leads',

  [Permission.OPPORTUNITY_CREATE]: 'Create Opportunities',
  [Permission.OPPORTUNITY_READ]: 'View Own Opportunities',
  [Permission.OPPORTUNITY_READ_ALL]: 'View All Opportunities',
  [Permission.OPPORTUNITY_UPDATE]: 'Update Own Opportunities',
  [Permission.OPPORTUNITY_UPDATE_ALL]: 'Update All Opportunities',
  [Permission.OPPORTUNITY_DELETE]: 'Delete Opportunities',
  [Permission.OPPORTUNITY_ASSIGN]: 'Assign Opportunities',

  [Permission.ACCOUNT_CREATE]: 'Create Accounts',
  [Permission.ACCOUNT_READ]: 'View Own Accounts',
  [Permission.ACCOUNT_READ_ALL]: 'View All Accounts',
  [Permission.ACCOUNT_UPDATE]: 'Update Own Accounts',
  [Permission.ACCOUNT_UPDATE_ALL]: 'Update All Accounts',
  [Permission.ACCOUNT_DELETE]: 'Delete Accounts',

  [Permission.CONTACT_CREATE]: 'Create Contacts',
  [Permission.CONTACT_READ]: 'View Own Contacts',
  [Permission.CONTACT_READ_ALL]: 'View All Contacts',
  [Permission.CONTACT_UPDATE]: 'Update Own Contacts',
  [Permission.CONTACT_UPDATE_ALL]: 'Update All Contacts',
  [Permission.CONTACT_DELETE]: 'Delete Contacts',

  [Permission.ACTIVITY_CREATE]: 'Create Activities',
  [Permission.ACTIVITY_READ]: 'View Own Activities',
  [Permission.ACTIVITY_READ_ALL]: 'View All Activities',
  [Permission.ACTIVITY_UPDATE]: 'Update Own Activities',
  [Permission.ACTIVITY_UPDATE_ALL]: 'Update All Activities',
  [Permission.ACTIVITY_DELETE]: 'Delete Activities',

  [Permission.REPORT_VIEW]: 'View Reports',
  [Permission.REPORT_EXPORT]: 'Export Reports',
  [Permission.REPORT_ADVANCED]: 'Access Advanced Reports',

  [Permission.SETTINGS_VIEW]: 'View Settings',
  [Permission.SETTINGS_UPDATE]: 'Update Settings',

  [Permission.SYSTEM_ADMIN]: 'System Administration',
  [Permission.AUDIT_LOG_VIEW]: 'View Audit Logs'
};

/**
 * Helper hook-style function for use in React components
 */
export function createPermissionChecker(userRole: Role, userId: string): PermissionChecker {
  return new PermissionChecker(userRole, userId);
}
