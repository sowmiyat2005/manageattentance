import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Check, X, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Attendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [markOpen, setMarkOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

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

  const { data: courses = [] } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, name, code").order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("id, full_name, student_id").order("student_id");
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

  const dates = useMemo(() => {
    const set = new Set(attendanceRecords.map((a: any) => a.date));
    return Array.from(set).sort();
  }, [attendanceRecords]);

  const handleOpenMark = () => {
    const initial: Record<string, boolean> = {};
    students.forEach((s: any) => { initial[s.id] = true; });
    setPresentMap(initial);
    setSelectedCourse("");
    setSelectedDate(new Date());
    setMarkOpen(true);
  };

  const handleSubmitAttendance = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }
    setSubmitting(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const rows = students.map((s: any) => ({
      student_id: s.id,
      course_id: selectedCourse,
      date: dateStr,
      present: presentMap[s.id] ?? true,
      marked_by: user?.id || null,
    }));

    const { error } = await supabase.from("attendance").insert(rows);
    if (error) {
      toast.error("Failed to save attendance: " + error.message);
    } else {
      toast.success(`Attendance marked for ${dateStr}`);
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      setMarkOpen(false);
    }
    setSubmitting(false);
  };

  const toggleAll = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    students.forEach((s: any) => { updated[s.id] = checked; });
    setPresentMap(updated);
  };

  const allChecked = students.length > 0 && students.every((s: any) => presentMap[s.id]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Attendance</h1>
            <p className="text-muted-foreground text-sm mt-1">Track student attendance records</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              {dates.length} days recorded
            </span>
            <Button onClick={handleOpenMark} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Mark Attendance
            </Button>
          </div>
        </div>

        {/* Mark Attendance Dialog */}
        <Dialog open={markOpen} onOpenChange={setMarkOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
              <DialogDescription>Select date, course, and mark student presence</DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={allChecked} onCheckedChange={(c) => toggleAll(!!c)} />
                        Student
                      </div>
                    </th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground w-20">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s: any) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={presentMap[s.id] ?? true}
                            onCheckedChange={(c) => setPresentMap((prev) => ({ ...prev, [s.id]: !!c }))}
                          />
                          <div>
                            <p className="font-medium">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground">{s.student_id}</p>
                          </div>
                        </label>
                      </td>
                      <td className="text-center px-4 py-2.5">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                          presentMap[s.id] ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {presentMap[s.id] ? "Present" : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter className="pt-3">
              <Button variant="outline" onClick={() => setMarkOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitAttendance} disabled={submitting}>
                {submitting ? "Saving..." : "Save Attendance"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto ${present ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                                {present ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </div>
                            </td>
                          );
                        })}
                        <td className="text-center px-5 py-3">
                          <span className={`font-heading font-bold text-sm ${pct >= 90 ? "text-success" : pct >= 75 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
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
            <p className="text-muted-foreground">No attendance records yet. Click "Mark Attendance" to get started.</p>
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
