import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Patient,
  Doctor,
  Treatment,
  Medicine,
  Facility,
  DashboardStats,
  VisitorLog,
  UserProfile,
} from "../backend.d";
import { PatientStatus, FacilityStatus, Day, UserRole } from "../backend.d";

// ── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLastBackupTimestamp() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["last-backup"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getLastBackupTimestamp();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTriggerBackup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.triggerBackup();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["last-backup"] });
    },
  });
}

// ── Admin check ───────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ── Patients ─────────────────────────────────────────────────────────────────

export function useAllPatients() {
  const { actor, isFetching } = useActor();
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      admitDate: string;
      admitDay: Day;
      admitTime: string;
      ward: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPatient(
        data.name,
        data.admitDate,
        data.admitDay,
        data.admitTime,
        data.ward,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePatient(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function usePatientByQrToken(qrToken: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Patient | null>({
    queryKey: ["patient-by-qr", qrToken],
    queryFn: async () => {
      if (!actor || !qrToken) return null;
      return actor.getPatientByQrToken(qrToken);
    },
    enabled: !!actor && !isFetching && !!qrToken,
    retry: false,
  });
}

// ── Doctors ──────────────────────────────────────────────────────────────────

export function useAllDoctors() {
  const { actor, isFetching } = useActor();
  return useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDoctors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      specialty: string;
      department: string;
      contact: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createDoctor(
        data.name,
        data.specialty,
        data.department,
        data.contact,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteDoctor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteDoctor(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["doctors"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ── Treatments ───────────────────────────────────────────────────────────────

export function useAllTreatments() {
  const { actor, isFetching } = useActor();
  return useQuery<Treatment[]>({
    queryKey: ["treatments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTreatments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTreatment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      patientId: bigint;
      treatmentType: string;
      notes: string;
      treatmentDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTreatment(
        data.patientId,
        data.treatmentType,
        data.notes,
        data.treatmentDate,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["treatments"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteTreatment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTreatment(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["treatments"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ── Medicines ─────────────────────────────────────────────────────────────────

export function useAllMedicines() {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMedicines();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMedicine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      quantity: bigint;
      unit: string;
      usage: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createMedicine(
        data.name,
        data.quantity,
        data.unit,
        data.usage,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["medicines"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteMedicine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteMedicine(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["medicines"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ── Facilities ────────────────────────────────────────────────────────────────

export function useAllFacilities() {
  const { actor, isFetching } = useActor();
  return useQuery<Facility[]>({
    queryKey: ["facilities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFacilities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFacility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      location: string;
      status: FacilityStatus;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createFacility(data.name, data.location, data.status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["facilities"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteFacility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFacility(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["facilities"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

// ── Visitor Log ───────────────────────────────────────────────────────────────

export function useVisitorLog() {
  const { actor, isFetching } = useActor();
  return useQuery<VisitorLog[]>({
    queryKey: ["visitor-log"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVisitorLog();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

// ── User Role & Profile ────────────────────────────────────────────────────────

export function useCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["caller-role"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["caller-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// Re-export enums as values (not types) for use in components
export { PatientStatus, FacilityStatus, Day, UserRole };
