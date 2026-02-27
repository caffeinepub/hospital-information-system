import { useNavigate } from "@tanstack/react-router";
import {
  Stethoscope,
  UserRound,
  ClipboardList,
  Pill,
  Building2,
  Activity,
  Eye,
  Users,
} from "lucide-react";
import { NavBar } from "../components/NavBar";
import { AIAssistantPanel } from "../components/AIAssistantPanel";
import { useDashboardStats } from "../hooks/useQueries";

type StaffRoute =
  | "/staff-dashboard"
  | "/staff/patients"
  | "/staff/doctors"
  | "/staff/treatments"
  | "/staff/medicine"
  | "/staff/facilities";

interface DashCard {
  label: string;
  description: string;
  icon: React.ElementType;
  route: StaffRoute;
  colorClass: string;
  iconBg: string;
}

const STAFF_DASH_CARDS: DashCard[] = [
  {
    label: "Patients Record",
    description: "View patient records",
    icon: UserRound,
    route: "/staff/patients",
    colorClass: "border-emerald-200 hover:border-emerald-300",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Doctors Record",
    description: "Browse physician profiles",
    icon: Stethoscope,
    route: "/staff/doctors",
    colorClass: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    label: "Treatment",
    description: "Treatment plans & history",
    icon: ClipboardList,
    route: "/staff/treatments",
    colorClass: "border-violet-200 hover:border-violet-300",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    label: "Medicine",
    description: "Medication inventory",
    icon: Pill,
    route: "/staff/medicine",
    colorClass: "border-amber-200 hover:border-amber-300",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    label: "Current Facilities",
    description: "Rooms & equipment status",
    icon: Building2,
    route: "/staff/facilities",
    colorClass: "border-teal-200 hover:border-teal-300",
    iconBg: "bg-teal-50 text-teal-600",
  },
];

export function StaffDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const statItems = [
    {
      label: "Patients",
      value: stats?.totalPatients ?? 0n,
      icon: UserRound,
      color: "text-emerald-600",
    },
    {
      label: "Doctors",
      value: stats?.totalDoctors ?? 0n,
      icon: Stethoscope,
      color: "text-blue-600",
    },
    {
      label: "Treatments",
      value: stats?.totalTreatments ?? 0n,
      icon: Activity,
      color: "text-violet-600",
    },
    {
      label: "Medicines",
      value: stats?.totalMedicines ?? 0n,
      icon: Pill,
      color: "text-amber-600",
    },
    {
      label: "Facilities",
      value: stats?.totalFacilities ?? 0n,
      icon: Building2,
      color: "text-teal-600",
    },
    {
      label: "Total Scans",
      value: stats?.totalScans ?? 0n,
      icon: Eye,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar mode="staff" />

      <main className="flex-1 page-enter">
        {/* Hero section */}
        <div className="border-b border-border bg-gradient-to-r from-his-navy to-[oklch(0.32_0.1_245)] px-4 py-8 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white/70" />
              <span className="rounded-full border border-blue-400/30 bg-blue-400/20 px-3 py-0.5 text-xs font-semibold text-blue-300">
                Staff Mode
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
              Staff Dashboard
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Read-only access to patient records, staff, and facility information
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="stagger-child rounded-xl border border-border bg-card px-4 py-4 shadow-card"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted" />
                    ) : (
                      String(item.value)
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main navigation cards */}
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Access
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {STAFF_DASH_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    type="button"
                    key={card.route}
                    onClick={() => void navigate({ to: card.route })}
                    className={`dash-card stagger-child flex flex-col items-center gap-4 rounded-2xl border-2 bg-card p-6 text-center shadow-card transition-all ${card.colorClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  >
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.iconBg}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-display text-base font-semibold text-foreground">
                        {card.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff info banner */}
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <Users className="h-5 w-5 shrink-0 text-blue-500" />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Staff Mode:</span> You have read-only access to all
              records. Contact an administrator to make changes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with <span className="text-red-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-2 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>

      <AIAssistantPanel />
    </div>
  );
}
