import { useState } from "react";
import { Plus, Trash2, Loader2, Pill } from "lucide-react";
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
  useAllMedicines,
  useCreateMedicine,
  useDeleteMedicine,
} from "../hooks/useQueries";
import { toast } from "sonner";

interface AddMedicineForm {
  name: string;
  quantity: string;
  unit: string;
  usage: string;
}

const EMPTY_FORM: AddMedicineForm = {
  name: "",
  quantity: "",
  unit: "",
  usage: "",
};

export function MedicinePage() {
  const { data: medicines = [], isLoading } = useAllMedicines();
  const createMedicine = useCreateMedicine();
  const deleteMedicine = useDeleteMedicine();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddMedicineForm>(EMPTY_FORM);

  function handleField(field: keyof AddMedicineForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.quantity || !form.unit.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error("Quantity must be a valid non-negative number");
      return;
    }
    try {
      await createMedicine.mutateAsync({
        name: form.name.trim(),
        quantity: BigInt(qty),
        unit: form.unit.trim(),
        usage: form.usage.trim(),
      });
      toast.success("Medicine added to inventory");
      setShowAdd(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Failed to add medicine");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteMedicine.mutateAsync(id);
      toast.success("Medicine removed from inventory");
    } catch {
      toast.error("Failed to delete medicine");
    }
  }

  return (
    <PageLayout
      title="Medicine Inventory"
      subtitle={`${medicines.length} medicine${medicines.length !== 1 ? "s" : ""} in inventory`}
      action={
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      }
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
          <p className="text-sm text-muted-foreground">Start tracking your medication stock</p>
          <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table className="clinical-table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Medicine Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="hidden sm:table-cell">Unit</TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
                <TableHead className="w-12" />
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
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(med.medicineId)}
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

      {/* Add Medicine Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="med-name">Medicine Name *</Label>
              <Input
                id="med-name"
                placeholder="e.g. Amoxicillin 500mg"
                value={form.name}
                onChange={(e) => handleField("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="med-qty">Quantity *</Label>
                <Input
                  id="med-qty"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={form.quantity}
                  onChange={(e) => handleField("quantity", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med-unit">Unit *</Label>
                <Input
                  id="med-unit"
                  placeholder="tablets, vials, mL"
                  value={form.unit}
                  onChange={(e) => handleField("unit", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="med-usage">Usage Instructions</Label>
              <Input
                id="med-usage"
                placeholder="e.g. Twice daily with food"
                value={form.usage}
                onChange={(e) => handleField("usage", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={createMedicine.isPending}>
              {createMedicine.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Inventory"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
