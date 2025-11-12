import crypto from 'crypto';
import type { InsertPasswordResetToken } from '../shared/schema';

export class PasswordResetService {
  constructor(private storage: any) {}

  /**
   * Create a password reset token for a user
   * @returns The reset token (to be sent via email)
   */
  async createResetToken(userId: string): Promise<string> {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetToken: InsertPasswordResetToken = {
      userId,
      token,
      expiresAt,
      used: false,
    };

    await this.storage.createPasswordResetToken(resetToken);

    return token;
  }

  /**
   * Validate a reset token
   * @returns The user ID if valid, null otherwise
   */
  async validateToken(token: string): Promise<string | null> {
    const resetToken = await this.storage.getPasswordResetToken(token);

    if (!resetToken) {
      return null;
    }

    // Check if token is already used
    if (resetToken.used) {
      return null;
    }

    // Check if token is expired
    const now = new Date();
    if (now > resetToken.expiresAt) {
      return null;
    }

    return resetToken.userId;
  }

  /**
   * Mark a token as used
   */
  async markTokenAsUsed(token: string): Promise<void> {
    await this.storage.markPasswordResetTokenUsed(token);
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = await this.validateToken(token);

    if (!userId) {
      return false;
    }

    // Hash the new password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.storage.updateUserPassword(userId, hashedPassword);

    // Mark token as used
    await this.markTokenAsUsed(token);

    return true;
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    return await this.storage.deleteExpiredPasswordResetTokens();
  }

  /**
   * Send password reset email (placeholder - integrate with email service)
   */
  async sendResetEmail(email: string, token: string, tenantSubdomain?: string): Promise<void> {
    // In production, integrate with SendGrid, AWS SES, or similar
    const resetUrl = tenantSubdomain
      ? `https://${tenantSubdomain}.yourcrm.com/reset-password?token=${token}`
      : `https://yourcrm.com/reset-password?token=${token}`;

    console.log(`
======================================
PASSWORD RESET EMAIL
======================================
To: ${email}
Subject: Reset Your Password

Hello,

You requested to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

======================================
    `);

    // TODO: Integrate with actual email service
    // await emailService.send({
    //   to: email,
    //   subject: 'Reset Your Password',
    //   template: 'password-reset',
    //   data: { resetUrl }
    // });
  }
}
