import { DashboardLayout } from "@/components/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, User, BookOpen, ClipboardCheck, Award, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, departments(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["student-attendance", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, courses(name, code)")
        .eq("student_id", id!)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: marks = [] } = useQuery({
    queryKey: ["student-marks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marks")
        .select("*, courses(name, code)")
        .eq("student_id", id!)
        .order("exam_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["student-enrollments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(id, name, code)")
        .eq("student_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, courses(name, code)")
        .order("due_date");
      if (error) throw error;
      return data;
    },
  });

  // Compute attendance stats
  const totalClasses = attendance.length;
  const presentCount = attendance.filter((a: any) => a.present).length;
  const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Compute marks stats
  const totalMarksObtained = marks.reduce((s: number, m: any) => s + Number(m.marks_obtained), 0);
  const totalMaxMarks = marks.reduce((s: number, m: any) => s + Number(m.max_marks), 0);
  const overallPct = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

  // Filter assignments for enrolled courses
  const enrolledCourseIds = enrollments.map((e: any) => e.course_id);
  const studentTasks = assignments.filter((a: any) => enrolledCourseIds.includes(a.course_id));

  if (!student) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading student profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
        </Button>

        {/* Student Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="elevated-card rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-xl font-bold">{student.full_name}</h1>
            <p className="text-sm text-muted-foreground">{student.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{student.student_id}</Badge>
              <Badge variant="outline">{(student as any).departments?.name || "No Dept"}</Badge>
              <Badge variant="outline">{student.year} Year</Badge>
              <Badge className={student.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200"}>
                {student.status}
              </Badge>
            </div>
          </div>
          {student.gpa && (
            <div className="text-center px-4">
              <p className="text-2xl font-bold text-primary">{Number(student.gpa).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">GPA</p>
            </div>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ClipboardCheck, label: "Attendance", value: `${attendancePct}%`, color: attendancePct >= 75 ? "text-emerald-600" : "text-red-500" },
            { icon: Award, label: "Overall Marks", value: `${overallPct}%`, color: overallPct >= 50 ? "text-emerald-600" : "text-red-500" },
            { icon: BookOpen, label: "Courses", value: enrollments.length.toString(), color: "text-primary" },
            { icon: ClipboardList, label: "Tasks", value: studentTasks.length.toString(), color: "text-primary" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" /> Attendance History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records found.</p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Progress value={attendancePct} className="h-2 flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{attendancePct}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {presentCount} present out of {totalClasses} classes
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {attendance.slice(0, 20).map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5">
                        <span>{new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${a.present ? "text-emerald-600" : "text-red-500"}`}>
                            {a.present ? "Present" : "Absent"}
                          </span>
                          {a.courses && <span className="text-muted-foreground ml-1">({a.courses.code})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Marks Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" /> Marks Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No marks recorded yet.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {marks.map((m: any) => {
                    const pct = Math.round((Number(m.marks_obtained) / Number(m.max_marks)) * 100);
                    return (
                      <div key={m.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{m.title}</span>
                          <Badge variant="outline" className="text-xs">{m.courses?.code}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className={`text-xs font-bold ${pct >= 50 ? "text-emerald-600" : "text-red-500"}`}>
                            {m.marks_obtained}/{m.max_marks}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Assigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {studentTasks.map((t: any) => {
                    const isPast = new Date(t.due_date) < new Date();
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.courses?.code} · Due {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                        <Badge variant={t.status === "completed" ? "default" : isPast ? "destructive" : "secondary"} className="text-xs ml-2">
                          {t.status === "completed" ? "Done" : isPast ? "Overdue" : "Pending"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
