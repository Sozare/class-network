import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_SESSION_KEY = 'class_network_admin_session';

export interface AdminSession {
  email: string;
  role: 'admin';
  expiresAt: number;
}

export const authService = {
  /**
   * Check if user is currently logged in as admin
   */
  async isAuthenticated(): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // If using Supabase, check email or app_metadata role
          return true;
        }
      } catch (err) {
        console.warn('Supabase auth session check failed:', err);
      }
    }

    // Check local session
    const local = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local) as AdminSession;
        if (parsed.expiresAt > Date.now()) {
          return true;
        }
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      } catch {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }

    return false;
  },

  /**
   * Login as administrator
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is connected, attempt Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session) {
          return { success: true };
        }
      } catch (err: unknown) {
        return { success: false, error: (err as Error).message || 'Authentication error' };
      }
    }

    // 2. Local / Development fallback credentials
    const defaultEmail = (import.meta.env.VITE_ADMIN_EMAIL as string || 'admin@classnetwork.local').toLowerCase();
    const defaultPassword = import.meta.env.VITE_ADMIN_PASSWORD as string || 'AdminClass2026!';

    if (cleanEmail === defaultEmail && password === defaultPassword) {
      const session: AdminSession = {
        email: cleanEmail,
        role: 'admin',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid email or password. For demo mode use: admin@classnetwork.local / AdminClass2026!',
    };
  },

  /**
   * Logout administrator
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },

  /**
   * Get current admin email
   */
  getCurrentUserEmail(): string {
    const local = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (local) {
      try {
        return JSON.parse(local).email;
      } catch {
        return 'admin@classnetwork.local';
      }
    }
    return 'admin@classnetwork.local';
  }
};
