# Implementation Plan: Automatic Duplicate Detection & Resolution Evidence Photo Proof

Enhance the CivicSense platform to achieve 100% compliance with the **SC-01 Smart Civic Complaint Triage System** MVP requirements by adding automated duplicate detection and faculty resolution evidence photo verification, while maintaining the soft, light Sage, Cream, and Lavender aesthetic.

---

## Proposed Changes

### 1. Automated Duplicate Detection System
- **Algorithm (`src/lib/duplicateDetection.ts`)**:
  - Compares the current report against existing unresolved complaints.
  - Computes geographical proximity using Haversine distance formula (within ~300 meters threshold).
  - Evaluates category matching and text token similarity.
  - Returns detected duplicates with distance (e.g., `120m away`), tracking number, and current status.
- **Citizen Form Banner (`src/components/DuplicateAlertBanner.tsx`)**:
  - Displays a soft Sage/Amber notice in the complaint form if a potential duplicate is detected.
  - Shows existing tracking ID, reported location, and status so citizens know their neighborhood issue is already tracked.
  - Allows citizens to proceed with submission or review the existing ticket.
- **Admin Review Table Indicator**:
  - Badges potential duplicates in the Admin Review table for quick triaging.

---

### 2. Resolution Photo Proof (Before & After Evidence)
- **Data Model (`src/types/civic.ts` & `src/lib/firebase.ts`)**:
  - Add `resolutionImageUrl` and `resolutionImageFileName` to `ComplaintSubmission`.
  - Update `resolveComplaintRecord` to store resolution photos.
- **Faculty Resolution Modal (`src/components/FacultyReviewPanel.tsx`)**:
  - Add photo upload button with preview in the "Mark Resolved" modal.
  - Allows faculty to attach photo proof of repair (e.g., repaved asphalt, repaired streetlight).
- **Citizen & Admin "Before & After" Evidence View**:
  - In `SubmissionsList.tsx` and `AdminReviewPanel.tsx`, display side-by-side "Incident Reported" vs "Resolution Proof" photos for transparent civic accountability.

---

### 3. Theme & Layout Integrity
- Maintain Cream background (`#FDFBF7`), Sage Green (`#8DA399`), Soft Lavender (`#6B6A75`), `1rem` rounded corners, and hand-drawn doodles.

---

## Verification Plan

### Automated & Static Verification
- Run `npm run lint` (`lint_applet`) to ensure strict TypeScript and type correctness.
- Run `compile_applet` to verify build completion.

### Functional Verification
1. **Duplicate Detection**: In the citizen form, select location "420 Maple Street" and category "Roads & Potholes"; verify the automated duplicate banner flags existing complaint `CIV-1042`.
2. **Resolution Photo Proof**: Log in as `faculty@gmail.com` / `faculty123`, click "Mark Resolved", upload a repair photo, and verify that the photo appears under "Completed" and in the citizen's tracked reports view.
