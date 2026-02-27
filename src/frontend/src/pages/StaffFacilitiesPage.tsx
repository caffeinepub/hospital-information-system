import { Loader2, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "../components/PageLayout";
import { useAllFacilities, FacilityStatus } from "../hooks/useQueries";

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

export function StaffFacilitiesPage() {
  const { data: facilities = [], isLoading } = useAllFacilities();

  const available = facilities.filter((f) => f.status === FacilityStatus.available).length;
  const occupied = facilities.filter((f) => f.status === FacilityStatus.occupied).length;
  const maintenance = facilities.filter((f) => f.status === FacilityStatus.maintenance).length;

  return (
    <PageLayout
      title="Current Facilities"
      subtitle={`${facilities.length} facility${facilities.length !== 1 ? " records" : ""}`}
      navMode="staff"
    >
      {/* Status summary */}
      {facilities.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <div>
              <p className="text-xs text-green-600">Available</p>
              <p className="font-display font-bold text-green-700">{available}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <div>
              <p className="text-xs text-amber-600">Occupied</p>
              <p className="font-display font-bold text-amber-700">{occupied}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <div>
              <p className="text-xs text-red-600">Maintenance</p>
              <p className="font-display font-bold text-red-700">{maintenance}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : facilities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
            <Building2 className="h-6 w-6 text-teal-500" />
          </div>
          <p className="font-medium text-foreground">No facilities registered</p>
          <p className="text-sm text-muted-foreground">No facility records to display</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table className="clinical-table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Facility Name</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility, idx) => (
                <TableRow key={String(facility.facilityId)}>
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {facility.location}
                  </TableCell>
                  <TableCell>
                    <FacilityStatusBadge status={facility.status} />
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
