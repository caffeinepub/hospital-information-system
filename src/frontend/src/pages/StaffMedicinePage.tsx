import { Loader2, Pill } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "../components/PageLayout";
import { useAllMedicines } from "../hooks/useQueries";

export function StaffMedicinePage() {
  const { data: medicines = [], isLoading } = useAllMedicines();

  return (
    <PageLayout
      title="Medicine Inventory"
      subtitle={`${medicines.length} medicine${medicines.length !== 1 ? "s" : ""} in inventory`}
      navMode="staff"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : medicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Pill className="h-6 w-6 text-amber-500" />
          </div>
          <p className="font-medium text-foreground">No medicines in inventory</p>
          <p className="text-sm text-muted-foreground">No medication records to display</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <Table className="clinical-table">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="hidden sm:table-cell">Unit</TableHead>
                  <TableHead className="hidden md:table-cell">Usage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((med, idx) => (
                  <TableRow key={String(med.medicineId)}>
                    <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-mono font-semibold ${
                          med.quantity < 10n
                            ? "text-red-600"
                            : med.quantity < 50n
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }`}
                      >
                        {String(med.quantity)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {med.unit}
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
                      {med.usage || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Low stock notice */}
          {medicines.some((m) => m.quantity < 10n) && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Pill className="h-4 w-4 shrink-0" />
              <p>
                <span className="font-semibold">Low stock alert:</span>{" "}
                Some medicines have fewer than 10 units remaining.
              </p>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
