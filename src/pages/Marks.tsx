import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Marks = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", course_id: "", title: "", marks_obtained: "", max_marks: "100", exam_date: new Date().toISOString().split("T")[0] });
  const queryClient = useQueryClient();

  const { data: marks = [] } = useQuery({
    queryKey: ["marks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marks")
        .select("*, students(full_name, student_id), courses(name, code)")
        .order("exam_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("id, full_name, student_id").order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, name, code");
      if (error) throw error;
      return data;
    },
  });

  const filtered = marks.filter((m: any) =>
    (m.students?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.courses?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    const { error } = await supabase.from("marks").insert({
      student_id: form.student_id,
      course_id: form.course_id,
      title: form.title,
      marks_obtained: parseFloat(form.marks_obtained),
      max_marks: parseFloat(form.max_marks),
      exam_date: form.exam_date,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Marks added");
    setOpen(false);
    setForm({ student_id: "", course_id: "", title: "", marks_obtained: "", max_marks: "100", exam_date: new Date().toISOString().split("T")[0] });
    queryClient.invalidateQueries({ queryKey: ["marks"] });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Marks</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter and view student marks</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Marks</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Add Marks</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.student_id})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Exam / Test Title</Label>
                  <Input placeholder="Midterm Exam" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input type="number" min="0" value={form.marks_obtained} onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max</Label>
                    <Input type="number" min="1" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full">Save Marks</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search marks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Course</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Exam</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">%</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No marks recorded yet</td></tr>
                )}
                {filtered.map((m: any, i: number) => {
                  const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100).toFixed(1) : "0";
                  return (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium">{m.students?.full_name}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{m.courses?.name}</td>
                      <td className="px-5 py-3.5">{m.title}</td>
                      <td className="px-5 py-3.5 font-medium">{m.marks_obtained}/{m.max_marks}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          Number(pct) >= 80 ? "bg-success/10 text-success"
                            : Number(pct) >= 50 ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}>{pct}%</span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{m.exam_date}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Marks;
