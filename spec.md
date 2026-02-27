# Hospital Information System

## Current State

The app has a single login flow that checks `isCallerAdmin()`. If the caller is admin, they proceed to `/dashboard` with full access (Patients, Doctors, Treatments, Medicine, Facilities, Visitor Log). Non-admins see "Access Denied" on the login page.

The backend supports three roles via `UserRole` enum: `admin`, `user` (staff), and `guest` (patient). The `getCallerUserRole()` and `getCallerUserProfile()` APIs exist but are not used in the frontend login routing.

## Requested Changes (Diff)

### Add

- **Staff Mode**: A logged-in user with role `user` gets a Staff dashboard. Badge shows "Staff Mode". Staff can:
  - View (read-only) Patients list and patient details with QR
  - View (read-only) Doctors list
  - View (read-only) Treatments list
  - View (read-only) Medicine inventory
  - View (read-only) Facilities list
  - Cannot add, edit, or delete anything
  - Cannot see Visitor Log

- **Patient Mode**: A logged-in user with role `guest` gets a minimal Patient dashboard. Badge shows "Patient Mode". Patient can:
  - See a welcome page with their name (from `getUserProfile`)
  - View their own admitted status / ward by scanning QR or seeing a limited info panel (read-only summary of the hospital, doctors available, and facilities status)
  - No access to full patient records or any management pages

- **Role-based routing**: After login, check `getCallerUserRole()`:
  - `admin` → `/dashboard` (existing Admin Mode)
  - `user` → `/staff-dashboard`
  - `guest` → `/patient-dashboard`
  - Unknown/no role → show Access Denied with a message "Contact admin to be assigned a role"

- **StaffDashboard page** (`/staff-dashboard`): Read-only overview cards for Patients, Doctors, Treatments, Medicine, Facilities with "Staff Mode" badge.
- **StaffNavBar**: Same visual as NavBar but shows "Staff Mode" badge (blue), no Visitor Log link, all pages are read-only.
- **Read-only versions of pages**: Staff pages disable all Add/Delete/Edit buttons.
- **PatientDashboard page** (`/patient-dashboard`): Welcome card with user name, hospital info summary (total doctors, facilities), and a list of available doctors (name, specialty, department). "Patient Mode" badge (purple).

### Modify

- **LoginPage**: After authentication, fetch `getCallerUserRole()` instead of just `isCallerAdmin()`, then route based on role. Update the "Access Denied" message to explain role assignment.
- **NavBar**: Accept an optional `role` prop to show the correct badge and nav items (admin sees all + Visitor Log; staff sees all except Visitor Log with no edit actions; patient sees only their dashboard).

### Remove

- Nothing removed.

## Implementation Plan

1. Create a `useCallerUserRole` hook in `useQueries.ts` that calls `getCallerUserRole()`.
2. Update `LoginPage.tsx` to use role-based routing: admin → `/dashboard`, user → `/staff-dashboard`, guest → `/patient-dashboard`.
3. Create `StaffDashboardPage.tsx` at `/staff-dashboard` with read-only stat cards, "Staff Mode" badge, and quick links to read-only sub-pages.
4. Create `PatientDashboardPage.tsx` at `/patient-dashboard` with welcome message, hospital summary (doctors count, facilities), and list of available doctors.
5. Create `StaffNavBar.tsx` (or extend NavBar with a `mode` prop) showing "Staff Mode" badge and no Visitor Log.
6. Create read-only staff pages: `StaffPatientsPage.tsx`, `StaffDoctorsPage.tsx`, `StaffTreatmentsPage.tsx`, `StaffMedicinePage.tsx`, `StaffFacilitiesPage.tsx` — same data display as admin pages, but without Add/Delete/Edit controls.
7. Register new routes in `App.tsx`: `/staff-dashboard`, `/patient-dashboard`, `/staff/patients`, `/staff/doctors`, `/staff/treatments`, `/staff/medicine`, `/staff/facilities`.
8. Update the Access Denied state in `LoginPage.tsx` to display "Contact your administrator to be assigned a role (Staff or Patient access)".
