import Link from "next/link";
import { GraduationCap, Shield, BookOpen, Users } from "lucide-react";

const ROLES = [
  {
    label: "Administrator",
    description: "Manage students, faculty, courses, and system settings",
    href: "/admin/login",
    icon: Shield,
    gradient: "from-slate-700 to-slate-900",
    iconBg: "bg-slate-600",
    border: "border-slate-200 hover:border-slate-400",
    badge: "bg-slate-100 text-slate-700",
  },
  {
    label: "Faculty",
    description: "Post activities, grade submissions, and track attendance",
    href: "/faculty/login",
    icon: BookOpen,
    gradient: "from-emerald-600 to-teal-800",
    iconBg: "bg-emerald-500",
    border: "border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Student",
    description: "View subjects, submit activities, and check grades",
    href: "/student/login",
    icon: Users,
    gradient: "from-blue-600 to-blue-900",
    iconBg: "bg-blue-500",
    border: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">CCS LMS</h1>
          <p className="text-slate-500 text-sm">College of Computer Studies — Learning Management System</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {ROLES.map(({ label, description, href, icon: Icon, gradient, iconBg, border, badge }) => (
            <Link
              key={label}
              href={href}
              className={`group relative rounded-2xl border-2 ${border} bg-white shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden`}
            >
              <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center gap-3`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} shadow`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badge} mb-1`}>
                    {label}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-1">{label} Portal</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                <div className="mt-4 text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  Sign in as {label} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400">
          © 2024 CCS LMS — College of Computer Studies
        </p>
      </div>
    </div>
  );
}
