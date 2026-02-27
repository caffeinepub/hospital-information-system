import { useState } from "react";
import { Plus, Trash2, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAllTreatments,
  useCreateTreatment,
  useDeleteTreatment,
  useAllPatients,
} from "../hooks/useQueries";
import { toast } from "sonner";

interface AddTreatmentForm {
  patientId: string;
  treatmentType: string;
  notes: string;
  treatmentDate: string;
}

const EMPTY_FORM: AddTreatmentForm = {
  patientId: "",
  treatmentType: "",
  notes: "",
  treatmentDate: new Date().toISOString().split("T")[0],
};

export function TreatmentsPage() {
  const { data: treatments = [], isLoading } = useAllTreatments();
  const { data: patients = [] } = useAllPatients();
  const createTreatment = useCreateTreatment();
  const deleteTreatment = useDeleteTreatment();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddTreatmentForm>(EMPTY_FORM);

  function handleField(field: keyof AddTreatmentForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function getPatientName(patientId: bigint): string {
    const patient = patients.find((p) => p.patientId === patientId);
    return patient ? patient.name : `ID: ${String(patientId)}`;
  }

  async function handleAdd() {
    if (!form.patientId || !form.treatmentType.trim() || !form.treatmentDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTreatment.mutateAsync({
        patientId: BigInt(form.patientId),
        treatmentType: form.treatmentType.trim(),
        notes: form.notes.trim(),
        treatmentDate: form.treatmentDate,
      });
      toast.success("Treatment record added");
      setShowAdd(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Failed to add treatment");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteTreatment.mutateAsync(id);
      toast.success("Treatment record deleted");
    } catch {
      toast.error("Failed to delete treatment");
    }
  }

  return (
    <PageLayout
      title="Treatment Records"
      subtitle={`${treatments.length} treatment${treatments.length !== 1 ? "s" : ""} recorded`}
      action={
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Treatment
        </Button>
      }
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
          <p className="text-sm text-muted-foreground">Add treatment plans for admitted patients</p>
          <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Treatment
          </Button>
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
                <TableHead className="w-12" />
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
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(treatment.treatmentId)}
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

      {/* Add Treatment Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Treatment Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Patient *</Label>
              <Select
                value={form.patientId}
                onValueChange={(v) => handleField("patientId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={String(p.patientId)} value={String(p.patientId)}>
                      {p.name} — {p.ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="treat-type">Treatment Type *</Label>
              <Input
                id="treat-type"
                placeholder="e.g. Surgery, Physiotherapy, Chemotherapy"
                value={form.treatmentType}
                onChange={(e) => handleField("treatmentType", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="treat-notes">Notes</Label>
              <Textarea
                id="treat-notes"
                placeholder="Additional notes about the treatment..."
                value={form.notes}
                onChange={(e) => handleField("notes", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="treat-date">Treatment Date *</Label>
              <Input
                id="treat-date"
                type="date"
                value={form.treatmentDate}
                onChange={(e) => handleField("treatmentDate", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={createTreatment.isPending}>
              {createTreatment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Treatment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
