import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, FileUp, Pencil, Trash2, Eye } from "lucide-react";
import { StudentDocuments } from "@/components/StudentDocuments";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const emptyStudent = { full_name: "", email: "", student_id: "", department_id: "", year: "1st", gpa: "" };

const Students = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newStudent, setNewStudent] = useState(emptyStudent);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [docStudent, setDocStudent] = useState<any>(null);
  const [docOpen, setDocOpen] = useState(false);

  const { data: students = [], refetch } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, departments(name)")
        .order("student_id");
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

  const filtered = students.filter(
    (s: any) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      (s.departments?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = async () => {
    const { error } = await supabase.from("students").insert({
      full_name: newStudent.full_name,
      email: newStudent.email,
      student_id: newStudent.student_id,
      department_id: newStudent.department_id || null,
      year: newStudent.year,
      gpa: newStudent.gpa ? parseFloat(newStudent.gpa) : 0,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Student added successfully");
    setAddOpen(false);
    setNewStudent(emptyStudent);
    refetch();
  };

  const handleEditStudent = async () => {
    if (!editStudent) return;
    const { error } = await supabase.from("students").update({
      full_name: editStudent.full_name,
      email: editStudent.email,
      student_id: editStudent.student_id,
      department_id: editStudent.department_id || null,
      year: editStudent.year,
      gpa: editStudent.gpa ? parseFloat(editStudent.gpa) : 0,
      status: editStudent.status,
    }).eq("id", editStudent.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Student updated successfully");
    setEditOpen(false);
    setEditStudent(null);
    refetch();
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("students").delete().eq("id", deleteTarget.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Student deleted successfully");
    setDeleteOpen(false);
    setDeleteTarget(null);
    refetch();
  };

  const StudentForm = ({ data, onChange, onSubmit, submitLabel }: any) => (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Student ID</Label>
          <Input placeholder="STU-009" value={data.student_id} onChange={(e) => onChange({ ...data, student_id: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input placeholder="Full name" value={data.full_name} onChange={(e) => onChange({ ...data, full_name: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="student@univ.edu" value={data.email} onChange={(e) => onChange({ ...data, email: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={data.department_id || ""} onValueChange={(v) => onChange({ ...data, department_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {departments.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Select value={data.year} onValueChange={(v) => onChange({ ...data, year: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["1st", "2nd", "3rd", "4th"].map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>GPA</Label>
          <Input type="number" step="0.01" min="0" max="4" placeholder="3.50" value={data.gpa} onChange={(e) => onChange({ ...data, gpa: e.target.value })} />
        </div>
        {data.status !== undefined && (
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={data.status} onValueChange={(v) => onChange({ ...data, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Active", "On Leave", "Graduated", "Suspended"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Button onClick={onSubmit} className="w-full">{submitLabel}</Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Students</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all student records</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Add New Student</DialogTitle></DialogHeader>
              <StudentForm data={newStudent} onChange={setNewStudent} onSubmit={handleAddStudent} submitLabel="Add Student" />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="elevated-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Year</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">GPA</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any, i: number) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{s.student_id}</td>
                    <td className="px-5 py-3.5 font-medium">{s.full_name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.departments?.name || "—"}</td>
                    <td className="px-5 py-3.5">{s.year}</td>
                    <td className="px-5 py-3.5 font-medium">{s.gpa}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "Active" ? "bg-success/10 text-success"
                          : s.status === "On Leave" ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditStudent({ ...s, gpa: String(s.gpa || 0) }); setEditOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleteTarget(s); setDeleteOpen(true); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDocStudent(s); setDocOpen(true); }}>
                          <FileUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {students.length} students
          </div>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-heading">Edit Student</DialogTitle></DialogHeader>
          {editStudent && <StudentForm data={editStudent} onChange={setEditStudent} onSubmit={handleEditStudent} submitLabel="Save Changes" />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StudentDocuments student={docStudent} open={docOpen} onOpenChange={setDocOpen} />
    </DashboardLayout>
  );
};

export default Students;
