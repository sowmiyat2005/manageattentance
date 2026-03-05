import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { BookOpen, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Courses = () => {
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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage course offerings and assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c: any, i: number) => {
            const enrolled = enrollments.filter((e: any) => e.course_id === c.id).length;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="elevated-card rounded-xl p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <BookOpen className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{c.code}</span>
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1">{c.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{c.departments?.name || "—"} · {c.credits} Credits</p>
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
