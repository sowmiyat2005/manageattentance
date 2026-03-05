import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Users, GraduationCap, ClipboardCheck, TrendingUp, BookOpen, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const attendanceData = [
  { month: "Jan", rate: 92 },
  { month: "Feb", rate: 88 },
  { month: "Mar", rate: 95 },
  { month: "Apr", rate: 90 },
  { month: "May", rate: 87 },
  { month: "Jun", rate: 93 },
];

const departmentData = [
  { name: "Computer Science", value: 420 },
  { name: "Engineering", value: 350 },
  { name: "Business", value: 280 },
  { name: "Arts", value: 180 },
  { name: "Science", value: 310 },
];

const COLORS = [
  "hsl(220, 60%, 22%)",
  "hsl(175, 50%, 42%)",
  "hsl(38, 92%, 55%)",
  "hsl(205, 80%, 52%)",
  "hsl(152, 60%, 42%)",
];

const recentStudents = [
  { id: "STU-001", name: "Aarav Sharma", dept: "Computer Science", gpa: "3.8", status: "Active" },
  { id: "STU-002", name: "Priya Patel", dept: "Engineering", gpa: "3.6", status: "Active" },
  { id: "STU-003", name: "Rahul Kumar", dept: "Business", gpa: "3.9", status: "Active" },
  { id: "STU-004", name: "Ananya Singh", dept: "Science", gpa: "3.5", status: "On Leave" },
  { id: "STU-005", name: "Vikram Reddy", dept: "Arts", gpa: "3.7", status: "Active" },
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
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, Administrator</p>
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <StatCard icon={Users} title="Total Students" value="2,420" change="+12% from last month" changeType="positive" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={BookOpen} title="Active Courses" value="156" change="+3 new this semester" changeType="positive" iconColor="bg-secondary/10" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={ClipboardCheck} title="Avg Attendance" value="91.2%" change="-1.3% from last week" changeType="negative" iconColor="bg-warning/10" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard icon={TrendingUp} title="Pass Rate" value="94.8%" change="+2.1% improvement" changeType="positive" iconColor="bg-success/10" />
          </motion.div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 elevated-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold text-base mb-4">Monthly Attendance Rate</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="rate" fill="hsl(175, 50%, 42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="elevated-card rounded-xl p-5"
          >
            <h3 className="font-heading font-semibold text-base mb-4">Students by Dept.</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {departmentData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="elevated-card rounded-xl overflow-hidden"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base">Recent Students</h3>
            <a href="/students" className="text-sm text-secondary font-medium hover:underline">
              View all →
            </a>
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
                {recentStudents.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{s.id}</td>
                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.dept}</td>
                    <td className="px-5 py-3.5 font-medium">{s.gpa}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "Active"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
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
