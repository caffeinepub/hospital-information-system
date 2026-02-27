import { useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  HeartPulse,
  Stethoscope,
  Building2,
  UserCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerUserProfile,
  useDashboardStats,
  useAllDoctors,
  useAllFacilities,
  FacilityStatus,
} from "../hooks/useQueries";

function FacilityStatusBadge({ status }: { status: FacilityStatus }) {
  const config = {
    [FacilityStatus.available]: {
      label: "Available",
      className: "bg-green-50 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    [FacilityStatus.occupied]: {
      label: "Occupied",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    [FacilityStatus.maintenance]: {
      label: "Maintenance",
      className: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
  };
  const c = config[status] ?? config[FacilityStatus.available];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${c.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: doctors = [], isLoading: doctorsLoading } = useAllDoctors();
  const { data: facilities = [], isLoading: facilitiesLoading } = useAllFacilities();

  const patientName = profileLoading ? null : (profile?.name ?? "Patient");

  function handleLogout() {
    clear();
    void navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Simple top bar for Patient mode */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-his-navy px-4 shadow-sm md:px-6">
        <div className="flex items-center gap-2.5">
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
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-400/20 px-3 py-1 sm:flex">
            <UserCircle className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300">Patient Mode</span>
          </div>
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

      <main className="flex-1 page-enter">
        {/* Hero section */}
        <div className="border-b border-border bg-gradient-to-r from-his-navy to-[oklch(0.32_0.08_280)] px-4 py-8 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-white/70" />
              <span className="rounded-full border border-purple-400/30 bg-purple-400/20 px-3 py-0.5 text-xs font-semibold text-purple-300">
                Patient Mode
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
              Welcome to MediCare HIS
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Your hospital information portal
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-6">
          {/* Welcome card */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100">
                <HeartPulse className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Good day,</p>
                <h2 className="font-display text-xl font-bold text-purple-900">
                  {profileLoading ? (
                    <span className="inline-block h-5 w-32 animate-pulse rounded bg-purple-200" />
                  ) : (
                    patientName
                  )}
                </h2>
                <p className="mt-0.5 text-sm text-purple-700">
                  You have read-only access to hospital information below.
                </p>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Doctors</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {statsLoading ? (
                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted" />
                  ) : (
                    String(stats?.totalDoctors ?? 0n)
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <Building2 className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Facilities</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {statsLoading ? (
                    <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted" />
                  ) : (
                    String(stats?.totalFacilities ?? 0n)
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Doctors list */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <h2 className="font-display text-base font-semibold text-foreground">
                Our Doctors
              </h2>
            </div>
            {doctorsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-sm text-muted-foreground">No doctors registered yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <div
                    key={String(doctor.doctorId)}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                      <Stethoscope className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{doctor.name}</p>
                      <p className="truncate text-sm text-blue-600">{doctor.specialty}</p>
                      <p className="truncate text-xs text-muted-foreground">{doctor.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Facilities list */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              <h2 className="font-display text-base font-semibold text-foreground">
                Hospital Facilities
              </h2>
            </div>
            {facilitiesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : facilities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-sm text-muted-foreground">No facilities registered yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <div className="divide-y divide-border">
                  {facilities.map((facility) => (
                    <div
                      key={String(facility.facilityId)}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                          <Building2 className="h-4 w-4 text-teal-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {facility.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {facility.location}
                          </p>
                        </div>
                      </div>
                      <FacilityStatusBadge status={facility.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
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
    </div>
  );
}
