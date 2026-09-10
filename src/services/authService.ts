import { getSupabaseClient } from './supabaseClient';
import type { AuthUser } from '../types';

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;
}

const WEBAUTHN_LOCAL_CREDENTIALS = 'mba_webauthn_credentials';

class AuthService {
  /**
   * Check if user is currently signed in via Supabase
   */
  public async getSession() {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getSession();
      if (error || !data.session) return null;
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Sign up with Email + Password + Full Name
   */
  public async signUpWithEmail(email: string, password: string, fullName: string): Promise<{ user: AuthUser | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: 'Supabase is not configured. Please enter your Supabase URL & Key.' };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: fullName
          },
          error: null
        };
      }

      return { user: null, error: 'Registration incomplete' };
    } catch (err: unknown) {
      const e = err as Error;
      return { user: null, error: e.message || 'Signup failed' };
    }
  }

  /**
   * Sign in with Email + Password
   */
  public async signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: 'Supabase is not configured.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email
          },
          error: null
        };
      }

      return { user: null, error: 'Login failed' };
    } catch (err: unknown) {
      const e = err as Error;
      return { user: null, error: e.message || 'Authentication failed' };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  public async signInWithGoogle(): Promise<{ error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: 'Supabase is not configured.' };
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (err: unknown) {
      const e = err as Error;
      return { error: e.message || 'Google OAuth failed' };
    }
  }

  /**
   * Send Password Reset Email
   */
  public async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message || 'Reset password request failed' };
    }
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<void> {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
  }

  /**
   * Listen to Auth state changes
   */
  public onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const client = getSupabaseClient();
    if (!client) return () => {};

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email
        });
      } else {
        callback(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }

  // ============================================================================
  // WEBAUTHN / BIOMETRIC PASSKEY UNLOCK (Windows Hello / Face ID / Touch ID)
  // No face images or embeddings stored - purely device-handled platform authenticator
  // ============================================================================

  public async isPasskeySupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential) return false;
    try {
      if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if this device has an enrolled biometric passkey locally
   */
  public hasLocalPasskey(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const creds = localStorage.getItem(WEBAUTHN_LOCAL_CREDENTIALS);
      return Boolean(creds && JSON.parse(creds).length > 0);
    } catch {
      return false;
    }
  }

  /**
   * Register biometric passkey on current device
   */
  public async registerPasskey(userId: string, email: string, name: string): Promise<{ success: boolean; error: string | null }> {
    const isSupported = await this.isPasskeySupported();
    if (!isSupported) {
      return { success: false, error: 'Biometric passkeys (Face ID / Windows Hello) are not supported on this device or browser.' };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBytes = new TextEncoder().encode(userId);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'MindBridge AI',
            id: window.location.hostname
          },
          user: {
            id: userIdBytes,
            name: email,
            displayName: name || email
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'none'
        }
      })) as PublicKeyCredential | null;

      if (!credential) {
        return { success: false, error: 'Passkey registration was canceled or timed out.' };
      }

      // Convert credential ID to Base64
      const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));

      // Save locally for quick device verification
      const existing = this.getLocalCredentials();
      existing.push({
        userId,
        email,
        credentialId: rawId,
        registeredAt: new Date().toISOString()
      });
      localStorage.setItem(WEBAUTHN_LOCAL_CREDENTIALS, JSON.stringify(existing));

      // Also persist to Supabase if configured
      const client = getSupabaseClient();
      if (client) {
        await client.from('webauthn_credentials').insert({
          user_id: userId,
          credential_id: rawId,
          public_key: rawId,
          device_name: navigator.userAgent.includes('Windows') ? 'Windows Hello' : navigator.userAgent.includes('Mac') ? 'Touch ID / Face ID' : 'Platform Authenticator'
        });
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message || 'Failed to register biometric passkey.' };
    }
  }

  /**
   * Unlock with Face / Biometric Passkey
   */
  public async authenticateWithPasskey(): Promise<{ success: boolean; user?: AuthUser; error: string | null }> {
    const isSupported = await this.isPasskeySupported();
    if (!isSupported) {
      return { success: false, error: 'Biometric unlock is not supported on this browser.' };
    }

    const localCreds = this.getLocalCredentials();
    if (localCreds.length === 0) {
      return { success: false, error: 'No biometric passkey registered on this device yet. Please log in with password first to enable biometric unlock.' };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const allowCredentials = localCreds.map((c) => {
        const idBytes = Uint8Array.from(atob(c.credentialId), (ch) => ch.charCodeAt(0));
        return {
          id: idBytes,
          type: 'public-key' as const
        };
      });

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: 'preferred',
          timeout: 60000,
          rpId: window.location.hostname
        }
      })) as PublicKeyCredential | null;

      if (!assertion) {
        return { success: false, error: 'Biometric authentication was canceled.' };
      }

      const verifiedId = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));
      const matched = localCreds.find((c) => c.credentialId === verifiedId) || localCreds[0];

      return {
        success: true,
        user: {
          id: matched.userId,
          email: matched.email
        },
        error: null
      };
    } catch (err: unknown) {
      const e = err as Error;
      return { success: false, error: e.message || 'Biometric verification failed.' };
    }
  }

  private getLocalCredentials(): Array<{ userId: string; email: string; credentialId: string; registeredAt: string }> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(WEBAUTHN_LOCAL_CREDENTIALS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();
