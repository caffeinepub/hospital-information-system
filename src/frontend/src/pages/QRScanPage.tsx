import { useState, useEffect } from "react";
import { QrCode, SwitchCamera, Play, Square, RefreshCw, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "../components/PageLayout";
import { useQRScanner } from "../qr-code/useQRScanner";
import { usePatientByQrToken } from "../hooks/useQueries";
import { PatientStatus } from "../backend.d";

function PatientCard({ patient }: { patient: { name: string; ward: string; admitDate: string; status: PatientStatus } }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
          <UserRound className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{patient.name}</p>
          <p className="text-sm text-muted-foreground">Patient Found</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Ward</p>
          <p className="mt-0.5 font-medium text-sm text-foreground">{patient.ward}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Admit Date</p>
          <p className="mt-0.5 font-medium text-sm text-foreground">{patient.admitDate}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-1">
            {patient.status === PatientStatus.admitted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Admitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Discharged
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function QRScanPage() {
  const [scannedToken, setScannedToken] = useState<string | null>(null);

  const scanner = useQRScanner({
    facingMode: "environment",
    scanInterval: 100,
    maxResults: 1,
  });

  const {
    data: patient,
    isLoading: patientLoading,
    error: patientError,
  } = usePatientByQrToken(scannedToken);

  // When a new QR result comes in, update the token
  useEffect(() => {
    if (scanner.qrResults.length > 0) {
      const latestToken = scanner.qrResults[0].data;
      setScannedToken(latestToken);
    }
  }, [scanner.qrResults]);

  function handleReset() {
    setScannedToken(null);
    scanner.clearResults();
  }

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

  return (
    <PageLayout
      title="QR Scanner"
      subtitle="Scan a patient QR code to view their record"
    >
      <div className="mx-auto max-w-lg space-y-4">
        {/* Scanner view */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {/* Camera viewport */}
          <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
            {scanner.isSupported === false ? (
              <div className="flex h-full items-center justify-center text-white/60">
                <p className="text-sm">Camera not supported in this browser</p>
              </div>
            ) : (
              <>
                <video
                  ref={scanner.videoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={scanner.canvasRef} className="hidden" />

                {/* Scanning overlay */}
                {scanner.isActive && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-48 w-48">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-white rounded-tl-sm" />
                      <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-white rounded-tr-sm" />
                      <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-white rounded-bl-sm" />
                      <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-white rounded-br-sm" />
                      {/* Scan line */}
                      <div
                        className="absolute left-2 right-2 h-0.5 bg-his-sky shadow-lg"
                        style={{ animation: "scanLine 2s ease-in-out infinite" }}
                      />
                    </div>
                  </div>
                )}

                {/* Loading overlay */}
                {scanner.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}

                {/* Idle overlay */}
                {!scanner.isActive && !scanner.isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
                    <QrCode className="h-12 w-12 text-white/40" />
                    <p className="text-sm text-white/60">
                      Press Start to begin scanning
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2 border-t border-border p-3">
            {scanner.error && (
              <p className="text-xs text-destructive">{scanner.error.message}</p>
            )}
            <div className="flex flex-1 gap-2">
              {!scanner.isActive ? (
                <Button
                  size="sm"
                  onClick={scanner.startScanning}
                  disabled={!scanner.canStartScanning}
                  className="gap-2"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Scanning
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={scanner.stopScanning}
                  disabled={scanner.isLoading}
                  className="gap-2"
                >
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </Button>
              )}

              {scanner.error && (
                <Button size="sm" variant="ghost" onClick={scanner.retry} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              )}
            </div>

            {isMobile && scanner.isActive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={scanner.switchCamera}
                disabled={scanner.isLoading}
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Status */}
        {scanner.isScanning && !scannedToken && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-his-sky" />
            <span className="text-muted-foreground">Scanning for QR codes...</span>
          </div>
        )}

        {/* Scanned token display */}
        {scannedToken && !patient && !patientLoading && (
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Scanned Token</p>
            <p className="mt-0.5 font-mono text-sm text-foreground break-all">{scannedToken}</p>
          </div>
        )}

        {/* Patient loading */}
        {patientLoading && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Looking up patient...</p>
          </div>
        )}

        {/* Patient error */}
        {patientError && scannedToken && !patientLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="font-medium text-red-700">Patient Not Found</p>
            <p className="mt-1 text-sm text-red-600">
              The scanned QR code doesn't match any patient record.
            </p>
          </div>
        )}

        {/* Patient result */}
        {patient && !patientLoading && (
          <PatientCard patient={patient} />
        )}

        {/* Reset button */}
        {scannedToken && (
          <Button variant="outline" onClick={handleReset} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Scan Another
          </Button>
        )}
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 8px; }
          50% { top: calc(100% - 8px); }
        }
      `}</style>
    </PageLayout>
  );
}
