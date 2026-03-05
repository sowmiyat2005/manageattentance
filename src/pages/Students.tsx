import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";

const students = [
  { id: "STU-001", name: "Aarav Sharma", email: "aarav@univ.edu", dept: "Computer Science", year: "3rd", gpa: "3.8", status: "Active" },
  { id: "STU-002", name: "Priya Patel", email: "priya@univ.edu", dept: "Engineering", year: "2nd", gpa: "3.6", status: "Active" },
  { id: "STU-003", name: "Rahul Kumar", email: "rahul@univ.edu", dept: "Business", year: "4th", gpa: "3.9", status: "Active" },
  { id: "STU-004", name: "Ananya Singh", email: "ananya@univ.edu", dept: "Science", year: "1st", gpa: "3.5", status: "On Leave" },
  { id: "STU-005", name: "Vikram Reddy", email: "vikram@univ.edu", dept: "Arts", year: "3rd", gpa: "3.7", status: "Active" },
  { id: "STU-006", name: "Sneha Gupta", email: "sneha@univ.edu", dept: "Computer Science", year: "2nd", gpa: "3.4", status: "Active" },
  { id: "STU-007", name: "Karthik Nair", email: "karthik@univ.edu", dept: "Engineering", year: "4th", gpa: "3.2", status: "Graduated" },
  { id: "STU-008", name: "Meera Joshi", email: "meera@univ.edu", dept: "Science", year: "1st", gpa: "3.8", status: "Active" },
];

const Students = () => {
  const [search, setSearch] = useState("");
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Students</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all student records</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-10">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-10">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="elevated-card rounded-xl overflow-hidden"
        >
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{s.id}</td>
                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.dept}</td>
                    <td className="px-5 py-3.5">{s.year}</td>
                    <td className="px-5 py-3.5 font-medium">{s.gpa}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "Active"
                            ? "bg-success/10 text-success"
                            : s.status === "On Leave"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
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
    </DashboardLayout>
  );
};

export default Students;
