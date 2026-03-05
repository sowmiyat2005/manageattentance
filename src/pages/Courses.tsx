import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { BookOpen, Users } from "lucide-react";

const courses = [
  { code: "CS101", name: "Introduction to Programming", dept: "Computer Science", credits: 4, students: 120, faculty: "Dr. Anil Mehta" },
  { code: "CS201", name: "Data Structures & Algorithms", dept: "Computer Science", credits: 4, students: 95, faculty: "Dr. Sunita Roy" },
  { code: "ENG101", name: "Engineering Mechanics", dept: "Engineering", credits: 3, students: 80, faculty: "Prof. Ravi Shankar" },
  { code: "BUS301", name: "Financial Accounting", dept: "Business", credits: 3, students: 65, faculty: "Dr. Neha Kapoor" },
  { code: "SCI201", name: "Organic Chemistry", dept: "Science", credits: 4, students: 70, faculty: "Dr. Prakash Jain" },
  { code: "ART101", name: "History of Modern Art", dept: "Arts", credits: 2, students: 45, faculty: "Prof. Lata Desai" },
];

const Courses = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage course offerings and assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="elevated-card rounded-xl p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <BookOpen className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {c.code}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-sm mb-1">{c.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{c.dept} · {c.credits} Credits</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                <span>{c.faculty}</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {c.students}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
