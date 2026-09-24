# LegalLens AI — Security Policy & Architecture

## Overview
LegalLens AI is an artificial intelligence-assisted legal document understanding and information platform designed around strict data isolation, zero cross-user leakage, and defensive GenAI engineering.

This document details the security model, authorization controls, operational boundaries, and vulnerability reporting procedures.

---

## 1. Authentication & Identity Management
- **Provider**: Firebase Authentication.
- **Tokens**: JSON Web Tokens (JWT) minted by Firebase with verifiable RSA signatures.
- **Backend Authorization**: All `/api/*` endpoints (except `/api/health`) require a valid `Authorization: Bearer <token>` header verified via `authMiddleware`.
- **Claim Verification**: `userId` is authoritatively resolved from token claims (`user_id` / `sub`), never trusted from client request bodies or query parameters.

---

## 2. Authorization & Database Security (Firestore)
- **Deny-by-Default**: Global rules reject all read and write requests unless explicitly granted.
- **User-Isolated Storage Paths**:
  - Documents: `/users/{userId}/documents/{documentId}`
  - Versions: `/users/{userId}/documents/{documentId}/versions/{versionId}`
  - Analyses: `/users/{userId}/documents/{documentId}/analyses/{analysisId}`
  - Conversations: `/users/{userId}/documents/{documentId}/conversations/{conversationId}`
  - Messages: `/users/{userId}/documents/{documentId}/conversations/{conversationId}/messages/{messageId}`
  - Insights: `/users/{userId}/documents/{documentId}/insights/{insightId}`
  - Checklist Items: `/users/{userId}/documents/{documentId}/checklistItems/{itemId}`
  - Comparisons: `/users/{userId}/comparisons/{comparisonId}`
  - Unified Conversations: `/users/{userId}/unifiedConversations/{conversationId}`
- **Security Rule Invariant**: Every rule enforces `request.auth.uid == userId` and `request.resource.data.userId == userId`. User A can never read, modify, or delete records belonging to User B.

---

## 3. Storage Security (Firebase Cloud Storage)
- **Access Control**: Storage buckets are private; public read and write access is disabled.
- **Isolated Paths**:
  - Legacy path: `/users/{userId}/documents/{documentId}/{fileName}`
  - Versioned path: `/users/{userId}/documents/{documentId}/versions/{versionId}/{fileName}`
- **Input Validation Rules**:
  - File size strictly capped at 25MB per upload.
  - MIME type verification allows only PDF (`application/pdf`), Word (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`), and Plain Text (`text/plain`).
  - Strict user namespace match: `request.auth.uid == userId`.

---

## 4. API Security & Rate Limiting
- **Rate Limiting**: Sliding-window rate limiter middleware (`aiRateLimiter`) caps requests per authenticated user/IP to 30 requests per minute to prevent model abuse and denial of service.
- **Active Job Locks (Mutexes)**: In-memory mutexes prevent concurrent duplicate requests for the same document and version.
- **Safe Error Handling**: The server generates safe, opaque Error Reference IDs (e.g. `ERR-XXXXXX`). Internal stack traces and file paths are logged server-side and never returned to clients.
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. Secret Management
- **Client-Side Safety**: `GEMINI_API_KEY` is strictly confined to the backend environment (`.env.local` or secure environment variables). It is never referenced in frontend code, Vite bundles, or client storage.
- **Repository Safety**: `.env`, `.env.local`, and service account keys are ignored via `.gitignore`.

---

## 6. Defensive AI & Prompt Injection Protection
- **Untrusted Document Sandboxing**: All user-extracted text is wrapped in defensive delimiter tags (`<untrusted_documents>` / `<user_document>`).
- **Anti-Override Directives**: System prompts explicitly instruct Gemini that text within document tags is passive data that must never be interpreted as commands or override system instructions.
- **Source Citation Validation**: Server-side checks verify that any citations returned by the model actually exist in the retrieved document context chunks. Citations pointing to unauthorized document IDs are stripped.
- **Neutral Tone & Non-Verdict Language**: The model is prompted to avoid definitive judicial declarations or declaring which contract controls in a dispute.

---

## 7. Data Privacy & Retention
- **Retention**: Document data, versions, and generated analyses are retained only for the user's account until explicitly deleted.
- **Cascading Deletion**: Deleting a document removes all physical files from Cloud Storage across all versions and cascades deletion through Firestore subcollections.
- **Sanitized Logging**: Server logs record operational metadata (document IDs, timestamps, character counts) and explicitly omit raw document text, private contract terms, and full LLM prompts.

---

## 8. Responsible Disclosure
If you discover a security vulnerability or potential data isolation flaw in LegalLens AI:
1. Please do not create a public GitHub issue.
2. Email security details directly to the engineering team.
3. Include reproduction steps, environment details, and expected vs observed behavior.
