import { createFileRoute } from "@tanstack/react-router";
import { Settings, User, Key, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/user/settings")({
  head: () => ({ meta: [{ title: "Account Settings | InterviewMate" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="size-6 text-teal-400" />
          Account & Profile Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-300">Email Address</Label>
          <Input value={user?.email || ""} disabled className="bg-slate-950 border-slate-800 text-slate-400" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-300">First Name</Label>
          <Input defaultValue={profile?.first_name || ""} className="bg-slate-950 border-slate-800 text-slate-200" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-300">Last Name</Label>
          <Input defaultValue={profile?.last_name || ""} className="bg-slate-950 border-slate-800 text-slate-200" />
        </div>

        <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
