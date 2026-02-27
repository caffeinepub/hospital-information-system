import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientsPage } from "./pages/PatientsPage";
import { DoctorsPage } from "./pages/DoctorsPage";
import { TreatmentsPage } from "./pages/TreatmentsPage";
import { MedicinePage } from "./pages/MedicinePage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { VisitorLogPage } from "./pages/VisitorLogPage";
import { PublicPatientView } from "./pages/PublicPatientView";
import { StaffDashboardPage } from "./pages/StaffDashboardPage";
import { PatientDashboardPage } from "./pages/PatientDashboardPage";
import { StaffPatientsPage } from "./pages/StaffPatientsPage";
import { StaffDoctorsPage } from "./pages/StaffDoctorsPage";
import { StaffTreatmentsPage } from "./pages/StaffTreatmentsPage";
import { StaffMedicinePage } from "./pages/StaffMedicinePage";
import { StaffFacilitiesPage } from "./pages/StaffFacilitiesPage";

// Root route — renders child routes + toaster
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// Login (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

// ── Admin routes ──────────────────────────────────────────────────────────────

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patients",
  component: PatientsPage,
});

const doctorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/doctors",
  component: DoctorsPage,
});

const treatmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/treatments",
  component: TreatmentsPage,
});

const medicineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/medicine",
  component: MedicinePage,
});

const facilitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/facilities",
  component: FacilitiesPage,
});

const visitorLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/visitor-log",
  component: VisitorLogPage,
});

// ── Staff routes ──────────────────────────────────────────────────────────────

const staffDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff-dashboard",
  component: StaffDashboardPage,
});

const staffPatientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/patients",
  component: StaffPatientsPage,
});

const staffDoctorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/doctors",
  component: StaffDoctorsPage,
});

const staffTreatmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/treatments",
  component: StaffTreatmentsPage,
});

const staffMedicineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/medicine",
  component: StaffMedicinePage,
});

const staffFacilitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/facilities",
  component: StaffFacilitiesPage,
});

// ── Patient routes ────────────────────────────────────────────────────────────

const patientDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patient-dashboard",
  component: PatientDashboardPage,
});

// Public Patient View via QR — no login required
const publicPatientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/view/$qrToken",
  component: PublicPatientView,
});

// Build the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  // Admin
  dashboardRoute,
  patientsRoute,
  doctorsRoute,
  treatmentsRoute,
  medicineRoute,
  facilitiesRoute,
  visitorLogRoute,
  // Staff
  staffDashboardRoute,
  staffPatientsRoute,
  staffDoctorsRoute,
  staffTreatmentsRoute,
  staffMedicineRoute,
  staffFacilitiesRoute,
  // Patient
  patientDashboardRoute,
  // Public
  publicPatientRoute,
]);

// Create the router
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Declare router for type inference
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
