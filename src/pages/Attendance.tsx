import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar, Check, X, Minus } from "lucide-react";

const attendanceData = [
  { name: "Aarav Sharma", id: "STU-001", days: [true, true, true, false, true, true, true, true, false, true], pct: 80 },
  { name: "Priya Patel", id: "STU-002", days: [true, true, true, true, true, true, true, true, true, true], pct: 100 },
  { name: "Rahul Kumar", id: "STU-003", days: [true, false, true, true, true, false, true, true, true, true], pct: 80 },
  { name: "Ananya Singh", id: "STU-004", days: [true, true, false, false, true, true, false, true, true, true], pct: 70 },
  { name: "Vikram Reddy", id: "STU-005", days: [true, true, true, true, true, true, true, false, true, true], pct: 90 },
  { name: "Sneha Gupta", id: "STU-006", days: [true, true, true, true, false, true, true, true, true, true], pct: 90 },
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue", "Wed", "Thu", "Fri"];

const Attendance = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Attendance</h1>
            <p className="text-muted-foreground text-sm mt-1">Track student attendance records</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Week of March 1 – March 14, 2026</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="elevated-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground min-w-[180px]">Student</th>
                  {dayLabels.map((d, i) => (
                    <th key={i} className="text-center px-2 py-3 font-medium text-muted-foreground text-xs w-10">
                      {d}
                    </th>
                  ))}
                  <th className="text-center px-5 py-3 font-medium text-muted-foreground">Rate</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((s, idx) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.id}</p>
                    </td>
                    {s.days.map((present, i) => (
                      <td key={i} className="text-center px-2 py-3">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto ${
                            present
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {present ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                      </td>
                    ))}
                    <td className="text-center px-5 py-3">
                      <span
                        className={`font-heading font-bold text-sm ${
                          s.pct >= 90
                            ? "text-success"
                            : s.pct >= 75
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {s.pct}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-success/10 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-success" />
            </div>
            Present
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-destructive/10 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-destructive" />
            </div>
            Absent
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
