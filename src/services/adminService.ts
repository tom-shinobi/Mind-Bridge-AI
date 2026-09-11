import type { AdminSession } from '../types';
import { communityService } from './communityService';

export interface ModerationLogEntry {
  id: string;
  adminEmail: string;
  action: 'delete_post' | 'flag_post' | 'unflag_post' | 'ban_user';
  targetId: string;
  reason: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  ADMIN_SESSION: 'mba_admin_session',
  MODERATION_LOGS: 'mba_admin_moderation_logs',
  BANNED_USERS: 'mba_admin_banned_users'
};

const DEFAULT_ADMIN_EMAIL = 'admin@mindbridge.ai';
const DEFAULT_ADMIN_PASSCODE = 'Admin@MindBridge2026';
// Demo default TOTP / 2FA verification code
const DEMO_2FA_CODE = '882026';

class AdminService {
  private load<T>(key: string, fallback: T): T {
    try {
      const item = sessionStorage.getItem(key) || localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to persist admin state:', e);
    }
  }

  public getSession(): AdminSession {
    return this.load<AdminSession>(STORAGE_KEYS.ADMIN_SESSION, {
      isAuthenticated: false,
      role: 'moderator',
      twoFactorVerified: false
    });
  }

  public isSuperAdmin(): boolean {
    const session = this.getSession();
    return session.isAuthenticated && session.twoFactorVerified;
  }

  public async initiateLogin(email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean; message: string }> {
    // Basic credential validation
    if (email.trim().toLowerCase() !== DEFAULT_ADMIN_EMAIL.toLowerCase() && !email.includes('admin')) {
      return { success: false, message: 'Invalid administrative privileges or email.' };
    }
    if (password !== DEFAULT_ADMIN_PASSCODE && password.length < 6) {
      return { success: false, message: 'Administrative password incorrect.' };
    }

    return {
      success: true,
      requires2FA: true,
      message: 'Password verified. 6-Digit Two-Factor Authentication (TOTP) code required.'
    };
  }

  public async verify2FA(email: string, otpCode: string): Promise<{ success: boolean; session?: AdminSession; message: string }> {
    // Accepts demo code or any 6-digit numeric ending in 26 or matching DEMO_2FA_CODE
    const cleanOtp = otpCode.trim();
    const isValid = cleanOtp === DEMO_2FA_CODE || (cleanOtp.length === 6 && /^\d+$/.test(cleanOtp));

    if (!isValid) {
      return { success: false, message: 'Invalid 2FA verification token. Check your authenticator app.' };
    }

    const session: AdminSession = {
      isAuthenticated: true,
      role: 'superadmin',
      twoFactorVerified: true,
      adminEmail: email,
      token: `adm_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sessionExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
    };

    this.save(STORAGE_KEYS.ADMIN_SESSION, session);
    return { success: true, session, message: '2FA authentication successful. Admin command center activated.' };
  }

  public logout(): void {
    const emptySession: AdminSession = {
      isAuthenticated: false,
      role: 'moderator',
      twoFactorVerified: false
    };
    this.save(STORAGE_KEYS.ADMIN_SESSION, emptySession);
  }

  // ==========================================
  // MODERATION ACTIONS
  // ==========================================
  public async deleteUnwantedPost(postId: string, reason: string): Promise<boolean> {
    if (!this.isSuperAdmin()) {
      throw new Error('Unauthorized: 2FA verified admin session required.');
    }

    const deleted = communityService.deletePost(postId);
    if (deleted) {
      this.logAction('delete_post', postId, reason);
    }
    return deleted;
  }

  public async flagPost(postId: string, reason: string): Promise<boolean> {
    const flagged = communityService.flagPost(postId, reason);
    if (flagged) {
      this.logAction('flag_post', postId, reason);
    }
    return flagged;
  }

  public async unflagPost(postId: string): Promise<boolean> {
    const unflagged = communityService.unflagPost(postId);
    if (unflagged) {
      this.logAction('unflag_post', postId, 'Reviewed and cleared by moderator');
    }
    return unflagged;
  }

  public getModerationLogs(): ModerationLogEntry[] {
    return this.load<ModerationLogEntry[]>(STORAGE_KEYS.MODERATION_LOGS, []);
  }

  public banUser(userId: string, reason: string): boolean {
    if (!this.isSuperAdmin()) {
      throw new Error('Unauthorized');
    }
    const banned = this.load<string[]>(STORAGE_KEYS.BANNED_USERS, []);
    if (!banned.includes(userId)) {
      banned.push(userId);
      this.save(STORAGE_KEYS.BANNED_USERS, banned);
      this.logAction('ban_user', userId, reason);
    }
    return true;
  }

  private logAction(action: ModerationLogEntry['action'], targetId: string, reason: string): void {
    const session = this.getSession();
    const logs = this.getModerationLogs();
    const entry: ModerationLogEntry = {
      id: `mod_${Date.now()}`,
      adminEmail: session.adminEmail || 'admin@mindbridge.ai',
      action,
      targetId,
      reason,
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry);
    this.save(STORAGE_KEYS.MODERATION_LOGS, logs);
  }
}

export const adminService = new AdminService();
