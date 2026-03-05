import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Students", path: "/students" },
  { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: ClipboardCheck, label: "Attendance", path: "/attendance" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen bg-sidebar flex flex-col border-r border-sidebar-border overflow-hidden flex-shrink-0"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="font-heading font-bold text-sidebar-foreground text-sm leading-tight">EduCloud</h1>
            <p className="text-[11px] text-sidebar-foreground/60">Management System</p>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform duration-200", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {!collapsed && profile && (
          <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">
            {profile.full_name}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
