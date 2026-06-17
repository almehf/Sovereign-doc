# منصة موثق – Mawthiq

**Sovereign-Ready Arabic RAG Platform with PDPL-Compliant PII Masking**

<p align="center">
  <img src="https://img.shields.io/badge/Platform-React%2018-blue" alt="React" />
  <img src="https://img.shields.io/badge/Compliance-SDAIA%20%7C%20PDPL-green" alt="Compliance" />
  <img src="https://img.shields.io/badge/Language-Arabic%20%7C%20English-brightgreen" alt="Bilingual" />
  <img src="https://img.shields.io/badge/Deployment-Hybrid%20%7C%20On--Prem-orange" alt="Deployment" />
</p>

---

## 📖 What Is Mawthiq?

Mawthiq (موثق) — Arabic for "trusted" or "verified" — is a **Retrieval-Augmented Generation (RAG) platform** purpose-built for **Saudi enterprises and government organizations** that must comply with the **Personal Data Protection Law (PDPL)** and align with **SDAIA** data governance standards.

In simple terms: **it lets you upload Arabic documents, automatically detects and masks sensitive personal data, then allows your team to search and chat with those documents using AI — all while leaving a complete, immutable audit trail.**

---

## 🎯 Why Mawthiq Exists

| Problem | How Mawthiq Solves It |
|--------|----------------------|
| Saudi organizations handle documents full of national IDs, iqama numbers, phone numbers, and other PII that cannot be exposed to AI models | **Automatic PII detection** with Saudi-specific regex patterns identifies these before anything leaves your environment |
| Most RAG solutions are built for English and fail with Arabic morphology and RTL layout | **Arabic-first design** with Noto Kufi Arabic typography, RTL layout, and bilingual (AR/EN) interface |
| Compliance audits require proof of who did what and when | **Immutable audit log** captures every action — upload, mask, approve, query — with actor identity and timestamp |
| Sensitive data cannot leave the organization's infrastructure | **Bring-your-own-LLM** architecture — connect to your own Ollama, vLLM, or any OpenAI-compatible endpoint running on your private network |
| Different roles need different access levels | **Three-tier role system** — Admin, Compliance Officer, and Standard User — with route-level access control |

---

## 🏗️ How It Works (The Pipeline)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. UPLOAD   │ ─→ │  2. PII MASK │ ─→ │  3. APPROVE  │ ─→ │  4. QUERY    │
│  Document    │    │  Detect &    │    │  Compliance  │    │  Ask the AI  │
│  (PDF/DOCX)  │    │  Redact PII  │    │  Review      │    │  Get Answers │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                           │                    │                    │
                     ┌─────┴─────┐       ┌─────┴─────┐       ┌─────┴─────┐
                     │ Audit Log │       │ Audit Log │       │ Audit Log │
                     │ Entry     │       │ Entry     │       │ Entry     │
                     └───────────┘       └───────────┘       └───────────┘
```

### Step 1 — Upload Documents
An Admin uploads documents (PDF, DOCX, TXT) and assigns them to a **Knowledge Collection** (e.g., "HR Policies", "Legal Contracts"). Collections control which user roles can query which documents.

### Step 2 — Automatic PII Detection & Masking
Immediately upon upload, Mawthiq scans the document text against a set of configurable **PII Rules**:

| Rule | What It Detects | Example Pattern |
|------|----------------|-----------------|
| Saudi National ID | 10-digit ID starting with 1 or 2 | `1062345678` |
| Iqama Number | 10-digit residency number starting with 2 | `2456789012` |
| Saudi Mobile | Phone numbers (`05xxxxxxxx` or `+9665xxxxxxxx`) | `0551234567` |
| Email Address | Any standard email address | `name@example.sa` |
| Arabic Full Name | Names preceded by formal titles (الدكتور, المهندس, etc.) | `الدكتور عبدالله العتيبي` |

Detected PII is **redacted** and replaced with placeholders like `[REDACTED-NATIONAL-ID-001]`. A **PII Report** is generated showing what was found, how many instances, and a masked text preview.

### Step 3 — Compliance Review
A **Compliance Officer** reviews each flagged document. They can:
- **Approve** — PII masking is adequate; the document is indexed and ready for queries
- **Flag** — Needs human review; the document is held back
- **Reject** — Document cannot be processed; removed from the pipeline

Every decision is logged in the **Audit Log** with the reviewer's identity and timestamp.

### Step 4 — Smart Chat (Query)
Once documents are **Indexed** (approved), any authorized user can open the Chat interface, select a knowledge collection, and ask questions in natural Arabic. Mawthiq:
1. Searches relevant documents
2. Sends the (masked) context to your configured LLM
3. Returns an answer **with source citations** showing which document the information came from

---

## 👥 User Roles

| Role | What They Can Do |
|------|-----------------|
| **Admin (مدير النظام)** | Upload documents, create/manage collections, review PII, view audit log, configure LLM/embedding settings, invite/manage users |
| **Compliance Officer (مسؤول الامتثال)** | Review flagged documents (approve/flag/reject), view audit log, chat with indexed documents |
| **User (مستخدم)** | Chat with indexed documents in their allowed collections, view collections |

---

## 🚀 How to Set Up and Use Mawthiq

### Prerequisites
- A running LLM server (Ollama, vLLM, LM Studio, or any OpenAI-compatible endpoint) — must support Arabic
- An embedding model endpoint (for semantic search)
- The Mawthiq application deployed on your infrastructure

### Quick Start (5 Minutes)

#### 1. Configure Your LLM
Navigate to **Settings** (Admin only) and enter:
- **LLM API Endpoint**: Your model server URL (e.g., `http://your-server:11434/api/generate`)
- **LLM Model Name**: The model to use (e.g., `llama-3-arabic`)
- **Embedding API Endpoint**: Your embedding server URL
- **Embedding Model Name**: The embedding model (e.g., `bilingual-embedding-base`)

#### 2. Create a Knowledge Collection
Go to **Collections** → **Create Collection** and define:
- A name in Arabic and/or English
- A description
Click **Save**.

#### 3. Invite Your Team
Go to **Users** → **Invite User** and enter their email address with the appropriate role (Admin, Compliance Officer, or User).

#### 4. Upload Your First Document
Go to **Documents** → **Upload New Document**:
1. Select a file (PDF, DOCX, or TXT)
2. Choose a collection from the dropdown
3. Click **Upload**

The system will:
→ Upload the file
→ Run PII detection automatically
→ Generate a PII report
→ Log the action in the audit trail

#### 5. Review the PII Report
As a **Compliance Officer**, go to **PII Review**:
1. Click on a document with status "PII Detected"
2. Review the PII report — see what was found and the masked preview
3. Click **Approve** (or Flag/Reject)

Approved documents are automatically indexed and ready for queries.

#### 6. Start Chatting with Your Documents
Go to **Chat**:
1. Select a knowledge collection from the dropdown
2. Type your question in Arabic (or English)
3. Receive an AI-generated answer with source citations linking back to your documents

Example queries:
- "ما هي سياسة الإجازات السنوية؟" (What is the annual leave policy?)
- "اذكر شروط المناقصات الحكومية" (List government tender conditions)

#### 7. Monitor with Audit Log
Go to **Audit Log** (Admin or Compliance Officer) to see every action chronologically:
- Who uploaded what document and when
- Every PII detection event
- Every approval, flag, or rejection decision
- Every user query
- Every setting change

Filter by action type, severity (Info/Warning/Critical), or search by user/document name. Export to CSV for compliance reporting.

---

## 🛡️ PDPL / SDAIA Compliance Features

| Requirement | How Mawthiq Handles It |
|------------|----------------------|
| **Data Minimization** | PII is detected and masked automatically before any AI processing |
| **Purpose Limitation** | Collections control which documents are accessible by which roles |
| **Right to Access / Rectify** | Full audit trail shows exactly what data was processed and by whom |
| **Accountability** | Immutable audit log captures every action with identity, timestamp, and severity |
| **Data Sovereignty** | BYO-LLM architecture — your models run on your infrastructure; no data leaves your network |
| **Arabic Language Support** | Full RTL layout, Arabic-first UI, Arabic PII patterns and name detection |

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── Dashboard.jsx        # Overview with stats and quick actions
│   ├── Documents.jsx        # Upload, list, and view documents
│   ├── PIIReview.jsx        # Compliance officer review dashboard
│   ├── Collections.jsx      # Create and manage knowledge collections
│   ├── Chat.jsx             # AI chat interface with source citations
│   ├── AuditLog.jsx         # Immutable audit trail with filters
│   ├── Settings.jsx         # LLM/embedding endpoint configuration
│   └── Users.jsx            # User management and invitations
├── components/
│   ├── Layout.jsx           # App shell with sidebar navigation
│   ├── LanguageToggle.jsx   # AR/EN language switcher
│   ├── ProtectedByRole.jsx  # Role-based route guard
│   ├── StatusBadge.jsx      # Status pill component
│   ├── documents/
│   │   ├── DocumentCard.jsx    # Document list item card
│   │   └── DocumentUpload.jsx  # Upload widget with PII scanning
│   ├── pii/
│   │   └── PIIReport.jsx       # PII detection report viewer
│   ├── chat/
│   │   ├── ChatInput.jsx       # Chat input with auto-resize
│   │   ├── ChatMessage.jsx     # Message bubble with markdown
│   │   └── SourceCitation.jsx  # Source document citation
│   └── audit/
│       └── AuditTimeline.jsx   # Visual audit event timeline
└── entities/
    ├── Document.json           # Document entity schema
    ├── Collection.json         # Collection entity schema
    ├── AuditLog.json           # Audit log entity schema
    ├── PIIRule.json            # PII detection rule schema
    └── OrganizationSettings.json # System settings schema
```

---

## 🔧 Configuration Reference

### PII Rules (Detectors)

PII rules are defined as entities and can be managed through the database. Each rule has:

| Field | Description |
|-------|-------------|
| `name` | English display name |
| `name_ar` | Arabic display name |
| `pattern_type` | Detection method: `regex`, `keyword`, or `heuristic` |
| `pattern_value` | The regex pattern or keyword list |
| `pii_category` | Type of PII: `national_id`, `iqama`, `phone`, `email`, `full_name`, `address`, `dob`, `bank_account`, `passport`, `other` |
| `priority` | Importance: `low`, `medium`, `high`, `critical` |
| `is_active` | Enable or disable the rule |

### LLM & Embedding Settings

| Setting Key | Description |
|------------|-------------|
| `llm_endpoint` | Full URL of your LLM API (must be OpenAI-compatible format) |
| `llm_model` | Model identifier string |
| `embedding_endpoint` | Full URL of your embedding API |
| `embedding_model` | Embedding model identifier string |
| `default_language` | Default UI language: `ar` or `en` |

---

## 🌐 Supported Document Formats

- **PDF** (.pdf)
- **Word Documents** (.docx)
- **Plain Text** (.txt)

---

## 📝 License

Built for Saudi enterprise and government use. All rights reserved.

---

**Mawthiq** | Designed for SDAIA & PDPL Compliance | Arabic-First, Sovereign-Ready