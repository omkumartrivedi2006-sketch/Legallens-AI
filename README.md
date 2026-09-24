# LegalLens AI

**LegalLens AI** is a production-grade, GenAI-powered legal information and document-understanding platform. It empowers users to understand contracts, agreements, and legal documents in plain language, track affirmative obligations and milestone deadlines, compare revisions, and query multi-document libraries with strictly grounded citations.

> **Important Legal Disclaimer:** LegalLens AI provides general informational assistance and document analysis based on user-provided text. It is **not a qualified lawyer and does not provide legal advice**. Important legal matters should always be verified by an attorney licensed in your jurisdiction.

---

## Architecture

```text
       ┌────────────────────────┐
       │   React 18 + Vite UI   │
       │   (Tailwind CSS +      │
       │   Dark/Light System)   │
       └───────────┬────────────┘
                   │
                   ▼ (HTTPS / Bearer Auth)
       ┌────────────────────────┐
       │ Express Node.js Server │
       │ (Rate Limiter, Error   │
       │ Guards, Mutexes)       │
       └─────┬────────────┬─────┘
             │            │
             ▼            ▼
┌──────────────────┐  ┌──────────────────┐
│ Firebase Auth +  │  │ Google Gemini AI │
│ Cloud Storage +  │  │ (Gemini 2.5      │
│ Firestore Subcol │  │ Flash Engine)    │
└──────────────────┘  └──────────────────┘
```

---

## Core Capabilities (Phases 1–9)

1. **Secure User Authentication & Session Isolation**
   - Real Firebase Authentication with JWT token verification.
   - Strict two-user isolation across all database collections, storage buckets, and API endpoints.

2. **Real Document Management & Processing**
   - Multi-format ingestion: PDF, Word (.docx via Mammoth), and Plain Text (.txt).
   - In-browser and server text extraction with page count and word metrics.
   - Dedicated private Storage paths (`users/{userId}/documents/{documentId}/...`).

3. **Document Version Management**
   - Version history tracking with subcollections: `users/{userId}/documents/{documentId}/versions/{versionId}`.
   - Cryptographic SHA-256 content hashing with duplicate version detection.
   - Fallback resilience: Failed version uploads preserve the previous active version intact.

4. **AI-Powered Legal Analysis**
   - Plain-language executive summaries, identified parties, key obligations, critical clauses, and lawyer questions.
   - Version-aware AI records with stale analysis detection and one-click regeneration.

5. **Document-Grounded Q&A Chat**
   - Section-aware chunk retrieval with grounded answers.
   - Active version indicators with scope switching.
   - Source snippet citations and one-click answer copying.

6. **Legal Document & Version Comparison**
   - Deterministic structural diffing combined with Gemini semantic explanations.
   - Compare two different documents OR two different versions of the same document (e.g. Version 1 vs Version 2).
   - Side-by-side diff view and categorized change breakdown.

7. **Legal Insights & Action Center**
   - Automated identification of affirmative duties and milestone deadlines.
   - Relative deadline categorization (`Upcoming`, `Today`, `Passed`, `Trigger-dependent`).
   - Interactive checklist with persistent task status management.

8. **Multi-Document Intelligence & Unified Search**
   - Cross-document conversational AI Q&A across selected documents.
   - Automatic cross-document inconsistency and conflict detection.
   - Library-wide lexical search and clause filters (`Termination`, `Payment`, `Notice`, `Confidentiality`, etc.) with `<mark>` keyword highlighting.

9. **Production Security & Reliability**
   - Sliding-window API rate limiting (30 reqs/min per user).
   - Safe Error ID system (`ERR-XXXXXX`) preventing stack trace or sensitive data leakage.
   - Prompt injection defense using `<untrusted_documents>` sandboxing.
   - Source validation discarding unverified or hallucinated citations.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm or npm
- Firebase Project (Authentication, Firestore, Storage)
- Google Gemini API Key

### Environment Variables
Configure `.env.local`:
```env
PORT=5000
VITE_BACKEND_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation & Development
```bash
# Install dependencies
npm install

# Start Express AI Backend
node --import tsx server/index.ts

# In a separate terminal, start Vite frontend
npm run dev
```

### Security & Tests
Review [SECURITY.md](SECURITY.md) for full authorization policies and run the test suite:
```bash
node scripts/test_phase9.mjs
npm run build
```
