import { useParams } from "@tanstack/react-router";
import { Loader2, UserRound, HeartPulse, AlertCircle } from "lucide-react";
import { usePatientByQrToken } from "../hooks/useQueries";
import { PatientStatus } from "../backend.d";

function PatientStatusBadge({ status }: { status: PatientStatus }) {
  if (status === PatientStatus.admitted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Admitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600">
      <span className="h-2 w-2 rounded-full bg-gray-400" />
      Discharged
    </span>
  );
}

function dayLabel(day: string): string {
  const map: Record<string, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  return map[day] ?? day;
}

export function PublicPatientView() {
  const { qrToken } = useParams({ strict: false }) as { qrToken: string };
  const { data: patient, isLoading, isError } = usePatientByQrToken(qrToken ?? null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal public header */}
      <header className="border-b border-border bg-his-navy px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <img
              src="/assets/generated/hospital-logo-transparent.dim_120x120.png"
              alt="MediCare Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <div>
            <span className="font-display text-base font-bold text-white">MediCare HIS</span>
            <span className="ml-2 text-xs text-white/50">Patient Information</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1">
            <HeartPulse className="h-3.5 w-3.5 text-white/70" />
            <span className="text-xs font-medium text-white/70">Read-Only Access</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-his-sky" />
              <p className="text-sm text-muted-foreground">Loading patient record...</p>
            </div>
          ) : isError || !patient ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Patient Record Not Found
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Invalid QR code or patient record does not exist.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Please contact hospital administration if you believe this is an error.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 page-enter">
              {/* Patient card header */}
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                  <UserRound className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {patient.name}
                  </h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">Patient Record</p>
                  <div className="mt-3">
                    <PatientStatusBadge status={patient.status} />
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ward
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">{patient.ward}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Admit Date
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">{patient.admitDate}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Admit Time
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">{patient.admitTime}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-border bg-card p-4 shadow-card sm:col-span-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Day of Week
                  </p>
                  <p className="mt-1.5 font-semibold text-foreground">
                    {dayLabel(patient.admitDay)}
                  </p>
                </div>
              </div>

              {/* Read-only notice */}
              <div className="flex items-start gap-3 rounded-xl border border-his-sky/20 bg-his-sky/5 px-4 py-3">
                <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-his-sky" />
                <p className="text-xs text-muted-foreground">
                  This record is <span className="font-semibold">read-only</span>. For full access,
                  modifications, or queries, please contact hospital administration directly.
                </p>
              </div>
            </div>
          )}
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
    </div>
  );
}
