import { type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "./NavBar";
import { AIAssistantPanel } from "./AIAssistantPanel";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  backPath?: string;
  navMode?: "admin" | "staff";
}

export function PageLayout({
  children,
  title,
  subtitle,
  action,
  showBack = true,
  backPath,
  navMode = "admin",
}: PageLayoutProps) {
  const navigate = useNavigate();
  const defaultBackPath = navMode === "staff" ? "/staff-dashboard" : "/dashboard";
  const resolvedBackPath = backPath ?? defaultBackPath;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar mode={navMode} />
      <main className="flex-1 page-enter">
        {/* Page header */}
        <div className="border-b border-border bg-card px-4 py-4 md:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {showBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void navigate({ to: resolvedBackPath as "/" })}
                  className="h-8 w-8 shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="font-display text-xl font-bold text-foreground md:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-red-500">♥</span>{" "}
        using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-2 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>

      {/* AI Assistant floating panel */}
      <AIAssistantPanel />
    </div>
  );
}
