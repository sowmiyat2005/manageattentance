import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

const Attendance = () => {
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, students(full_name, student_id)")
        .order("date");
      if (error) throw error;
      return data;
    },
  });

  // Group by student
  const studentAttendance = useMemo(() => {
    const map = new Map<string, { name: string; sid: string; records: { date: string; present: boolean }[] }>();
    attendanceRecords.forEach((a: any) => {
      const key = a.student_id;
      if (!map.has(key)) {
        map.set(key, {
          name: a.students?.full_name || "Unknown",
          sid: a.students?.student_id || "",
          records: [],
        });
      }
      map.get(key)!.records.push({ date: a.date, present: a.present });
    });
    return Array.from(map.values());
  }, [attendanceRecords]);

  // Get unique dates sorted
  const dates = useMemo(() => {
    const set = new Set(attendanceRecords.map((a: any) => a.date));
    return Array.from(set).sort();
  }, [attendanceRecords]);

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
            <span>{dates.length} days recorded</span>
          </div>
        </div>

        {studentAttendance.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground min-w-[180px]">Student</th>
                    {dates.map((d) => (
                      <th key={d} className="text-center px-2 py-3 font-medium text-muted-foreground text-xs w-10">
                        {new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </th>
                    ))}
                    <th className="text-center px-5 py-3 font-medium text-muted-foreground">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.map((s, idx) => {
                    const presentCount = s.records.filter((r) => r.present).length;
                    const pct = s.records.length > 0 ? Math.round((presentCount / s.records.length) * 100) : 0;
                    const dateMap = new Map(s.records.map((r) => [r.date, r.present]));
                    return (
                      <motion.tr key={s.sid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-b border-border last:border-0">
                        <td className="px-5 py-3">
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.sid}</p>
                        </td>
                        {dates.map((d) => {
                          const present = dateMap.get(d);
                          if (present === undefined) {
                            return <td key={d} className="text-center px-2 py-3"><div className="w-7 h-7 rounded-md bg-muted/50 mx-auto" /></td>;
                          }
                          return (
                            <td key={d} className="text-center px-2 py-3">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto ${
                                present ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                              }`}>
                                {present ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </div>
                            </td>
                          );
                        })}
                        <td className="text-center px-5 py-3">
                          <span className={`font-heading font-bold text-sm ${
                            pct >= 90 ? "text-success" : pct >= 75 ? "text-warning" : "text-destructive"
                          }`}>{pct}%</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="elevated-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No attendance records yet.</p>
          </div>
        )}

        <div className="flex gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-success/10 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-success" /></div>
            Present
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-destructive/10 flex items-center justify-center"><X className="w-2.5 h-2.5 text-destructive" /></div>
            Absent
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
