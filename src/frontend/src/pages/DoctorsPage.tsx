import { useState } from "react";
import { Plus, Trash2, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageLayout } from "../components/PageLayout";
import {
  useAllDoctors,
  useCreateDoctor,
  useDeleteDoctor,
} from "../hooks/useQueries";
import { toast } from "sonner";

interface AddDoctorForm {
  name: string;
  specialty: string;
  department: string;
  contact: string;
}

const EMPTY_FORM: AddDoctorForm = {
  name: "",
  specialty: "",
  department: "",
  contact: "",
};

export function DoctorsPage() {
  const { data: doctors = [], isLoading } = useAllDoctors();
  const createDoctor = useCreateDoctor();
  const deleteDoctor = useDeleteDoctor();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddDoctorForm>(EMPTY_FORM);

  function handleField(field: keyof AddDoctorForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.specialty.trim() || !form.department.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createDoctor.mutateAsync({
        name: form.name.trim(),
        specialty: form.specialty.trim(),
        department: form.department.trim(),
        contact: form.contact.trim(),
      });
      toast.success("Doctor added successfully");
      setShowAdd(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Failed to add doctor");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteDoctor.mutateAsync(id);
      toast.success("Doctor record deleted");
    } catch {
      toast.error("Failed to delete doctor");
    }
  }

  return (
    <PageLayout
      title="Doctors Record"
      subtitle={`${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} registered`}
      action={
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      }
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
          <p className="text-sm text-muted-foreground">Add physician records to the system</p>
          <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
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
                <TableHead className="w-12" />
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
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(doctor.doctorId)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Doctor Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">Full Name *</Label>
              <Input
                id="doc-name"
                placeholder="Dr. Jane Smith"
                value={form.name}
                onChange={(e) => handleField("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-spec">Specialty *</Label>
              <Input
                id="doc-spec"
                placeholder="e.g. Cardiology, Neurology"
                value={form.specialty}
                onChange={(e) => handleField("specialty", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-dept">Department *</Label>
              <Input
                id="doc-dept"
                placeholder="e.g. Emergency, Surgery"
                value={form.department}
                onChange={(e) => handleField("department", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-contact">Contact</Label>
              <Input
                id="doc-contact"
                placeholder="e.g. +1 555-0100"
                value={form.contact}
                onChange={(e) => handleField("contact", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={createDoctor.isPending}>
              {createDoctor.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Doctor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
