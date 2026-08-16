import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { authClient, useSession } from "@/lib/auth-client";

export type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: "admin" | "user";
  status: string;
  total_points: number;
  practice_sessions_completed: number;
  mock_interviews_completed: number;
  bookmarked_questions: string[];
};

type AuthContextValue = {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionData, setSessionData] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsPending(true);
    authClient.getSession().then(({ data, error }) => {
      if (mounted) {
        setSessionData(data);
        setIsPending(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const user = sessionData?.user ?? null;
  const session = sessionData?.session ?? null;

  const profile: Profile | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? null,
      username: user.name ?? user.email?.split("@")[0] ?? "user",
      first_name: user.name?.split(" ")[0] ?? null,
      last_name: user.name?.split(" ").slice(1).join(" ") ?? null,
      avatar_url: user.image ?? null,
      role: (user as any).role === "admin" ? "admin" : "user",
      status: "active",
      total_points: 0,
      practice_sessions_completed: 0,
      mock_interviews_completed: 0,
      bookmarked_questions: [],
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isAdmin: profile?.role === "admin",
      loading: isPending,
      signOut: async () => {
        await authClient.signOut();
      },
      refreshProfile: async () => {
        // Handled automatically by Better Auth useSession
      },
    }),
    [session, user, profile, isPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
