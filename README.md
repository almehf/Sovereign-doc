# SovereignDoc KSA 🇸🇦

[![Market Standard](https://img.shields.io/badge/Market--Standard-Production--Ready-blue.svg)](#)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF?logo=vite)](#)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwind-css)](#)
[![Shadcn UI](https://img.shields.io/badge/UI%20Components-Shadcn%20UI-000000?logo=shadcnui)](#)

**SovereignDoc KSA** is an enterprise-grade, sovereign document management and data privacy compliance application. Built intentionally to address strict data residency rules, national governance, and privacy frameworks, the platform enables organizations to securely handle documentation, review Personally Identifiable Information (PII) violations, inspect audit trails, and engage with a secured internal document assistant.

---

## 🚀 Key Features

- **Sovereign Document Management:** Secure file processing, storage categorization, and organizational mapping decoupled from standard public clouds.
- **PII Inspection & Review Engine:** Automate the detection and masking of sensitive local variables, ensuring compliance with Saudi Arabia's data security frameworks (PDPL/NDMO guidelines).
- **Contextual AI Document Chat:** Interact directly with uploaded compliance corpora via an insulated, secure chat environment featuring inline source citations.
- **Immutability Logs & Timeline:** Comprehensive chronological audit log visualization to monitor user activity, file modifications, and permission shifts.
- **Dual Language Optimization:** Seamless English/Arabic UI toggling (`LanguageToggle`) designed for domestic operational compliance.
- **Granular RBAC Security:** Role-based access constraints built over protected view layouts to guarantee data silo boundaries.

---

## 🛠️ Architecture & Tech Stack

The workspace is split clearly between dynamic application routes and a zero-trust governance schema directory (`base`).

```text
sovereign-doc-ksa/
├── base/                    # Data Entity Definitions & Local Governance Specs
│   ├── entities/            # Schemas for Documents, Users, AuditLogs, Collections & PII Rules
│   └── config.jsonc         # Engine Configuration Matrices
├── src/
│   ├── api/                 # Integrated API Layer (baseClient)
│   ├── components/
│   │   ├── audit/           # Audit Timeline visualizations
│   │   ├── chat/            # Chat Input, Messages, and Source Citations
│   │   ├── documents/       # File Upload, Document cards
│   │   ├── pii/             # PII Reports & Violation panels
│   │   └── ui/              # Decoupled design components built over Radix UI primitives
│   ├── hooks/               # Optimized runtime React state abstractions
│   ├── lib/                 # AuthContext engines, Query client config, utility parsers
│   └── pages/               # Functional views (Dashboard, PIIReview, Collections, Settings, etc.)
```

### Core Technologies Used

- **Framework:** React (Vite-bundler runtime)
- **State Management & Data Fetching:** TanStack Query (`@tanstack/react-query`)
- **Styling & UI:** Tailwind CSS + Shadcn UI components (Radix primitives)
- **Icons & Components:** Lucide React icons, customized Google assets
- **Linting & Quality:** ESLint Flat Config style

---

## 📦 Getting Started

### Prerequisites

Ensure you have **Node.js (v18+)** and **npm** (or **pnpm**) installed on your server environment.

### Installation

**1. Clone the repository** into your local or air-gapped server environment:

```bash
git clone https://github.com/almehf/Sovereign-doc.git
cd Sovereign-doc
```

**2. Install runtime dependencies:**

```bash
npm install
```

**3. Set up environment variables.** Create a local environment profile:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` manually with the following values:

```bash
VITE_BASE_APP_ID=your_app_id
VITE_BASE_APP_BASE_URL=your_backend_url
VITE_BASE_FUNCTIONS_VERSION=your_functions_version
```

Example:

```bash
VITE_BASE_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE_APP_BASE_URL=https://your-app.base.app
```

Modify these variables to attach to your corresponding **base** data streaming targets.

### Development Server

Launch the hot-reloading development UI instance:

```bash
npm run dev
```

### Production Compiling

Compile and optimize the build distribution for secure internal proxy hosting:

```bash
npm run build
```

Preview build assets locally:

```bash
npm run preview
```

### Quality Checks

```bash
npm run lint
npm run typecheck
```

---

## 🔒 Governance & Regulatory Alignment

SovereignDoc KSA includes automated validation maps mimicking strict administrative directives:

- **`entities/PIIRule.jsonc`:** Predefined matching maps checking for local identification IDs, phone vectors, and confidential financial metrics.
- **`entities/AuditLog.jsonc`:** Structuring tamper-evident access records tracking actions like `FileUploaded`, `PIIMasked`, or `AuthFailure`.

---

## 📄 License

Private — internal use only unless otherwise specified by your organization.
