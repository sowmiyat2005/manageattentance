import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { BookOpen, Users, Plus, ClipboardList, Calendar as CalendarIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const Courses = () => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDueDate, setTaskDueDate] = useState<Date>(new Date());
  const [taskMaxMarks, setTaskMaxMarks] = useState("100");
  const [submitting, setSubmitting] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ["courses-with-dept"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, departments(name)")
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enrollments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("due_date");
      if (error) throw error;
      return data;
    },
  });

  const handleAddTask = async () => {
    if (!selectedCourse || !taskTitle) {
      toast.error("Please select a course and enter a title");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("assignments").insert({
      course_id: selectedCourse,
      title: taskTitle,
      description: taskDesc || null,
      due_date: format(taskDueDate, "yyyy-MM-dd"),
      max_marks: parseInt(taskMaxMarks) || 100,
    });
    if (error) {
      toast.error("Failed to add task: " + error.message);
    } else {
      toast.success("Task added successfully");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      setAddOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setSelectedCourse("");
      setTaskMaxMarks("100");
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Courses</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage course offerings and assignments</p>
          </div>
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </Button>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Course Task</DialogTitle>
              <DialogDescription>Create a new assignment or task for a course</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input placeholder="e.g. Lab Assignment 1" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Task description..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(taskDueDate, "PP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={taskDueDate} onSelect={(d) => d && setTaskDueDate(d)} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Max Marks</Label>
                  <Input type="number" value={taskMaxMarks} onChange={(e) => setTaskMaxMarks(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTask} disabled={submitting}>
                {submitting ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c: any, i: number) => {
            const enrolled = enrollments.filter((e: any) => e.course_id === c.id).length;
            const courseTasks = assignments.filter((a: any) => a.course_id === c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="elevated-card rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <BookOpen className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{c.code}</span>
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{c.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{c.departments?.name || "—"} · {c.credits} Credits</p>

                {/* Tasks section */}
                {courseTasks.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <ClipboardList className="w-3 h-3" /> Tasks ({courseTasks.length})
                    </p>
                    {courseTasks.slice(0, 3).map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5">
                        <span className="truncate font-medium">{t.title}</span>
                        <span className="text-muted-foreground whitespace-nowrap ml-2">
                          Due {new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                    {courseTasks.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-2">+{courseTasks.length - 3} more</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                  <span>{c.faculty_name || "TBA"}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {enrolled}/{c.max_students || "∞"}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
