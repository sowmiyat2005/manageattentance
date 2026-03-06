import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { User, Shield, Bell, Palette } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [attendanceAlert, setAttendanceAlert] = useState(true);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password: undefined });
    // In a real app, we'd collect the new password from a form
    toast.info("Password change feature — please use the forgot password flow from the login page");
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and system preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5"><User className="w-3.5 h-3.5" /> Profile</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Security</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5"><Bell className="w-3.5 h-3.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5"><Palette className="w-3.5 h-3.5" /> Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="elevated-card rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-heading font-semibold text-lg">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
              <Separator />
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <Button onClick={handleUpdateProfile} disabled={saving} className="w-fit">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="elevated-card rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-heading font-semibold text-lg">Security Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your account security</p>
              </div>
              <Separator />
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                  <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">You are currently signed in</p>
                  <div className="rounded-lg border border-border p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="elevated-card rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-heading font-semibold text-lg">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground">Configure how you receive notifications</p>
              </div>
              <Separator />
              <div className="space-y-5 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Attendance Alerts</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Get alerted when attendance drops below 75%</p>
                  </div>
                  <Switch checked={attendanceAlert} onCheckedChange={setAttendanceAlert} />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="elevated-card rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-heading font-semibold text-lg">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize the look and feel</p>
              </div>
              <Separator />
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">Select your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Light", active: true, bg: "bg-background", border: "border-primary" },
                      { label: "Dark", active: false, bg: "bg-foreground", border: "border-border" },
                      { label: "System", active: false, bg: "bg-gradient-to-br from-background to-foreground", border: "border-border" },
                    ].map((t) => (
                      <button key={t.label} className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${t.active ? t.border : "border-border hover:border-muted-foreground"}`}>
                        <div className={`w-full h-8 rounded mb-2 ${t.bg}`} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
