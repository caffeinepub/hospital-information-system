import { Eye, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "../components/PageLayout";
import { useVisitorLog } from "../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  if (ms === 0) return "—";
  return new Date(ms).toLocaleString();
}

function truncateToken(token: string): string {
  if (token.length <= 16) return token;
  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

export function VisitorLogPage() {
  const { data: logs = [], isLoading, refetch, isFetching } = useVisitorLog();

  // Sort newest first
  const sorted = [...logs].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  return (
    <PageLayout
      title="Visitor Access Log"
      subtitle="Monitor who accessed patient records via QR scan"
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
      {/* Info banner */}
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Surveillance Mode</p>
          <p className="text-xs text-amber-700">
            This log records every QR code scan by department staff or guests. Auto-refreshes every
            30 seconds.
          </p>
        </div>
      </div>

      {/* Scan count */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-card">
        <Eye className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-foreground">
          Total Scans:{" "}
          <span className="font-bold text-amber-600">{logs.length}</span>
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Eye className="h-6 w-6 text-amber-400" />
          </div>
          <p className="font-medium text-foreground">No QR scans recorded yet.</p>
          <p className="text-sm text-muted-foreground">
            Scans will appear here when patient QR codes are accessed.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table className="clinical-table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead className="hidden sm:table-cell">QR Token</TableHead>
                <TableHead>Accessed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((log, idx) => (
                <TableRow key={String(log.logId)}>
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{log.patientName}</TableCell>
                  <TableCell className="hidden text-xs font-mono text-muted-foreground sm:table-cell">
                    {truncateToken(log.qrToken)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageLayout>
  );
}
