import { useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
  LogOut,
  HeartPulse,
  LayoutDashboard,
  UserRound,
  Stethoscope,
  ClipboardList,
  Pill,
  Building2,
  Eye,
  Menu,
  X,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", path: "/patients", icon: UserRound },
  { label: "Doctors", path: "/doctors", icon: Stethoscope },
  { label: "Treatments", path: "/treatments", icon: ClipboardList },
  { label: "Medicine", path: "/medicine", icon: Pill },
  { label: "Facilities", path: "/facilities", icon: Building2 },
  { label: "Visitor Log", path: "/visitor-log", icon: Eye, highlight: true },
];

const STAFF_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/staff-dashboard", icon: LayoutDashboard },
  { label: "Patients", path: "/staff/patients", icon: UserRound },
  { label: "Doctors", path: "/staff/doctors", icon: Stethoscope },
  { label: "Treatments", path: "/staff/treatments", icon: ClipboardList },
  { label: "Medicine", path: "/staff/medicine", icon: Pill },
  { label: "Facilities", path: "/staff/facilities", icon: Building2 },
];

interface NavBarProps {
  mode?: "admin" | "staff";
}

export function NavBar({ mode = "admin" }: NavBarProps) {
  const { clear, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = mode === "staff" ? STAFF_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const homePath = mode === "staff" ? "/staff-dashboard" : "/dashboard";

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : "Staff";

  function handleLogout() {
    clear();
    void navigate({ to: "/" });
  }

  function handleNav(path: string) {
    void navigate({ to: path as "/" });
    setSidebarOpen(false);
  }

  const currentPath = location?.pathname ?? "";

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-his-navy px-4 shadow-sm md:px-6">
        {/* Left: Hamburger + Logo + Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: homePath as "/" })}
            className="flex items-center gap-2.5 focus-visible:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <img
                src="/assets/generated/hospital-logo-transparent.dim_120x120.png"
                alt="MediCare Logo"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              MediCare <span className="font-light opacity-70">HIS</span>
            </span>
          </button>
        </div>

        {/* Center: Welcome text */}
        <div className="hidden items-center gap-2 md:flex">
          <HeartPulse className="h-4 w-4 text-white/50" />
          <span className="text-sm text-white/70">
            Welcome,{" "}
            <span className="font-medium text-white">{shortPrincipal}</span>
          </span>
        </div>

        {/* Right: Mode badge + Logout */}
        <div className="flex items-center gap-2">
          {mode === "admin" ? (
            <div className="hidden items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/20 px-3 py-1 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-300">Admin Mode</span>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/20 px-3 py-1 sm:flex">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-300">Staff Mode</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : item.highlight
                      ? "text-orange-300 hover:bg-sidebar-accent hover:text-orange-200"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? "text-sidebar-primary"
                      : item.highlight
                        ? "text-orange-400"
                        : ""
                  }`}
                />
                {item.label}
                {item.highlight && (
                  <span className="ml-auto rounded-full bg-orange-500/20 px-1.5 py-0.5 text-xs text-orange-300">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
