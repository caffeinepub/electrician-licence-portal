# Electrician Licence Portal

## Current State
The Check Application Status page (`StatusPage.tsx`) calls `actor.getFullApplication(id)` to retrieve application details. However, this backend function requires the caller to be either the original applicant or an admin — anonymous visitors get a runtime trap ("Unauthorized"). This means any visitor trying to check their ELP reference number gets an error.

The backend has `getApplicationStatus(id)` which is a public query returning only the `Status` enum, but the frontend doesn't use it.

## Requested Changes (Diff)

### Add
- New backend public query `getPublicApplicationStatus(id)` that returns a limited set of fields safe to expose publicly: `{ id, fullName, licenseType, status, submittedAt, remarks }` without requiring authentication.

### Modify
- `StatusPage.tsx`: call the new `getPublicApplicationStatus` function instead of `getFullApplication` so unauthenticated users can check their ELP reference number.
- `backend.d.ts`: add type definition for the new public query and its return type `PublicApplicationStatus`.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `getPublicApplicationStatus` public query to `src/backend/main.mo` returning `{ id, fullName, licenseType, status, submittedAt, remarks }` — no auth check.
2. Add `PublicApplicationStatus` interface and `getPublicApplicationStatus` method to `src/frontend/src/backend.d.ts`.
3. Update `StatusPage.tsx` to call `actor.getPublicApplicationStatus(BigInt(id))` and display the returned data.
