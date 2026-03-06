import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Download, FileText, Users, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const { data: students = [] } = useQuery({
    queryKey: ["report-students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*, departments(name)").order("student_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["report-attendance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("student_id, present, date").order("date");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["report-departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["report-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*, departments(name)").order("code");
      if (error) throw error;
      return data;
    },
  });

  const filteredStudents = useMemo(() => {
    if (selectedDept === "all") return students;
    return students.filter((s: any) => s.department_id === selectedDept);
  }, [students, selectedDept]);

  const studentAttendanceMap = useMemo(() => {
    const map = new Map<string, { total: number; present: number }>();
    attendance.forEach((a: any) => {
      if (!map.has(a.student_id)) map.set(a.student_id, { total: 0, present: 0 });
      const rec = map.get(a.student_id)!;
      rec.total++;
      if (a.present) rec.present++;
    });
    return map;
  }, [attendance]);

  const overallStats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const activeStudents = filteredStudents.filter((s: any) => s.status === "Active").length;
    const avgGpa = totalStudents > 0
      ? (filteredStudents.reduce((sum: number, s: any) => sum + (s.gpa || 0), 0) / totalStudents).toFixed(2)
      : "0.00";
    let totalPresent = 0, totalRecords = 0;
    filteredStudents.forEach((s: any) => {
      const rec = studentAttendanceMap.get(s.id);
      if (rec) { totalPresent += rec.present; totalRecords += rec.total; }
    });
    const avgAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
    return { totalStudents, activeStudents, avgGpa, avgAttendance };
  }, [filteredStudents, studentAttendanceMap]);

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadStudentReport = () => {
    const headers = ["Student ID", "Name", "Department", "Year", "GPA", "Status", "Attendance %"];
    const rows = filteredStudents.map((s: any) => {
      const rec = studentAttendanceMap.get(s.id);
      const pct = rec && rec.total > 0 ? Math.round((rec.present / rec.total) * 100) : 0;
      return [s.student_id, s.full_name, s.departments?.name || "—", s.year, String(s.gpa || 0), s.status, `${pct}%`];
    });
    downloadCSV("student_report.csv", headers, rows);
  };

  const handleDownloadAttendanceReport = () => {
    const headers = ["Student ID", "Name", "Total Classes", "Present", "Absent", "Attendance %"];
    const rows = filteredStudents.map((s: any) => {
      const rec = studentAttendanceMap.get(s.id);
      const total = rec?.total || 0;
      const present = rec?.present || 0;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      return [s.student_id, s.full_name, String(total), String(present), String(total - present), `${pct}%`];
    });
    downloadCSV("attendance_report.csv", headers, rows);
  };

  const handleDownloadCourseReport = () => {
    const headers = ["Course Code", "Name", "Department", "Credits", "Faculty", "Max Students"];
    const rows = courses.map((c: any) => [c.code, c.name, c.departments?.name || "—", String(c.credits), c.faculty_name || "TBA", String(c.max_students || "∞")]);
    downloadCSV("course_report.csv", headers, rows);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Generate and download academic reports</p>
          </div>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: overallStats.totalStudents, icon: Users },
            { label: "Active Students", value: overallStats.activeStudents, icon: Users },
            { label: "Average GPA", value: overallStats.avgGpa, icon: BarChart3 },
            { label: "Avg Attendance", value: `${overallStats.avgAttendance}%`, icon: BarChart3 },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="elevated-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-heading text-xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Student Report</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
            <TabsTrigger value="courses">Course Report</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Student Academic Report</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadStudentReport}>
                  <Download className="w-4 h-4 mr-1" /> Download CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">ID</th>
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Dept</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Year</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">GPA</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Attendance</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s: any) => {
                      const rec = studentAttendanceMap.get(s.id);
                      const pct = rec && rec.total > 0 ? Math.round((rec.present / rec.total) * 100) : 0;
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0">
                          <td className="px-5 py-2.5 font-mono text-xs">{s.student_id}</td>
                          <td className="px-5 py-2.5 font-medium">{s.full_name}</td>
                          <td className="px-5 py-2.5 text-muted-foreground">{s.departments?.name || "—"}</td>
                          <td className="text-center px-5 py-2.5">{s.year}</td>
                          <td className="text-center px-5 py-2.5">
                            <span className={`font-bold ${(s.gpa || 0) >= 3.5 ? "text-success" : (s.gpa || 0) >= 2.5 ? "text-warning" : "text-destructive"}`}>
                              {s.gpa?.toFixed(2) || "0.00"}
                            </span>
                          </td>
                          <td className="text-center px-5 py-2.5">
                            <span className={`font-bold ${pct >= 90 ? "text-success" : pct >= 75 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                          </td>
                          <td className="text-center px-5 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="attendance">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Attendance Summary Report</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadAttendanceReport}>
                  <Download className="w-4 h-4 mr-1" /> Download CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">ID</th>
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Name</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Total</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Present</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Absent</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s: any) => {
                      const rec = studentAttendanceMap.get(s.id);
                      const total = rec?.total || 0;
                      const present = rec?.present || 0;
                      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                      return (
                        <tr key={s.id} className="border-b border-border last:border-0">
                          <td className="px-5 py-2.5 font-mono text-xs">{s.student_id}</td>
                          <td className="px-5 py-2.5 font-medium">{s.full_name}</td>
                          <td className="text-center px-5 py-2.5">{total}</td>
                          <td className="text-center px-5 py-2.5 text-success font-medium">{present}</td>
                          <td className="text-center px-5 py-2.5 text-destructive font-medium">{total - present}</td>
                          <td className="text-center px-5 py-2.5">
                            <span className={`font-bold ${pct >= 90 ? "text-success" : pct >= 75 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="courses">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Course Report</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadCourseReport}>
                  <Download className="w-4 h-4 mr-1" /> Download CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Code</th>
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Department</th>
                      <th className="text-center px-5 py-2.5 font-medium text-muted-foreground">Credits</th>
                      <th className="text-left px-5 py-2.5 font-medium text-muted-foreground">Faculty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c: any) => (
                      <tr key={c.id} className="border-b border-border last:border-0">
                        <td className="px-5 py-2.5 font-mono text-xs">{c.code}</td>
                        <td className="px-5 py-2.5 font-medium">{c.name}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{c.departments?.name || "—"}</td>
                        <td className="text-center px-5 py-2.5">{c.credits}</td>
                        <td className="px-5 py-2.5">{c.faculty_name || "TBA"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
