import { Loader2, ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "../components/PageLayout";
import { useAllTreatments, useAllPatients } from "../hooks/useQueries";

export function StaffTreatmentsPage() {
  const { data: treatments = [], isLoading } = useAllTreatments();
  const { data: patients = [] } = useAllPatients();

  function getPatientName(patientId: bigint): string {
    const patient = patients.find((p) => p.patientId === patientId);
    return patient ? patient.name : `ID: ${String(patientId)}`;
  }

  return (
    <PageLayout
      title="Treatment Records"
      subtitle={`${treatments.length} treatment${treatments.length !== 1 ? "s" : ""} recorded`}
      navMode="staff"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : treatments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
            <ClipboardList className="h-6 w-6 text-violet-500" />
          </div>
          <p className="font-medium text-foreground">No treatments recorded</p>
          <p className="text-sm text-muted-foreground">No treatment records to display</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table className="clinical-table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Treatment Type</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment, idx) => (
                <TableRow key={String(treatment.treatmentId)}>
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    {getPatientName(treatment.patientId)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {treatment.treatmentType}
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
                    {treatment.notes || "—"}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {treatment.treatmentDate}
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
