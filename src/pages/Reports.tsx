import { DashboardLayout } from "@/components/DashboardLayout";

const Reports = () => (
  <DashboardLayout>
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="font-heading text-2xl font-bold">Reports</h1>
      <p className="text-muted-foreground text-sm mt-1 mb-8">Generate and download academic reports</p>
      <div className="elevated-card rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Report generation coming soon.</p>
      </div>
    </div>
  </DashboardLayout>
);

export default Reports;
