import { useState } from "react";
import { Plus, Trash2, Loader2, Building2 } from "lucide-react";
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
  useAllFacilities,
  useCreateFacility,
  useDeleteFacility,
  FacilityStatus,
} from "../hooks/useQueries";
import { toast } from "sonner";

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

interface AddFacilityForm {
  name: string;
  location: string;
  status: FacilityStatus;
}

const EMPTY_FORM: AddFacilityForm = {
  name: "",
  location: "",
  status: FacilityStatus.available,
};

export function FacilitiesPage() {
  const { data: facilities = [], isLoading } = useAllFacilities();
  const createFacility = useCreateFacility();
  const deleteFacility = useDeleteFacility();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddFacilityForm>(EMPTY_FORM);

  function handleField(field: keyof AddFacilityForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createFacility.mutateAsync({
        name: form.name.trim(),
        location: form.location.trim(),
        status: form.status,
      });
      toast.success("Facility added successfully");
      setShowAdd(false);
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Failed to add facility");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteFacility.mutateAsync(id);
      toast.success("Facility removed");
    } catch {
      toast.error("Failed to delete facility");
    }
  }

  const available = facilities.filter((f) => f.status === FacilityStatus.available).length;
  const occupied = facilities.filter((f) => f.status === FacilityStatus.occupied).length;
  const maintenance = facilities.filter((f) => f.status === FacilityStatus.maintenance).length;

  return (
    <PageLayout
      title="Current Facilities"
      subtitle={`${facilities.length} facility${facilities.length !== 1 ? " records" : ""}`}
      action={
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Facility
        </Button>
      }
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
          <p className="text-sm text-muted-foreground">Add hospital rooms and equipment to track</p>
          <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Facility
          </Button>
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
                <TableHead className="w-12" />
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
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(facility.facilityId)}
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

      {/* Add Facility Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fac-name">Facility Name *</Label>
              <Input
                id="fac-name"
                placeholder="e.g. ICU Room 4, MRI Suite, Lab A"
                value={form.name}
                onChange={(e) => handleField("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fac-location">Location *</Label>
              <Input
                id="fac-location"
                placeholder="e.g. 3rd Floor East Wing"
                value={form.location}
                onChange={(e) => handleField("location", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleField("status", v as FacilityStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FacilityStatus.available}>Available</SelectItem>
                  <SelectItem value={FacilityStatus.occupied}>Occupied</SelectItem>
                  <SelectItem value={FacilityStatus.maintenance}>Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={createFacility.isPending}>
              {createFacility.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Facility"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
