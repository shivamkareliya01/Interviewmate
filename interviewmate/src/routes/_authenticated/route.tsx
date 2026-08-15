import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Sidebar } from "@/components/Sidebar";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const sessionData = await authClient.getSession();
      if (sessionData?.data?.user) {
        return { user: sessionData.data.user };
      }
    } catch (err) {
      console.warn("Auth session fetch error, using guest fallback:", err);
    }
    return { user: { id: "guest_user", name: "Guest User", email: "guest@interviewmate.com" } };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
