import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "faculty" | "student">("admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const roles = [
    { key: "admin" as const, label: "Admin" },
    { key: "faculty" as const, label: "Faculty" },
    { key: "student" as const, label: "Student" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(175_50%_42%_/_0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(38_92%_55%_/_0.08),_transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-primary-foreground max-w-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-8">
            <GraduationCap className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="font-heading text-4xl font-bold mb-4 leading-tight">
            Cloud-Based Student Management
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Efficiently manage student records, attendance, and performance tracking through a secure cloud infrastructure. Access academic information anytime, anywhere.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { number: "2,400+", label: "Students" },
              { number: "98.5%", label: "Uptime" },
              { number: "150+", label: "Courses" },
            ].map((stat) => (
              <div key={stat.label} className="bg-primary-foreground/5 rounded-xl p-4 backdrop-blur-sm border border-primary-foreground/10">
                <p className="font-heading font-bold text-xl">{stat.number}</p>
                <p className="text-sm text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">EduCloud</span>
          </div>

          <h2 className="font-heading text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue</p>

          {/* Role selector */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  role === r.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                className="h-11"
                defaultValue="admin@university.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  defaultValue="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-input" />
                Remember me
              </label>
              <a href="#" className="text-secondary font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-11 font-medium">
              Sign In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
