import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Stethoscope,
  UserRound,
  ClipboardList,
  Pill,
  Building2,
  Eye,
  Activity,
  HardDrive,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "../components/NavBar";
import { AIAssistantPanel } from "../components/AIAssistantPanel";
import {
  useDashboardStats,
  useLastBackupTimestamp,
  useTriggerBackup,
} from "../hooks/useQueries";
import { toast } from "sonner";

type AppRoute =
  | "/"
  | "/dashboard"
  | "/patients"
  | "/doctors"
  | "/treatments"
  | "/medicine"
  | "/facilities"
  | "/visitor-log";

interface DashCard {
  label: string;
  description: string;
  icon: React.ElementType;
  route: AppRoute;
  colorClass: string;
  iconBg: string;
}

const DASH_CARDS: DashCard[] = [
  {
    label: "Patients Record",
    description: "View & manage patients",
    icon: UserRound,
    route: "/patients",
    colorClass: "border-emerald-200 hover:border-emerald-300",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Doctors Record",
    description: "Manage physician profiles",
    icon: Stethoscope,
    route: "/doctors",
    colorClass: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    label: "Treatment",
    description: "Treatment plans & history",
    icon: ClipboardList,
    route: "/treatments",
    colorClass: "border-violet-200 hover:border-violet-300",
    iconBg: "bg-violet-50 text-violet-600",
  },
  {
    label: "Medicine",
    description: "Medication inventory",
    icon: Pill,
    route: "/medicine",
    colorClass: "border-amber-200 hover:border-amber-300",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    label: "Current Facilities",
    description: "Rooms & equipment status",
    icon: Building2,
    route: "/facilities",
    colorClass: "border-teal-200 hover:border-teal-300",
    iconBg: "bg-teal-50 text-teal-600",
  },
  {
    label: "Visitor Log",
    description: "Monitor QR scan access",
    icon: Eye,
    route: "/visitor-log",
    colorClass: "border-orange-200 hover:border-orange-300",
    iconBg: "bg-orange-50 text-orange-600",
  },
];

function formatBackupTime(timestamp: bigint): string {
  if (timestamp === 0n) return "Never";
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleString();
}

function wasBackupMoreThan24hAgo(timestamp: bigint): boolean {
  if (timestamp === 0n) return true;
  const ms = Number(timestamp / 1_000_000n);
  return Date.now() - ms > 24 * 60 * 60 * 1000;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: lastBackup, isLoading: backupLoading } = useLastBackupTimestamp();
  const triggerBackup = useTriggerBackup();
  const triggerBackupMutate = triggerBackup.mutate;

  // Auto-backup if last backup was more than 24h ago
  useEffect(() => {
    if (lastBackup !== undefined && wasBackupMoreThan24hAgo(lastBackup)) {
      triggerBackupMutate(undefined, {
        onSuccess: () => toast.success("Auto-backup completed"),
        onError: () => {},
      });
    }
  }, [lastBackup, triggerBackupMutate]);

  function handleBackupNow() {
    triggerBackup.mutate(undefined, {
      onSuccess: () => toast.success("Backup completed successfully!"),
      onError: () => toast.error("Backup failed. Please try again."),
    });
  }

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
      <NavBar />

      <main className="flex-1 page-enter">
        {/* Hero section */}
        <div className="border-b border-border bg-gradient-to-r from-his-navy to-[oklch(0.32_0.1_245)] px-4 py-8 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white/70" />
              <span className="rounded-full border border-green-400/30 bg-green-400/20 px-3 py-0.5 text-xs font-semibold text-green-300">
                Admin Mode
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
              Hospital Dashboard
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Manage patients, staff, and facilities from one place
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
              {DASH_CARDS.map((card) => {
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

          {/* Backup section */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Auto Daily Backup</p>
                <p className="text-xs text-muted-foreground">
                  {backupLoading ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      Last Backup:{" "}
                      <span className="font-medium text-foreground">
                        {lastBackup !== undefined ? formatBackupTime(lastBackup) : "—"}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {triggerBackup.isPending && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Backing up...
                </span>
              )}
              {triggerBackup.isSuccess && !triggerBackup.isPending && (
                <span className="text-xs font-medium text-emerald-600">✓ Backup successful</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackupNow}
                disabled={triggerBackup.isPending}
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Backup Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
        © 2026. Built with <span className="text-red-500">♥</span> using{" "}
        <a
          href="https://caffeine.ai"
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
