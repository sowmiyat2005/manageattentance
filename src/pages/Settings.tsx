import { DashboardLayout } from "@/components/DashboardLayout";

const SettingsPage = () => (
  <DashboardLayout>
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground text-sm mt-1 mb-8">Manage system configuration</p>
      <div className="elevated-card rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Settings panel coming soon.</p>
      </div>
    </div>
  </DashboardLayout>
);

export default SettingsPage;
