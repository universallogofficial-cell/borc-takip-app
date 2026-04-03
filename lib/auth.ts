import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AuthContext } from "@/types/finance";

export function buildAuthContext(userId?: string | null): AuthContext {
  return {
    userId: userId || null,
    mode: userId ? "scoped" : "demo",
  };
}

export function getAuthModeLabel(context: AuthContext) {
  return context.mode === "scoped" ? "Kullanıcı scope aktif" : "Demo / Local mod";
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signInWithMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo:
        typeof window === "undefined" ? undefined : window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function subscribeToAuthChanges(
  callback: (session: Session | null) => void,
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => subscription.unsubscribe();
}
