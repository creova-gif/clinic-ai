# AfyaCare — AI-First Clinic & Pharmacy OS

**An operating system for small clinics, dispensaries, and rural health centers across Tanzania and East Africa — AI-assisted triage, patient records, prescribing, and pharmacy inventory, built for low-connectivity environments.**

![Status](https://img.shields.io/badge/status-active_development-yellow)
![License](https://img.shields.io/badge/license-proprietary-red)
![Stack](https://img.shields.io/badge/stack-React_%2F_Supabase_%2F_React_Native-blue)

## What this is

AfyaCare (Clinic AI) is a full clinic-and-pharmacy management system aimed at small clinics, dispensaries, and rural health centers. The core web app covers AI-assisted patient triage (symptom analysis with risk scoring, bilingual Swahili/English support), patient charting and timelines, a prescribing interface with AI drug-interaction and dosage checks, pharmacy inventory and dispensing, and an owner/admin dashboard. A companion mobile app and a Node backend (with USSD and SMS support) extend access to low-connectivity settings, and a Supabase backend handles data and edge functions.

[ADD SCREENSHOT HERE]

## Status: In active development

This is one of the most substantially built-out repos in the portfolio — real triage/prescribing/pharmacy workflows, a Supabase backend, a mobile companion app, and USSD/SMS support for offline-first regions. That said, a few things need verification before calling this production-ready:

- **No CI is configured** (`.github/CODEOWNERS` exists, but there's no workflow file), despite an extensive test suite defined in `package.json` (security, FHIR compliance, load, i18n, data-integrity tests) — worth confirming these tests actually run and pass, not just that the scripts exist.
- Given this handles patient health data, a security/compliance review (data protection, FHIR interoperability claims, PDPA-equivalent regulatory alignment for Tanzania) should happen before any real clinic pilots.

### Roadmap
- Stand up CI to actually run the existing test suite
- Formal security/compliance review for patient data handling
- Pilot with a real clinic or dispensary partner

## Quickstart

```bash
npm i
npm run dev              # web app
npm run test:ci          # full test suite (unverified — confirm it passes)
```

For the mobile companion app:
```bash
cd mobile
npm i
npm start
```

## Folder overview

- `src/app/components/creova/` — core clinical screens (triage, patient chart, prescribing, pharmacy dispense, owner dashboard)
- `backend/` — Node backend, including USSD server and SMS templates for offline-first access
- `supabase/functions/` — Supabase edge functions
- `mobile/` — Expo companion app

## Contributing

See the [org-wide CONTRIBUTING.md](https://github.com/creova-gif/.github/blob/main/CONTRIBUTING.md) for guidelines, including our AI-assisted contribution policy.

## License

Proprietary — © CREOVA. All rights reserved.
