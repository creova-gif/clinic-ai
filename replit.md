# Clinic AI (AfyaCare / CREOVA Health OS)

## Project Overview
An AI-first Electronic Medical Record (EMR) and Operating System designed for small clinics, dispensaries, and pharmacies in Tanzania and East Africa. Features multilingual support (English/Swahili), offline-first design, and AI-powered clinical decision support.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite 6
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** OpenAI API (GPT-4 for triage, Whisper for voice)
- **i18n:** i18next (English + Swahili)
- **State Management:** React Context

## Project Structure
- `src/app/` - Main React application (components, services, context, tests)
- `src/i18n/` - Internationalization config and locale files
- `src/styles/` - Design tokens and global CSS
- `src/backend/` - Middleware and server-side logic
- `supabase/` - Database schema and functions

## Development Setup
- Package manager: npm
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build`

## Key Features
1. EMR-Lite: Fast patient charting and vitals tracking
2. AI Triage Engine: Multilingual symptom assessment
3. E-Prescription System with drug interaction checks
4. Pharmacy Management with inventory tracking
5. Federated Health Record (AfyaID across facilities)
6. Offline-first for rural deployment

## Workflow
- **Start application**: `npm run dev` on port 5000 (webview)

## Deployment
- Type: Static site
- Build command: `npm run build`
- Output directory: `dist`
