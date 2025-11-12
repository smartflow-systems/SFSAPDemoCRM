import crypto from 'crypto';
import type { InsertMfaSecret } from '../shared/schema';

/**
 * MFA Service using TOTP (Time-based One-Time Password)
 * Compatible with Google Authenticator, Authy, Microsoft Authenticator, etc.
 */
export class MFAService {
  constructor(private storage: any) {}

  /**
   * Generate a secret key for TOTP
   */
  private generateSecret(): string {
    // Generate a base32 encoded secret (32 characters)
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  /**
   * Base32 encoding (required for TOTP)
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Generate backup codes (one-time use recovery codes)
   */
  private generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  /**
   * Setup MFA for a user
   * @returns Object containing secret and QR code data
   */
  async setupMFA(userId: string, userEmail: string, appName: string = 'SFS CRM') {
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();

    // Store MFA secret
    const mfaSecret: InsertMfaSecret = {
      userId,
      secret,
      backupCodes,
    };

    await this.storage.createMfaSecret(mfaSecret);

    // Generate otpauth URL for QR code
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;

    return {
      secret,
      backupCodes,
      qrCodeUrl: otpauthUrl,
    };
  }

  /**
   * Verify TOTP code
   */
  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const mfaSecret = await this.storage.getMfaSecret(userId);

    if (!mfaSecret) {
      return false;
    }

    // Verify the token with time window (allows for clock skew)
    const isValid = this.verifyToken(mfaSecret.secret, token);

    return isValid;
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const mfaSecret = await this.storage.getMfaSecret(userId);

    if (!mfaSecret || !mfaSecret.backupCodes) {
      return false;
    }

    const codeIndex = mfaSecret.backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    const updatedCodes = mfaSecret.backupCodes.filter((c) => c !== code);
    await this.storage.updateMfaBackupCodes(userId, updatedCodes);

    return true;
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(userId: string): Promise<void> {
    await this.storage.deleteMfaSecret(userId);
    await this.storage.updateUserMfaStatus(userId, false);
  }

  /**
   * Enable MFA for a user (after successful setup and verification)
   */
  async enableMFA(userId: string): Promise<void> {
    await this.storage.updateUserMfaStatus(userId, true);
  }

  /**
   * Generate regenerated backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newCodes = this.generateBackupCodes();
    await this.storage.updateMfaBackupCodes(userId, newCodes);
    return newCodes;
  }

  /**
   * Verify TOTP token with time window
   */
  private verifyToken(secret: string, token: string, window: number = 1): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeStep = 30; // TOTP standard: 30 second intervals

    // Check current time and adjacent time windows
    for (let i = -window; i <= window; i++) {
      const time = Math.floor(currentTime / timeStep) + i;
      const expectedToken = this.generateTOTP(secret, time);

      if (expectedToken === token) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate TOTP code for a given time
   */
  private generateTOTP(secret: string, time: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(time));

    // Decode base32 secret
    const key = this.base32Decode(secret);

    // HMAC-SHA1
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const hash = hmac.digest();

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const code =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    // Return 6-digit code
    return (code % 1000000).toString().padStart(6, '0');
  }

  /**
   * Base32 decoding
   */
  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < encoded.length; i++) {
      const idx = alphabet.indexOf(encoded[i].toUpperCase());
      if (idx === -1) continue;

      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await this.storage.getUser(userId);
    return user?.mfaEnabled || false;
  }
}
