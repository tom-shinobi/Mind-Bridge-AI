import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'mba_supabase_url';
const STORAGE_KEY_KEY = 'mba_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
  const envKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  let localUrl = '';
  let localKey = '';
  if (typeof window !== 'undefined') {
    localUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
    localKey = (localStorage.getItem(STORAGE_KEY_KEY) || '').trim();
  }

  return {
    url: envUrl || localUrl,
    anonKey: envKey || localKey
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey && config.url.startsWith('http'));
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mba_supabase_auth_token'
      }
    });
  }

  return clientInstance;
}

// Fallback stub client when not configured so imports don't crash
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'placeholder';
export const supabase: SupabaseClient = getSupabaseClient() || createClient(dummyUrl, dummyKey, {
  auth: { persistSession: false }
});
