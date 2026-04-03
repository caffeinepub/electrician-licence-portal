# Electrician Licence Portal

## Current State
The portal has a multi-step licence application flow (ApplyPage.tsx) and a home page (HomePage.tsx). The homepage hero section shows the "Official Online Application System" badge. The Review & Submit step already has a QR code section for paying the ₹100 application fee.

## Requested Changes (Diff)

### Add
- A **Payment Treasury Challan** section on the homepage, placed prominently in or just below the Official Online Application System hero section.
- The section shows:
  - Title: "Payment Treasury Challan"
  - Amount: ₹200
  - The newly uploaded QR code image: `/assets/screenshot_2026-04-03-23-20-12-65_b86b87620f0dd897e4c0859ecbb2d537-019d5478-c7d0-77ee-bcdf-4e31e30d38ef.jpg`
  - A text input for Reference Number (placeholder: "e.g. ELP-1")
  - A Submit button
  - Clear instruction to scan QR, pay ₹200, enter reference number, and submit

### Modify
- HomePage.tsx: Add Treasury Challan section below the hero section (before or replacing the existing notice bar, or as a new standalone section).

### Remove
- Nothing removed.

## Implementation Plan
1. In HomePage.tsx, add a new section below the hero (after the amber notice bar) titled "Payment Treasury Challan".
2. The section displays the QR code image, ₹200 amount, a reference number input field, and a Submit/Confirm button.
3. On submit, show a toast or inline success message confirming the reference number was received.
4. The new QR code image path: `/assets/screenshot_2026-04-03-23-20-12-65_b86b87620f0dd897e4c0859ecbb2d537-019d5478-c7d0-77ee-bcdf-4e31e30d38ef.jpg`
