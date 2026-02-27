import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type DoctorId = bigint;
export type FacilityId = bigint;
export interface Facility {
    status: FacilityStatus;
    name: string;
    facilityId: FacilityId;
    location: string;
}
export type PatientId = bigint;
export type TreatmentId = bigint;
export interface Patient {
    status: PatientStatus;
    patientId: PatientId;
    admitDay: Day;
    name: string;
    ward: string;
    qrToken: string;
    admitDate: string;
    admitTime: string;
}
export type LogId = bigint;
export interface DashboardStats {
    totalPatients: bigint;
    totalFacilities: bigint;
    totalScans: bigint;
    totalTreatments: bigint;
    totalDoctors: bigint;
    totalMedicines: bigint;
}
export interface VisitorLog {
    logId: LogId;
    qrToken: string;
    timestamp: Time;
    patientName: string;
}
export type MedicineId = bigint;
export interface Medicine {
    name: string;
    unit: string;
    usage: string;
    quantity: bigint;
    medicineId: MedicineId;
}
export interface Doctor {
    doctorId: DoctorId;
    contact: string;
    name: string;
    specialty: string;
    department: string;
}
export interface Treatment {
    patientId: PatientId;
    notes: string;
    treatmentId: TreatmentId;
    treatmentDate: string;
    treatmentType: string;
}
export interface UserProfile {
    name: string;
}
export enum Day {
    fri = "fri",
    mon = "mon",
    sat = "sat",
    sun = "sun",
    thu = "thu",
    tue = "tue",
    wed = "wed"
}
export enum FacilityStatus {
    occupied = "occupied",
    available = "available",
    maintenance = "maintenance"
}
export enum PatientStatus {
    discharged = "discharged",
    admitted = "admitted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDoctor(name: string, specialty: string, department: string, contact: string): Promise<Doctor>;
    createFacility(name: string, location: string, status: FacilityStatus): Promise<Facility>;
    createMedicine(name: string, quantity: bigint, unit: string, usage: string): Promise<Medicine>;
    createPatient(name: string, admitDate: string, admitDay: Day, admitTime: string, ward: string): Promise<Patient>;
    createTreatment(patientId: PatientId, treatmentType: string, notes: string, treatmentDate: string): Promise<Treatment>;
    deleteDoctor(doctorId: DoctorId): Promise<void>;
    deleteFacility(facilityId: FacilityId): Promise<void>;
    deleteMedicine(medicineId: MedicineId): Promise<void>;
    deletePatient(patientId: PatientId): Promise<void>;
    deleteTreatment(treatmentId: TreatmentId): Promise<void>;
    getAllDoctors(): Promise<Array<Doctor>>;
    getAllFacilities(): Promise<Array<Facility>>;
    getAllMedicines(): Promise<Array<Medicine>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAllPatientsByName(): Promise<Array<Patient>>;
    getAllTreatments(): Promise<Array<Treatment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getLastBackupTimestamp(): Promise<Time>;
    getPatientByQrToken(qrToken: string): Promise<Patient | null>;
    getTotalScans(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorLog(): Promise<Array<VisitorLog>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    triggerBackup(): Promise<void>;
    updateDoctor(doctorId: DoctorId, name: string | null, specialty: string | null, department: string | null, contact: string | null): Promise<void>;
    updateFacility(facilityId: FacilityId, name: string | null, location: string | null, status: FacilityStatus | null): Promise<void>;
    updateMedicine(medicineId: MedicineId, name: string | null, quantity: bigint | null, unit: string | null, usage: string | null): Promise<void>;
    updatePatient(patientId: PatientId, name: string | null, admitDate: string | null, admitDay: Day | null, admitTime: string | null, ward: string | null, status: PatientStatus | null): Promise<void>;
    updateTreatment(treatmentId: TreatmentId, treatmentType: string | null, notes: string | null, treatmentDate: string | null): Promise<void>;
}
