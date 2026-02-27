import { Loader2, Stethoscope } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "../components/PageLayout";
import { useAllDoctors } from "../hooks/useQueries";

export function StaffDoctorsPage() {
  const { data: doctors = [], isLoading } = useAllDoctors();

  return (
    <PageLayout
      title="Doctors Record"
      subtitle={`${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} registered`}
      navMode="staff"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Stethoscope className="h-6 w-6 text-blue-500" />
          </div>
          <p className="font-medium text-foreground">No doctors registered</p>
          <p className="text-sm text-muted-foreground">No physician records to display</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table className="clinical-table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor, idx) => (
                <TableRow key={String(doctor.doctorId)}>
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doctor.specialty}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {doctor.department}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {doctor.contact || "—"}
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
