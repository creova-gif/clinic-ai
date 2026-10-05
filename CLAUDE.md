# CLAUDE.md — clinic-ai (AfyaCare)

Instructions for AI coding agents working in this repository.

## Project Overview

AfyaCare — an AI-first clinic and pharmacy OS for rural health centers in Tanzania/East Africa. "AfyaCare" is the actual in-app product name (appears throughout `src/i18n/config.ts`, `src/app/utils/auth.ts`, mobile app context) — it is this repository, not a separate product.

## Critical Known Issue — Do Not Add To This

This app currently has **no live database connected at all** (confirmed — none of the organization's Supabase projects match), while the actual UI contains real, functional TMDA ("Tanzania Medicines and Medical Devices Authority") certification claims in at least 9 components, including `TrustSafetyOverlay.tsx`, `OnboardingScreen.tsx`, and `AccountCreationScreen.tsx` — bilingually ("Imeidhinishwa na TMDA" / "TMDA Certified"). This is a real, unresolved false-claim problem, not settled marketing copy. **Do not add new certification, compliance, or "approved by" claims anywhere in this codebase without an explicit, verified source.** If asked to add such a claim, flag it rather than adding it.

## Product Purpose

Patient triage, pharmacy management, and prescriptions for rural clinics, designed for offline-capable, low-literacy use (SMS/USSD-friendly).

## Repository Structure

- Patient data model (`patients`, `triage_records`, `vitals`, `prescriptions`, `prescription_items`) is fully typed in `src/utils/supabase/client.ts` but has never been connected to a live database — the client requires `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` with no fallback, and none are currently configured against a real project.

## Technology Stack

React/Vite (or React Native — verify which surface you're in before assuming), Supabase (not yet provisioned), TypeScript.

## Security / Compliance

This is a health-data product. Any backend work here needs to be done alongside real RLS design, patient-data encryption considerations, and consent handling from the start — not retrofitted later. Do not build demo/sample patient flows that could be mistaken for real patient data handling.

## AI Agent Rules

- Do not remove or "fix" the TMDA claims by making them technically true through a workaround (e.g. adding a fake certificate reference) — if instructed to resolve this, the only correct paths are: remove the claim, or replace it with a real, verifiable one.
- Do not provision a new Supabase project or write patient-data migrations without explicit instruction — this is a product/compliance decision, not a default engineering task.

## Definition of Done

No new unverified compliance/certification claims introduced. Any new patient-data-handling code includes RLS from the first migration, not as a follow-up.
