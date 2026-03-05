import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, GraduationCap, ClipboardCheck, TrendingUp, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = [
  "hsl(220, 60%, 22%)", "hsl(175, 50%, 42%)", "hsl(38, 92%, 55%)",
  "hsl(205, 80%, 52%)", "hsl(152, 60%, 42%)",
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const Dashboard = () => {
  const { profile } = useAuth();

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, departments(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*");
      if (error) throw error;
      return data;
    },
  });

  const activeStudents = students.filter((s) => s.status === "Active").length;
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.present).length;
  const avgAttendance = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : "0";

  // Department distribution for pie chart
  const deptData = departments.map((d) => ({
    name: d.name,
    value: students.filter((s) => s.department_id === d.id).length,
  })).filter((d) => d.value > 0);

  // Monthly attendance (simple: group by date)
  const dateMap = new Map<string, { total: number; present: number }>();
  attendanceRecords.forEach((a) => {
    const key = a.date;
    const existing = dateMap.get(key) || { total: 0, present: 0 };
    existing.total++;
    if (a.present) existing.present++;
    dateMap.set(key, existing);
  });
  const attendanceChart = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rate: Math.round((val.present / val.total) * 100),
    }));

  const recentStudents = students.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {profile?.full_name || "User"}
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <StatCard icon={Users} title="Total Students" value={String(students.length)} change={`${activeStudents} active`} changeType="positive" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={BookOpen} title="Active Courses" value={String(courses.length)} iconColor="bg-secondary/10" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={ClipboardCheck} title="Avg Attendance" value={`${avgAttendance}%`} iconColor="bg-warning/10" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={TrendingUp} title="Departments" value={String(departments.length)} iconColor="bg-success/10" />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 elevated-card rounded-xl p-5">
            <h3 className="font-heading font-semibold text-base mb-4">Attendance by Date</h3>
            {attendanceChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={attendanceChart} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-xs" />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }} />
                  <Bar dataKey="rate" fill="hsl(175, 50%, 42%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No attendance data yet</p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="elevated-card rounded-xl p-5">
            <h3 className="font-heading font-semibold text-base mb-4">Students by Dept.</h3>
            {deptData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {deptData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {deptData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No data yet</p>
            )}
          </motion.div>
        </div>

        {/* Recent Students */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="elevated-card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base">Recent Students</h3>
            <a href="/students" className="text-sm text-secondary font-medium hover:underline">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">GPA</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s: any) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{s.student_id}</td>
                    <td className="px-5 py-3.5 font-medium">{s.full_name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.departments?.name || "—"}</td>
                    <td className="px-5 py-3.5 font-medium">{s.gpa}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
