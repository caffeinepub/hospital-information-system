import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Shield, Lock, AlertTriangle, LogOut, Users, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserRole, UserRole } from "../hooks/useQueries";

export function LoginPage() {
  const {
    login,
    clear,
    identity,
    isLoggingIn,
    isInitializing,
    isLoginError,
    loginError,
  } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userRole, isLoading: roleLoading } = useCallerUserRole();

  useEffect(() => {
    if (!identity) return;
    if (userRole === UserRole.admin) {
      void navigate({ to: "/dashboard" });
    } else if (userRole === UserRole.user) {
      void navigate({ to: "/staff-dashboard" });
    } else if (userRole === UserRole.guest) {
      void navigate({ to: "/patient-dashboard" });
    }
  }, [identity, userRole, navigate]);

  const isAuthenticated = !!identity;
  const isAccessDenied =
    isAuthenticated && !roleLoading && userRole === undefined;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-his-navy">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="page-enter relative z-10 w-full max-w-md px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">
          {/* Top bar (browser chrome effect) */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-6 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-2 font-mono text-xs text-white/30">medicare-his.icp</span>
          </div>

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-his-sky/20 blur-lg" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <img
                    src="/assets/generated/hospital-logo-transparent.dim_120x120.png"
                    alt="MediCare Logo"
                    className="h-14 w-14 object-contain drop-shadow-lg"
                  />
                </div>
              </div>
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                  MediCare HIS
                </h1>
                <p className="mt-0.5 text-sm font-medium text-white/60">
                  Hospital Information System — Secure Portal
                </p>
              </div>
            </div>

            {/* Access Denied State */}
            {isAccessDenied ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center">
                  <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-300" />
                  <p className="font-semibold text-red-200">Access Denied</p>
                  <p className="mt-1 text-xs text-red-300/80">
                    Your account has no assigned role. Contact your administrator to be assigned
                    Staff or Patient access.
                  </p>
                </div>
                <Button
                  onClick={() => clear()}
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                {/* Secure portal badge */}
                <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
                  <Shield className="h-4 w-4 text-his-sky" />
                  <span className="text-sm text-white/70">
                    Secure Staff Portal — ICP Authenticated
                  </span>
                </div>

                {/* Checking role state */}
                {isAuthenticated && roleLoading && (
                  <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-his-sky" />
                    <span className="text-sm text-white/70">Verifying access level...</span>
                  </div>
                )}

                {/* Login section */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-his-sky/20">
                        <Lock className="h-4 w-4 text-his-sky" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Internet Identity Login</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/50">
                          Authenticate securely using Internet Identity — no password required.
                          Your identity is cryptographically verified.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isLoginError && (
                    <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                      {loginError?.message ?? "Login failed. Please try again."}
                    </div>
                  )}

                  <Button
                    onClick={login}
                    disabled={isLoggingIn || isInitializing || (isAuthenticated && roleLoading)}
                    className="h-11 w-full bg-his-sky font-semibold text-white hover:bg-his-sky/90 disabled:opacity-60"
                  >
                    {isLoggingIn || isInitializing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isInitializing ? "Initializing..." : "Connecting..."}
                      </>
                    ) : (
                      "Login with Internet Identity"
                    )}
                  </Button>
                </div>

                <p className="mt-5 text-center text-xs text-white/30">
                  Only authorized hospital staff may access this system.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Preview Mode Role Selector */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-xl">
          <div className="px-6 py-5">
            {/* Divider label */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium tracking-widest text-white/30 uppercase">
                Preview Mode
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="mb-4 text-center text-xs text-white/40">
              Explore each role's dashboard without authentication
            </p>

            {/* Role cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Admin */}
              <button
                type="button"
                onClick={() => void navigate({ to: "/dashboard" })}
                className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center transition-all duration-200 hover:border-sky-400/40 hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/15 ring-1 ring-sky-400/25 transition-all duration-200 group-hover:bg-sky-400/25 group-hover:ring-sky-400/40">
                  <Shield className="h-4 w-4 text-sky-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80 group-hover:text-white">Admin</p>
                  <p className="mt-0.5 text-[10px] text-white/30">Full access</p>
                </div>
              </button>

              {/* Staff */}
              <button
                type="button"
                onClick={() => void navigate({ to: "/staff-dashboard" })}
                className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center transition-all duration-200 hover:border-blue-400/40 hover:bg-blue-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/15 ring-1 ring-blue-400/25 transition-all duration-200 group-hover:bg-blue-400/25 group-hover:ring-blue-400/40">
                  <Users className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80 group-hover:text-white">Staff</p>
                  <p className="mt-0.5 text-[10px] text-white/30">Read-only</p>
                </div>
              </button>

              {/* Patient */}
              <button
                type="button"
                onClick={() => void navigate({ to: "/patient-dashboard" })}
                className="group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center transition-all duration-200 hover:border-violet-400/40 hover:bg-violet-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/15 ring-1 ring-violet-400/25 transition-all duration-200 group-hover:bg-violet-400/25 group-hover:ring-violet-400/40">
                  <HeartPulse className="h-4 w-4 text-violet-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80 group-hover:text-white">Patient</p>
                  <p className="mt-0.5 text-[10px] text-white/30">My portal</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-white/20">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-white/40 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
