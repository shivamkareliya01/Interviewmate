import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Code2,
  Building2,
  History,
  BarChart3,
  Bookmark,
  Settings,
  Sparkles,
  LogOut,
  Bot,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", to: "/user/dashboard", icon: LayoutDashboard },
  { label: "Practice", to: "/user/practice", icon: Code2 },
  { label: "Companies", to: "/user/companies", icon: Building2 },
  { label: "Resume", to: "/user/resume", icon: FileText },
  { label: "History", to: "/user/history", icon: History },
  { label: "Analytics", to: "/user/analytics", icon: BarChart3 },
  { label: "Bookmarks", to: "/user/bookmarks", icon: Bookmark },
  { label: "Settings", to: "/user/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    void navigate({ to: "/", replace: true });
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : profile?.username || user?.name || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-teal-900/30 sticky top-0 z-40">
        <Link
          to="/user/dashboard"
          onClick={(e) => {
            e.preventDefault();
            setMobileOpen(false);
            void navigate({ to: "/user/dashboard" });
          }}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-bold">
            <Code2 className="size-4" />
          </div>
          <h2 className="font-bold text-base text-white">
            Interview<span className="text-teal-400">Mate</span>
          </h2>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw]"
            : "hidden md:flex"
        } md:sticky md:top-0 h-screen max-h-screen w-full md:w-64 shrink-0 border-r border-teal-900/30 bg-slate-950/95 text-slate-200 backdrop-blur-xl flex-col overflow-hidden select-none z-30`}
      >
        {/* Pinned Top Navbar Header */}
        <div className="flex-none p-4 border-b border-slate-800/60 bg-slate-950/95 flex items-center justify-between">
          <Link
            to="/user/dashboard"
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
              void navigate({ to: "/user/dashboard" });
            }}
            className="flex items-center gap-3 group hover:opacity-95 transition-opacity cursor-pointer"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none tracking-tight text-white flex items-center gap-1.5">
                Interview<span className="text-teal-400">Mate</span>
              </h2>
              <p className="text-[11px] text-teal-400/70 font-medium tracking-wide">
                Interview Practice AI
              </p>
            </div>
          </Link>

          {/* Close button for Mobile Drawer view */}
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="md:hidden size-8 text-slate-400 hover:text-white"
            >
              <X className="size-5" />
            </Button>
          )}
        </div>

        {/* Scrollable Navigation Links Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon
                    className={`size-4.5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto size-1.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pinned Bottom Section */}
        <div className="flex-none p-4 space-y-3 border-t border-slate-800/60 bg-slate-950/95">
          {/* AI Interviewer Status Widget */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-teal-500/20 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <Bot className="size-4" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-teal-400 animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-teal-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">AI Interviewer</p>
                <p className="text-[10px] text-teal-400/90 font-medium">● Online & Ready</p>
              </div>
            </div>
            <Sparkles className="size-4 text-teal-400/60" />
          </div>

          {/* User Profile Card & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8 border border-teal-500/30">
                <AvatarImage src={profile?.avatar_url || user?.image || undefined} />
                <AvatarFallback className="bg-teal-950 text-teal-300 font-semibold text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="size-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
