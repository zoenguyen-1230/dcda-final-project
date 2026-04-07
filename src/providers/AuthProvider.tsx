import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseCredentials } from "../config/env";
import { supabase } from "../lib/supabase";

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  initialized: boolean;
  isDemoMode: boolean;
  session: Session | null;
  user: User | null;
  userEmail: string | null;
  displayName: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [demoUserEmail, setDemoUserEmail] = useState<string | null>(null);
  const [demoDisplayName, setDemoDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseCredentials) {
      setInitialized(true);
      return;
    }

    let isActive = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (!error) {
          startTransition(() => {
            setSession(data.session);
          });
        }

        setInitialized(true);
      })
      .catch(() => {
        if (isActive) {
          setInitialized(true);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      startTransition(() => {
        setSession(nextSession);
      });
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!hasSupabaseCredentials) {
      startTransition(() => {
        setDemoUserEmail(email);
        setDemoDisplayName(email.split("@")[0] || "Guest");
      });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message ?? null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> => {
    if (!hasSupabaseCredentials) {
      startTransition(() => {
        setDemoUserEmail(email);
        setDemoDisplayName(fullName || email.split("@")[0] || "Guest");
      });
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!hasSupabaseCredentials) {
      startTransition(() => {
        setDemoUserEmail(null);
        setDemoDisplayName(null);
      });
      return;
    }

    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    const displayNameFromMetadata =
      typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null;

    return {
      initialized,
      isDemoMode: !hasSupabaseCredentials,
      session,
      user,
      userEmail: user?.email ?? demoUserEmail,
      displayName: displayNameFromMetadata ?? demoDisplayName,
      signIn,
      signUp,
      signOut,
    };
  }, [demoDisplayName, demoUserEmail, initialized, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
