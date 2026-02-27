import { useState } from "react";
import { Plus, Trash2, QrCode, Loader2, UserRound, Download, Copy } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLayout } from "../components/PageLayout";
import {
  useAllPatients,
  useCreatePatient,
  useDeletePatient,
  PatientStatus,
  Day,
} from "../hooks/useQueries";
import { type Patient } from "../backend.d";
import { toast } from "sonner";

// QR Code display via public API
function QRCodeDisplay({ value, size = 200 }: { value: string; size?: number }) {
  const encodedValue = encodeURIComponent(`${window.location.origin}/view/${value}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedValue}&format=png&bgcolor=ffffff&color=1a2a4a`;
  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={qrUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg border border-border"
      />
    </div>
  );
}

function PatientStatusBadge({ status }: { status: PatientStatus }) {
  if (status === PatientStatus.admitted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Admitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Discharged
    </span>
  );
}

function getDayFromDate(dateStr: string): Day {
  if (!dateStr) return Day.mon;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return Day.mon;
  const days: Day[] = [Day.sun, Day.mon, Day.tue, Day.wed, Day.thu, Day.fri, Day.sat];
  return days[date.getDay()];
}

function getDayLabel(dateStr: string): string {
  const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return labels[date.getDay()];
}

interface AddPatientForm {
  name: string;
  admitDate: string;
  admitTime: string;
  ward: string;
}

const today = new Date().toISOString().split("T")[0];
const nowTime = new Date().toTimeString().slice(0, 5);

export function PatientsPage() {
  const { data: patients = [], isLoading } = useAllPatients();
  const createPatient = useCreatePatient();
  const deletePatient = useDeletePatient();

  const [showAdd, setShowAdd] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<AddPatientForm>({
    name: "",
    admitDate: today,
    admitTime: nowTime,
    ward: "",
  });

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleFieldChange(field: keyof AddPatientForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAddPatient() {
    if (!form.name.trim() || !form.admitDate || !form.admitTime || !form.ward.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createPatient.mutateAsync({
        name: form.name.trim(),
        admitDate: form.admitDate,
        admitDay: getDayFromDate(form.admitDate),
        admitTime: form.admitTime,
        ward: form.ward.trim(),
      });
      toast.success("Patient added successfully");
      setShowAdd(false);
      setForm({ name: "", admitDate: today, admitTime: nowTime, ward: "" });
    } catch {
      toast.error("Failed to add patient");
    }
  }

  async function handleDelete(e: React.MouseEvent, id: bigint) {
    e.stopPropagation();
    try {
      await deletePatient.mutateAsync(id);
      toast.success("Patient record deleted");
      if (selectedPatient?.patientId === id) setSelectedPatient(null);
    } catch {
      toast.error("Failed to delete patient");
    }
  }

  function handleCopyQRLink(patient: Patient) {
    const link = `${window.location.origin}/view/${patient.qrToken}`;
    void navigator.clipboard.writeText(link).then(() => toast.success("QR link copied!"));
  }

  function handleDownloadQR(patient: Patient) {
    const encodedValue = encodeURIComponent(`${window.location.origin}/view/${patient.qrToken}`);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodedValue}&format=png&bgcolor=ffffff&color=1a2a4a`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `patient-qr-${patient.name.replace(/\s+/g, "-")}.png`;
    a.target = "_blank";
    a.click();
  }

  return (
    <PageLayout
      title="Patients Record"
      subtitle={`${patients.length} patient${patients.length !== 1 ? "s" : ""} in database`}
      action={
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      }
    >
      {/* Search bar */}
      {patients.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No patients yet</p>
          <p className="text-sm text-muted-foreground">Add a patient record to get started</p>
          <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No patients match your search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          <Table className="clinical-table">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Ward</TableHead>
                <TableHead className="hidden md:table-cell">Admit Date</TableHead>
                <TableHead className="hidden lg:table-cell">Time</TableHead>
                <TableHead className="hidden lg:table-cell">Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">QR</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient, idx) => (
                <TableRow
                  key={String(patient.patientId)}
                  onClick={() => setSelectedPatient(patient)}
                  className="cursor-pointer"
                >
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {patient.ward}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {patient.admitDate}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {patient.admitTime}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell capitalize">
                    {patient.admitDay}
                  </TableCell>
                  <TableCell>
                    <PatientStatusBadge status={patient.status} />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(patient);
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, patient.patientId)}
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

      {/* Patient Detail Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={(o) => !o && setSelectedPatient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-2">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="mt-0.5 font-medium text-foreground">{selectedPatient.name}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Ward</p>
                    <p className="mt-0.5 font-medium text-foreground">{selectedPatient.ward}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Admit Date</p>
                    <p className="mt-0.5 font-medium text-foreground">{selectedPatient.admitDate}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Admit Time</p>
                    <p className="mt-0.5 font-medium text-foreground">{selectedPatient.admitTime}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Day of Week</p>
                    <p className="mt-0.5 font-medium capitalize text-foreground">{selectedPatient.admitDay}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <PatientStatusBadge status={selectedPatient.status} />
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Patient QR Code</p>
                  <QRCodeDisplay value={selectedPatient.qrToken} size={180} />
                  <p className="font-mono text-xs text-muted-foreground break-all text-center">
                    {selectedPatient.qrToken.slice(0, 24)}...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyQRLink(selectedPatient)}
                      className="gap-2"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadQR(selectedPatient)}
                      className="gap-2"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download QR
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPatient(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Patient Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pat-name">Full Name *</Label>
              <Input
                id="pat-name"
                placeholder="e.g. John Smith"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pat-date">Admit Date *</Label>
                <Input
                  id="pat-date"
                  type="date"
                  value={form.admitDate}
                  onChange={(e) => handleFieldChange("admitDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pat-time">Admit Time *</Label>
                <Input
                  id="pat-time"
                  type="time"
                  value={form.admitTime}
                  onChange={(e) => handleFieldChange("admitTime", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Day of Week</Label>
              <Input
                value={getDayLabel(form.admitDate) || "Auto-filled from date"}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pat-ward">Ward *</Label>
              <Input
                id="pat-ward"
                placeholder="e.g. ICU, General, Pediatric"
                value={form.ward}
                onChange={(e) => handleFieldChange("ward", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPatient} disabled={createPatient.isPending}>
              {createPatient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Patient"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
