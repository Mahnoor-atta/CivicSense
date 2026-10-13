# CivicSense (Smart Civic Complaint Triage System - SC-01)

> A modern, citizen-centric municipal care and rapid response platform designed to bridge the gap between residents and city administration through AI-powered triaging, precise location pinning, photographic proof, and transparent multi-role workflow dispatch.

---

## 📋 Overview

**CivicSense** is a full-stack civic complaint management application built to streamline municipal problem reporting and resolution. Whether it is deep road potholes, streetlight wire hazards, solid waste overflow, or drainage blockages, CivicSense empowers residents to report issues instantly and track them transparently through every stage of administrative review, faculty crew dispatch, and verified photographic resolution.

---

## ✨ Core Features & Role-Based Workflows

CivicSense implements strict role-based access control (RBAC) tailored for three key municipal stakeholders:

### 👤 1. Citizen Resident Portal
- **Instant Incident Reporting**: File civic complaints with title categories, custom descriptions, and photographic evidence.
- **Smart AI Auto-Triage**: Powered by Gemini AI to automatically analyze issue descriptions and photos, categorizing the department and urgency priority.
- **Interactive Map Location Pinning**: Select exact GPS coordinates, pin street addresses, or use municipal landmark presets.
- **Duplicate Detection Warning**: Automatically alerts users of nearby duplicate reports to prevent redundant logging.
- **Live Status Tracking**: Track complaints in real-time (`Received` → `Forwarded` → `Resolved` or `Rejected`) with official faculty resolution proof.

### 🛡️ 2. City Administrator Portal
- **Triage Review Queue**: Review incoming citizen submissions with filtering by priority and status.
- **Mandatory Rejection Notices**: Reject invalid or out-of-scope complaints with mandatory feedback sent directly to the citizen.
- **Faculty Dispatch & Deadlines**: Forward valid complaints to specialized municipal faculty departments with completion deadlines and administrative instructions.

### 🔧 3. Faculty & Municipal Engineering Portal
- **Forwarded Tasks Queue**: View assigned departmental tickets and manage active repairs.
- **Visual Proof Resolution**: Upload "After" resolution photographs alongside detailed notes to verify completed repairs.
- **Audit Trails**: Complete transparency on who resolved each incident and when.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Custom SVG Doodles & Lightbox modals.
- **AI Integration**: `@google/genai` (Google Gemini API) for automated issue categorization and safety priority scoring.
- **Backend & Database**: Firebase Firestore for persistent cloud document storage and real-time synchronization with automatic local storage fallback.
- **Build Tool**: Vite.

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd civicsense
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure your Firebase and Gemini API keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GEMINI_API_KEY=your_google_genai_api_key_here
```

*(Note: If Firebase credentials are not provided, CivicSense automatically operates in local simulation mode with pre-loaded demo records and full local persistence).*

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🚀 Future Scope

- **GIS Heatmap Analytics**: City-wide spatial visualization of complaint clusters and high-frequency hazard zones.
- **Push & SMS Notifications**: Real-time alerts for citizens when their reported issue status changes or gets resolved.
- **Multi-Language Support**: Regional localization (Urdu, Sindhi, Punjabi, etc.) for broader citizen accessibility.
- **Automated SLA Escalation**: Automatic escalation flags for overdue faculty tickets exceeding municipal completion deadlines.

---

## 📄 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
