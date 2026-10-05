# AfyaCare — AI-First Clinic & Pharmacy OS

**An operating system for small clinics, dispensaries, and rural health centers across Tanzania and East Africa — AI-assisted triage, patient records, prescribing, and pharmacy inventory, built for low-connectivity environments.**

![Status](https://img.shields.io/badge/status-active_development-yellow)
![License](https://img.shields.io/badge/license-proprietary-red)
![Stack](https://img.shields.io/badge/stack-React_%2F_Supabase_%2F_React_Native-blue)

![AfyaCare loading screen](docs/screenshots/dashboard.png)

## Overview

AfyaCare (this repo, "clinic-ai") is a clinic-and-pharmacy management system for small clinics, dispensaries, and rural health centers.

## Problem

Rural and low-connectivity health centers in East Africa lack digital tools for triage, prescribing, and pharmacy inventory that work reliably offline and in local languages.

## Solution

AI-assisted patient triage with bilingual Swahili/English support, patient charting, a prescribing interface with drug-interaction checks, pharmacy inventory, and USSD/SMS access paths for low-connectivity settings.

## Key Capabilities

- AI-assisted triage with symptom analysis and risk scoring
- Patient charting and timelines
- Prescribing with AI drug-interaction and dosage checks
- Pharmacy inventory and dispensing
- USSD/SMS access via a companion Node backend
- Owner/admin dashboard

## ⚠️ Known Critical Issue — Read Before Working On This Repo

**There is currently no live database connected to this application.** The patient data model (patients, triage_records, vitals, prescriptions) is fully typed in code but the Supabase client has no configured project — none of the organization's Supabase projects match this app.

**Separately, and more seriously:** the application UI contains real, functional claims of "TMDA Certified" (Tanzania Medicines and Medical Devices Authority) certification in at least 9 components — including a component named `TrustSafetyOverlay.tsx`, bilingually, appearing in the actual patient onboarding and account-creation flow. This has not been verified as true. **Do not add to, repeat, or "resolve" this claim through a workaround — flag it for a product decision rather than extending it.**

## Architecture

React/Vite web app, a Node backend (USSD server, SMS templates) for offline-first access, a Supabase backend for data and edge functions (not currently provisioned), and an Expo companion mobile app.

## Technology Stack

| Layer | Technology |
|---|---|
| Web frontend | React / Vite |
| Mobile | Expo (React Native) |
| Backend | Node (USSD/SMS), Supabase Edge Functions |
| Database | Supabase Postgres (not currently connected) |

## Repository Structure

- `src/app/components/creova/` — core clinical screens (triage, patient chart, prescribing, pharmacy dispense, owner dashboard)
- `backend/` — Node backend, USSD server, SMS templates
- `supabase/functions/` — edge functions
- `mobile/` — Expo companion app

## Getting Started

```bash
npm i
npm run dev              # web app
```

For the mobile companion app:
```bash
cd mobile
npm i
npm start
```

## Testing

An extensive test suite is defined in `package.json` (security, FHIR compliance, load, i18n, data-integrity tests) and CI does run a build check. Whether the full test suite actually passes has not been independently confirmed — verify before relying on it.

## Security

This handles patient health data. Any new backend work should include RLS design and consent handling from the start, not as a follow-up. No new certification or compliance claims should be added without a verified source.

## Project Status

Active development, substantially built out (triage/prescribing/pharmacy workflows, mobile companion, USSD/SMS support) — but with no live database and an unresolved false certification claim in the UI. Not ready for a real clinic pilot until both are addressed.

## Roadmap

- [ ] Resolve the TMDA certification claim: remove it, or replace with a real, verified one — this is a product/legal decision, not an engineering default
- [ ] Provision a real Supabase project and connect the existing typed data model
- [ ] Confirm the existing test suite actually passes
- [ ] Formal security/compliance review before any real clinic pilot

## Contributing

See the [org-wide CONTRIBUTING.md](https://github.com/creova-gif/.github/blob/main/CONTRIBUTING.md).

## License

Proprietary — © CREOVA. All rights reserved.

## Author / Organization

Built by [Justin Mafie](https://github.com/creova-gif) under CREOVA.

## Documentation

See `CLAUDE.md` for AI-agent-specific instructions on the certification-claim issue.
