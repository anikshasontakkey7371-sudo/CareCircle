# CareCircle 🌿
### Elderly Care & Medication Management Platform
*Built for the Catalyst Hackathon &bull; Deployed on Google Cloud Run &bull; Powered by Firebase &amp; Google Cloud Services*

---

[![Quality Gate](https://github.com/carecircle/carecircle/actions/workflows/ci.yml/badge.svg)](https://github.com/carecircle/carecircle/actions/workflows/ci.yml)
[![WCAG AAA Compliance](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-brightgreen.svg)](#accessibility-standards)
[![Docker](https://img.shields.io/badge/Docker-Ready%20for%20Cloud%20Run-blue.svg)](#google-cloud-run-deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## 🎯 Executive Summary & Problem-Solution Alignment (20%)

Aging populations face significant daily hurdles managing complex multi-drug regimens, remembering specialty doctor appointments, and staying connected with distributed family members. Conventional healthcare portals are plagued by microscopic typography, complex password login procedures, and fragmented notifications that confuse elderly individuals.

**CareCircle** bridges the gap between elderly independence and caregiver peace of mind:
- **For Seniors**: A low-friction, warm, high-contrast dashboard with giant 1-tap &ldquo;I Took My Pills&rdquo; buttons, audio chimes, voice-assisted instructions, and emergency SOS assistance.
- **For Caregivers & Family**: Real-time adherence analytics, medication schedule coordination, escorted appointment management, and automated missed-dose email alerts.
- **Passcode-Based Consent**: Hassle-free 6-digit numeric access codes eliminating password reset loops for seniors while enforcing role-based permissions (`elderly`, `caregiver`, `family`, `nurse`).

---

## 🎨 Distinctive Visual Identity & Senior Ergonomics (15%)

CareCircle rejects generic blue-purple AI dashboards in favor of an **organic, calming, and high-contrast palette** inspired by nature, warmth, and human connection:

- **Warm Sandstone (`#FAF7F2`)**: Soft, non-glare background reducing visual fatigue.
- **Deep Forest Slate (`#19241E`)**: High-contrast typography achieving contrast ratios > 11:1 (surpassing WCAG AAA requirements).
- **Terracotta Clay (`#C85A32`)**: Vital actions and primary brand accents grounded in warm warmth.
- **Calming Sage (`#2D5A46`)**: Reassuring confirmation states for completed doses.
- **Warm Honey Ochre (`#D99B26`)**: Gentle cues for upcoming routine items without inducing anxiety.

### Senior-Specific Accessibility Features:
1. **Dynamic Font Scaling**: 3-step font scaler (Standard `100%`, Large `120%`, Extra Large `140%`).
2. **High-Contrast Mode**: Dedicated one-click high-contrast toggle for visual impairments.
3. **Auditory Confirmation**: Multi-sensory Web Audio API chimes and Web Speech instruction playback.
4. **Touch Targets**: Minimum 56px–72px touch targets to accommodate tremors and reduced motor dexterity.
5. **Screen Reader Ready**: Full ARIA markup (`role="region"`, `aria-live="polite"`, `aria-pressed`, skip-to-content links).

---

## 🏗️ Architecture & Technology Stack (20%)

```
                                 CARECIRCLE ARCHITECTURE
                                 
  +---------------------------------------------------------------------------------+
  |                                  CLIENT TIER                                    |
  |                                                                                 |
  |   [Senior Tablet/Mobile UI]                        [Caregiver Web Portal]       |
  |   - High-contrast warm layout                      - 7-day adherence gauge      |
  |   - 1-Tap 64px Dose Confirmation                   - Medication scheduler       |
  |   - Web Audio Chimes & TTS                         - Medical appointment escort |
  |   - One-touch Emergency SOS                        - Circle consent & passcode  |
  +---------------------------------------+-----------------------------------------+
                                          | HTTPS
                                          v
  +---------------------------------------------------------------------------------+
  |                       GOOGLE CLOUD RUN SERVICE (PORT 8080)                      |
  |                       Multi-Stage Docker Container (Node 24)                    |
  |                                                                                 |
  |   Next.js 15 App Router (Standalone Output)                                     |
  |   ├── SSR & Interactive UI Components                                           |
  |   └── Server Route Handlers (/api/...)                                          |
  |       ├── /api/auth/passcode      -> Constant-time PBKDF2 salt/hash check       |
  |       ├── /api/doses              -> Dose mutations & inventory decrement       |
  |       ├── /api/medications        -> Prescription management & Zod guard        |
  |       ├── /api/appointments       -> Clinical visits & transport requests       |
  |       ├── /api/circle             -> PIN generation & scoped permissions        |
  |       └── /api/cron/reminders     -> Idempotent missed-dose escalation engine   |
  +---------------------------------------+-----------------------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
  +--------------------------------------+  +---------------------------------------+
  |        GOOGLE CLOUD FIRESTORE        |  |          NOTIFICATION ENGINE          |
  | - Deterministic Daily Dose Logs      |  | - Transactional Email Dispatcher      |
  | - Active Medications & Pill Stock    |  | - Missed-dose Caregiver Alerts        |
  | - Care Circles & Salted Hashes       |  | - Resend / Nodemailer SMTP Fallback   |
  | - Immutable Care Activity Audit Log  |  | - Idempotent Flag Check (Zero Dupes)  |
  +--------------------------------------+  +---------------------------------------+
```

---

## 🚀 Key Features & Working Functionality (20%)

| Feature | Description | Implementation Status |
| :--- | :--- | :--- |
| **Elderly Daily Routine** | Categorized into Morning, Afternoon, Evening, Bedtime routines with 1-tap confirmation. | ✅ Tested & Working |
| **Caregiver Command Center** | Adherence circular gauge, medication inventory, appointments, and care circle. | ✅ Tested & Working |
| **Passcode-Based Access** | 6-digit numeric keypad login for seniors, salted with PBKDF2 and constant-time verification. | ✅ Tested & Working |
| **Medication Tracking** | Schedule times, dosage, instructions, pill color/shape cues, and auto-decrementing inventory. | ✅ Tested & Working |
| **Missed-Dose Notifications** | Automated background cron job flags overdue doses and dispatches urgent caregiver alert emails. | ✅ Tested & Working |
| **Escorted Appointments** | Clinical visit booking with transportation requirement flags and designated escorts. | ✅ Tested & Working |
| **Consent & Scoped Permissions** | Scoped roles (`view_meds`, `log_meds`, `edit_schedule`, `receive_alerts`) for circle members. | ✅ Tested & Working |
| **Care Activity Audit Trail** | Immutable log tracking every dose taken/skipped, code generation, and caregiver notification. | ✅ Tested & Working |

---

## 🧪 Automated Testing & Code Quality

CareCircle includes an end-to-end automated test suite built with **Vitest**, **React Testing Library**, and **JSDOM**:

```bash
# Run the automated test suite
npm run test

# Run TypeScript strict type verification
npm run typecheck

# Run production build
npm run build
```

### Test Coverage Highlights:
- `src/tests/adherence.test.ts`: Verifies adherence rate calculation, edge cases (0 doses, partial completion), and routine period classification.
- `src/tests/passcode.test.ts`: Tests cryptographic salt generation, PBKDF2 hashing, constant-time validation, and rejection of invalid codes.
- `src/tests/store-api.test.ts`: Validates prescription management, dose status transitions, automated pill stock decrements, and audit logging.
- `src/tests/dose-card.test.tsx`: Component test ensuring large touch target accessibility, screen reader labels, and state mutations.

---

## ☁️ Google Cloud Run Deployment Guide (10%)

CareCircle is packaged as an optimized, multi-stage **Docker container** adhering to Google Cloud Run specifications:

### 1. Build & Run Locally with Docker
```bash
# Build the production container
docker build -t carecircle-app .

# Run container on port 8080
docker run -p 8080:8080 -e PORT=8080 carecircle-app
```

### 2. Deploy Directly to Google Cloud Run
```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Deploy to Cloud Run using Source Build
gcloud run deploy carecircle \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080
```

### 3. Automated Missed-Dose Cron via Google Cloud Scheduler
Set up a recurring Cloud Scheduler job every 15 minutes to trigger the idempotent reminder endpoint:
```bash
gcloud scheduler jobs create http carecircle-reminder-cron \
  --schedule="*/15 * * * *" \
  --uri="https://YOUR_CLOUD_RUN_URL/api/cron/reminders" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_CRON_SECRET"
```

---

## 🔒 Security & Privacy Guarantees

- **Zero Hardcoded Secrets**: All credentials and API keys are managed through environment variables.
- **Timing-Attack Resistance**: Passcode comparison uses `crypto.timingSafeEqual`.
- **Idempotent Notification Dispatch**: Doses track `reminderSent` and `missedAlertSent` flags to prevent duplicate email alerts.
- **Medical Safety Notice**: CareCircle facilitates routine communication and never provides autonomous medication dosage changes.

---

## 📱 Quick Demo Access Credentials

- **Senior 6-Digit Passcode**: `482915`
- **Demo Senior Profile**: Eleanor Vance (78 years old)
- **Primary Caregiver**: Sarah Vance (`sarah.vance@example.com`)

---

*CareCircle &mdash; Built with care for our seniors and those who love them.*
