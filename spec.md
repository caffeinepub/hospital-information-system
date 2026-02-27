# Hospital Information System

## Current State
The LoginPage uses Internet Identity authentication. After login, it reads the user's assigned role from the backend (`useCallerUserRole`) and automatically navigates to the appropriate dashboard:
- `UserRole.admin` → `/dashboard`
- `UserRole.user` → `/staff-dashboard`
- `UserRole.guest` → `/patient-dashboard`

There is no way to manually choose a mode — the user always gets routed based on their backend-assigned role.

## Requested Changes (Diff)

### Add
- A **Demo Mode role selector** on the Login page, shown before or after login, that lets the user pick which mode to preview: **Admin**, **Staff**, or **Patient**.
- When a role is selected in the selector, clicking "Enter as [Role]" navigates directly to that role's dashboard without checking the backend role — bypassing the automatic role-based routing.
- The selector should be visually distinct from the main login button, labeled clearly as "Preview Mode" or "Demo Mode" so it's obvious it's for previewing different role experiences.

### Modify
- `LoginPage.tsx`: Add a role selector UI section below the Internet Identity login button. It should show three buttons/cards: Admin, Staff, Patient. Clicking one navigates directly to `/dashboard`, `/staff-dashboard`, or `/patient-dashboard` respectively.
- The existing Internet Identity login flow and auto-role-redirect logic remains intact for real authenticated users.

### Remove
- Nothing removed.

## Implementation Plan
1. In `LoginPage.tsx`, add a "Preview Mode" section below the main login card.
2. Render three role option buttons: Admin (shield/lock icon, navy/blue color), Staff (users icon, blue color), Patient (heart icon, purple color).
3. Each button calls `navigate({ to: "..." })` directly — no authentication required.
4. Style the section with a subtle divider labeled "or preview a role" to separate it from the main login.
5. No backend changes needed.
