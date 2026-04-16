# GLS CRM — Project Overview

**Version:** 1.1
**Last Updated:** 2026-04-16
**Status:** Active Development

---

## 1. Project Summary

### What This Project Does

**GLS CRM** (Global Leaders Skills) is a comprehensive, enterprise-grade Customer Relationship Management system designed specifically for leadership schools operating educational programs in Poland and Ukraine. The platform automates complex financial workflows, manages student lifecycles, handles staff salary calculations, and provides recruitment and administrative tools.

### Purpose and Goals

- **Automate Financial Operations**: Eliminate manual calculations for subscriptions, payments, refunds, and invoicing
- **Teacher Salary Automation**: Complex piecework salary calculations with bonuses, retention logic, and trial lesson conversion tracking
- **Student Lifecycle Management**: Track students from lead → trial → active → paused/expelled → re-enrollment
- **Multi-School Support**: Manage multiple educational programs (Space Memory, Speedy Mind Indigo, Olympiad) from a single interface
- **Compliance Ready**: Support for Polish fiscal requirements (KSeF electronic invoicing system)
- **Multilingual**: Full support for Polish, English, Russian, and Ukrainian

### Core Business Model

The system manages educational programs with:
- Monthly subscription payments (490-990 PLN/month)
- Trial lessons with conversion tracking (≥51% threshold for teacher payout)
- Group-based learning (10-16 students per group)
- Individual coaching programs
- Teacher compensation based on: subscriptions (11% rate), substitutions, methodical work, bonuses, and administrative duties (3% with QA evaluation)

---

## 2. Tech Stack

### Frontend Core
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue 3** | 3.5.12 | UI framework (Composition API with `<script setup lang="ts">`) |
| **Vite** | 7.3.1 | Build tool and dev server |
| **TypeScript** | 5.6.3 | Type safety and developer experience |
| **Pinia** | 2.2.2 | State management (Setup Store pattern) |
| **Vue Router** | 4.4.5 | Client-side routing |
| **Vue I18n** | 9.14.1 | Internationalization (PL/EN/RU/UK) |

### HTTP & API
| Technology | Purpose |
|------------|---------|
| **Axios** | 1.7.7 - HTTP client with custom adapter routing |
| **Mock Adapter** | Custom implementation for offline development |

### Utilities & Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework (configured) |
| **Custom CSS** | "Pixel-Perfect" design system with CSS modules |
| **Lucide Icons** | Icon system (referenced in components) |
| **XLSX** | 0.18.5 - Excel export functionality |

### Development Tools
| Tool | Purpose |
|------|---------|
| **cross-env** | Cross-platform environment variables |
| **rimraf** | Clean build artifacts |
| **rollup-plugin-visualizer** | Bundle size analysis |

### Typography
- **Outfit**: Headings and UI elements
- **Space Mono**: Numbers, analytics, and data displays

---

## 3. Project Structure

```
space_memory_adm/
│
├── .agents/                    # AI agent workflows and rules
│   ├── workflows/              # Task automation templates
│   └── rules/                  # Project-specific coding standards
│
├── .claude/                    # Claude Code configuration
│
├── docs/                       # Comprehensive documentation (17 files, 12000+ lines)
│   ├── DOCUMENTATION_MAP.md    # Navigation guide for all docs
│   ├── API_ALL.md             # Complete API reference (43+ methods)
│   ├── PAYMENTS_*.md          # Payment system documentation (7 files)
│   ├── GROUPS_*.md            # Group management docs
│   └── READY_TO_USE.md        # Quick start guide
│
├── public/                     # Static assets
│   ├── favicon.svg
│   └── .htaccess              # Apache configuration
│
├── src/
│   ├── api/                   # HTTP client and API layer
│   │   ├── http.ts            # Axios instance with interceptors
│   │   ├── mockAdapter.ts     # Mock API for offline development
│   │   ├── mockDb.ts          # Mock database (student/payment data)
│   │   ├── mockNewGroupsDb.ts # Mock data for groups
│   │   ├── endpoints.ts       # API endpoint constants
│   │   ├── authApi.ts         # Authentication endpoints
│   │   ├── studentApi.ts      # Student CRUD operations
│   │   ├── paymentsApi.ts     # Payment operations (14 methods)
│   │   ├── salaryApi.ts       # Teacher salary calculations
│   │   ├── settingsApi.ts     # System settings
│   │   ├── dashboardApi.ts    # Dashboard metrics
│   │   ├── newGroupsApi.ts    # Group creation & management
│   │   ├── expelledStudentsApi.ts  # Expelled student tracking
│   │   ├── recruitmentApi.ts  # Recruitment & leads
│   │   └── users.api.ts       # User management
│   │
│   ├── app/                   # Application core
│   │   ├── main.ts            # App bootstrap
│   │   ├── App.vue            # Root component
│   │   ├── router.ts          # Route definitions (50+ routes)
│   │   ├── i18n.ts            # I18n configuration
│   │   └── preloadRoutes.ts   # Route preloading optimization
│   │
│   ├── components/            # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   │   ├── AppSidebar.vue      # Main navigation
│   │   │   └── AppTopbar.vue       # Header with user menu
│   │   ├── ui/                # Base UI components
│   │   │   ├── UiButton.vue
│   │   │   ├── UiInput.vue
│   │   │   ├── UiBadge.vue
│   │   │   └── ToastContainer.vue  # Notification system
│   │   ├── students/          # Student-specific components
│   │   │   └── StudentPaymentsTab.vue
│   │   └── projects/          # Project components
│   │       ├── ProjectCard.vue
│   │       ├── ProjectModal.vue
│   │       └── FirmaSelector.vue
│   │
│   ├── layouts/               # Page layouts
│   │   ├── AppLayout.vue      # Main authenticated layout
│   │   └── AuthLayout.vue     # Login/auth layout
│   │
│   ├── locales/               # Translation files
│   │   ├── en.json            # English
│   │   ├── pl.json            # Polish
│   │   ├── ru.json            # Russian
│   │   └── uk.json            # Ukrainian
│   │
│   ├── modals/                # Global modal system
│   │   └── templates/         # Modal templates
│   │
│   ├── stores/                # Pinia state stores (26 stores)
│   │   ├── app.store.ts            # Global app state, loading indicators
│   │   ├── auth.store.ts           # Authentication & user session
│   │   ├── modal.store.ts          # Modal management
│   │   ├── notification.store.ts   # Toast notifications
│   │   ├── theme.store.ts          # Theme preferences
│   │   ├── dashboard.store.ts      # Dashboard data
│   │   ├── studentsList.store.ts   # Student list with filters
│   │   ├── studentTabs.store.ts    # Student profile tabs
│   │   ├── studentPayments.store.ts # Payment operations
│   │   ├── payments.store.ts       # Payment modals & actions
│   │   ├── salaryCalculator.store.ts # Accountant salary view
│   │   ├── teacherSalary.store.ts  # Teacher salary view
│   │   ├── projects.store.ts       # Project management
│   │   ├── companies.store.ts      # Company/school entities
│   │   ├── expelledStudents.store.ts # Expelled student tracking
│   │   ├── newStudents.store.ts    # Recruitment - new students
│   │   ├── leads.store.ts          # Sales leads
│   │   ├── zwroty.store.ts         # Refunds management
│   │   ├── settings*.store.ts      # Finance settings (8 stores)
│   │   └── ...
│   │
│   ├── styles/                # Global styles
│   │   └── main.css           # Tailwind imports + custom CSS
│   │
│   ├── types/                 # TypeScript definitions
│   │   ├── api-mapping.ts     # API ↔ MockDB mappings
│   │   ├── projects.ts        # Project/program types
│   │   └── settings.ts        # Settings types
│   │
│   ├── utils/                 # Utility functions
│   │
│   └── views/                 # Page components
│       ├── auth/              # Authentication
│       │   └── SignInPage.vue
│       ├── dashboard/         # Dashboard
│       │   └── DashboardIndex.vue
│       ├── students/          # Student management
│       │   ├── StudentListPage.vue
│       │   ├── StudentProfilePage.vue
│       │   └── components/
│       │       ├── StudentProfileHeader.vue
│       │       └── profile-tabs/
│       │           ├── PaymentsTab.vue      # Payment calendar & actions
│       │           ├── GroupsTab.vue        # Student groups
│       │           ├── InfoTab.vue          # Personal info
│       │           ├── AttendanceTab.vue    # Lesson attendance
│       │           ├── ProgressTab.vue      # Learning progress
│       │           └── NotesTab.vue         # Comments & tasks
│       ├── recruitment/       # Recruitment module
│       │   ├── NewStudentsPage.vue     # Trial students
│       │   ├── LeadsPage.vue           # Sales pipeline
│       │   ├── ExpelledStudentsPage.vue # Re-enrollment tracking
│       │   └── components/
│       ├── groups/            # Group management
│       │   ├── NewGroupsPage.vue
│       │   └── components/
│       ├── finance/           # Financial operations
│       │   ├── ZwrotyView.vue          # Refunds
│       │   ├── SalaryCalculatorView.vue # Accountant view
│       │   └── settings/
│       │       ├── SettingsIndex.vue
│       │       └── components/         # 9 setting panels
│       ├── teacher/           # Teacher portal
│       │   ├── TeacherSalaryPage.vue
│       │   └── components/
│       │       ├── SalarySummaryGrid.vue
│       │       ├── SalarySection.vue
│       │       └── sections/
│       └── projects/          # Project management
│           ├── ProjectsListPage.vue
│           └── ProjectDetailView.vue
│
├── .env.example               # Environment variables template
├── .gitignore
├── index.html                 # HTML entry point
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite configuration
│
└── Documentation Files (root)
    ├── README.md              # Main project README
    ├── API_MAPPING.md         # API ↔ Database field mappings
    ├── Sallery_API.md         # Salary API specification
    ├── SERVER_API.md          # Server endpoint documentation
    ├── STUDENT_ID_GUIDE.md    # Student ID system explanation
    ├── SECURITY.md            # Security guidelines
    └── QUICK_START.md         # Quick start guide
```

---

## 4. Key Components

### 4.1 Core Application (`src/app/`)

**[main.ts](src/app/main.ts)**
- Application bootstrap
- Initializes Vue app, Pinia, Router, I18n
- Mounts app to `#app`

**[router.ts](src/app/router.ts)** (157 lines)
- Defines 50+ routes across 9 modules
- Route guards for authentication (`beforeEach`)
- Meta data for sidebar icons and titles
- Lazy loading for all page components

**[i18n.ts](src/app/i18n.ts)**
- Vue I18n configuration
- Loads 4 language files (EN/PL/RU/UK)
- Locale switching logic

### 4.2 API Layer (`src/api/`)

**[http.ts](src/api/http.ts)** (146 lines)
- **Primary HTTP Client**: Creates two Axios instances (`http`, `httpRecruitment`)
- **Smart Adapter Routing**: Routes requests to mock or real API based on environment config
- **Request Interceptor**: Attaches JWT token from localStorage, starts global loading indicator
- **Response Interceptor**: Ends loading, handles 401 logout, timeout error messages
- **Configuration**: Reads `VITE_USE_MOCK`, `VITE_API_URL`, `VITE_MOCK_ONLY`, `VITE_REAL_ONLY` from env

**[mockAdapter.ts](src/api/mockAdapter.ts)** (1006 lines)
- **Purpose**: Offline development without backend dependency
- **Implements**: 50+ mock endpoints matching real API
- **Features**:
  - Mock database in globalThis for stateful interactions
  - Realistic latency (240ms delay)
  - Full CRUD operations for students, payments, groups, salary
  - Auto-generates student data for any ID
  - Supports all payment operations (refund, pause, discount, etc.)
- **Endpoints**: Auth, payments, students, groups, settings, salary, recruitment, expelled students

**[mockDb.ts](src/api/mockDb.ts)**
- Mock student profiles and payment programs
- Transaction history data
- KSeF invoice data
- Group enrollment data

**API Modules** (8 files):
- `authApi.ts`: Sign-in, JWT refresh
- `studentApi.ts`: Student CRUD, filters
- `paymentsApi.ts`: 14 payment operations (refund, pause, discount, tariff change, etc.)
- `salaryApi.ts`: Teacher salary calculation, confirm/dispute
- `settingsApi.ts`: Finance settings (companies, accounts, templates, users)
- `dashboardApi.ts`: Dashboard metrics
- `newGroupsApi.ts`: Group creation, student assignment
- `expelledStudentsApi.ts`: Re-enrollment tracking

### 4.3 State Management (`src/stores/`)

**26 Pinia Stores** following Setup Store pattern:

**Core Stores:**
- **app.store.ts**: Global loading state (`startRequest()`, `endRequest()`), active requests counter
- **auth.store.ts**: User session, JWT token, login/logout, user profile
- **modal.store.ts**: Global modal system, open/close modal by name
- **notification.store.ts**: Toast notifications (success/error/info)
- **theme.store.ts**: Dark/light mode preferences

**Student Management:**
- **studentsList.store.ts**: Paginated student list, filters (group, teacher, search)
- **studentTabs.store.ts**: Active tab tracking in student profile
- **studentPayments.store.ts**: Payment operations, dictionaries, calendar data

**Finance:**
- **payments.store.ts**: Payment modals (pause, discount, refund, etc.), action handlers
- **salaryCalculator.store.ts**: Accountant view, salary status updates (draft/confirmed/paid)
- **teacherSalary.store.ts**: Teacher portal, salary confirmation/dispute
- **zwroty.store.ts**: Refund management

**Settings (8 stores):**
- `settingsFirmy.store.ts`, `settingsKonta.store.ts`, `settingsSzablony.store.ts`, `settingsSerie.store.ts`, `settingsProjekty.store.ts`, `settingsVat.store.ts`, `settingsUsers.store.ts`, `settingsIntegrations.store.ts`, `settingsExport.store.ts`

**Other:**
- **projects.store.ts**: Educational program management
- **companies.store.ts**: School entities
- **dashboard.store.ts**: Dashboard widgets
- **expelledStudents.store.ts**: Re-enrollment pipeline
- **newStudents.store.ts**, **leads.store.ts**: Recruitment funnel

### 4.4 Views & Pages

**Payment System** (`src/views/students/components/profile-tabs/`)
- **PaymentsTab.vue**: Main container with program selector
- **PaymentBalance.vue**: Total balance, next payment info
- **PaymentPrograms.vue**: Program list with 24-month payment calendar
- **PaymentMonthDetail.vue**: Modal showing month breakdown (invoice, KSeF status, lessons)
- **PaymentActions.vue**: Action buttons (pause, discount, refund, etc.)
- **PaymentTransactions.vue**: Transaction history

**Teacher Salary** (`src/views/teacher/`)
- **TeacherSalaryPage.vue**: Teacher portal for salary review
- **SalarySummaryGrid.vue**: Total salary breakdown
- **SalarySection.vue**: Generic section component
- **sections/SubscriptionsSection.vue**: Subscription-based earnings
- **sections/AdminDutySection.vue**: 3% admin duty with QA checklist
- **sections/TrialLessonSection.vue**: Trial lesson conversion logic

**Finance Settings** (`src/views/finance/settings/components/`)
- 9 panel components for different settings categories
- 7 modal components for editing

**Recruitment** (`src/views/recruitment/`)
- **NewStudentsPage.vue**: Trial students tracking
- **LeadsPage.vue**: Sales pipeline
- **ExpelledStudentsPage.vue**: Re-enrollment dashboard with history panel

### 4.5 Component Library

**Layout Components:**
- **AppSidebar.vue**: Left sidebar with collapsible navigation, role-based menu items
- **AppTopbar.vue**: Top header with search, notifications, user menu

**UI Components:**
- **UiButton.vue**: Primary button component
- **UiInput.vue**: Text input with validation
- **UiBadge.vue**: Status badges
- **ToastContainer.vue**: Notification system

---

## 5. Data Flow

### Typical Request Flow

```
User Action (Click Button)
    ↓
Vue Component (emit event)
    ↓
Pinia Store (action called)
    ↓
API Module (HTTP request)
    ↓
http.ts Interceptor (add auth, start loading)
    ↓
Adapter Router (mock vs real API decision)
    ↓ ↙                          ↓ ↘
mockAdapter.ts              Real Backend API
(offline dev)               (production)
    ↓                              ↓
Return Response ←──────────────────┘
    ↓
http.ts Interceptor (end loading, handle errors)
    ↓
Store (update state)
    ↓
Component (reactive UI update)
```

### Payment Operation Example

1. **User** clicks "Apply Pause" in `PaymentActions.vue`
2. **Component** calls `modal.store.openModal('pause', { programId })`
3. **Modal** component (`PauseModal.vue`) opens
4. **User** fills form (date range, reason)
5. **Modal** calls `payments.store.applyPause({ programId, from, to, reason })`
6. **Store** calls `paymentsApi.applyPause(payload)`
7. **API** sends `POST /api/v1/payments/pause`
8. **Backend/Mock** processes request, returns success
9. **Store** shows success notification, reloads student data
10. **UI** updates to show new pause status in calendar

### Salary Calculation Flow

1. **Teacher** navigates to `/teacher/salary`
2. **TeacherSalaryPage.vue** mounts, reads `teacherId` from auth store
3. **Component** calls `teacherSalary.store.loadSalary({ teacherId, month, projectId })`
4. **Store** calls `salaryApi.getTeacherSalary(teacherId, { month, project_id })`
5. **API** sends `GET /api/v1/salary/teacher/{id}?month=2026-02&project_id=1`
6. **Backend** calculates:
   - Subscriptions (11% of base)
   - Substitutions
   - Methodical work
   - Individual lessons
   - Olympiad
   - Admin 3% (with QA score)
   - Bonuses
   - Trial lessons (≥51% conversion threshold)
7. **Response** returns detailed breakdown
8. **Store** processes data, calculates totals
9. **Component** displays in structured sections
10. **Teacher** can confirm or dispute

---

## 6. APIs & Interfaces

### 6.1 Backend API Integration

**Base URL**: `https://memory.firm.kiev.ua/api/v1/`
**Authentication**: JWT Bearer token in `Authorization` header
**Laravel Backend**: `space_memory-php8` (separate repository)

### 6.2 Data Naming Conventions

The project maintains a strict separation between Backend and Frontend naming styles:

| Layer | Style | Source of Truth |
|-------|-------|-----------------|
| **Backend (DB/API)** | `snake_case` | PostgreSQL fields, Raw JSON responses |
| **Frontend (Store/UI)** | `camelCase` | Pinia models, Props, Local state |

**Mapping Strategy**:
- Data from API is normalized in Pinia stores using ternary checks:
  `studentsCount: item.students_count ?? item.studentsCount ?? 0`
- API Parameters for POST/PATCH usually follow the backend `snake_case` (e.g., `per_page`, `group_id`).
- See [AGENTS.md](file:///Users/artsiomhrableuski/GLS_SPACE_ADMIN/space_memory_adm/AGENTS.md) for detailed rules.


### 6.3 API Endpoints (43+ methods across 8 modules)


#### Authentication
```
POST /api/v1/auth/sign-in
GET  /api/v1/auth/me
```

#### Students
```
GET  /api/v1/students                      # Paginated list
GET  /api/v1/payments/student/{id}         # Student profile + programs
GET  /api/v1/students/{id}/projects        # Program list only
GET  /api/v1/students/{id}/projects/{id}/calendar  # Payment calendar
GET  /api/v1/students/{id}/projects/{id}/transactions  # Transactions
GET  /api/v1/student/groups                # Student groups
GET  /api/v1/student/info                  # Personal info
GET  /api/v1/student/attendance            # Attendance records
GET  /api/v1/student/progress              # Learning progress
GET  /api/v1/student/notes                 # Notes & tasks
POST /api/v1/student/notes                 # Create note
PATCH /api/v1/student/notes/{id}           # Update note
DELETE /api/v1/student/notes/{id}          # Delete note
```

#### Payments (14 operations)
```
POST /api/v1/payments/refund               # Issue refund
POST /api/v1/payments/invoice              # Edit invoice
POST /api/v1/payments/correction           # Balance correction
POST /api/v1/payments/tariff               # Change tariff
POST /api/v1/payments/pause                # Apply pause
POST /api/v1/payments/discount             # Apply discount
POST /api/v1/payments/extra                # Add extra charge
POST /api/v1/payments/unlock               # Unlock program
POST /api/v1/payments/split                # Split group (change group)
POST /api/v1/payments/archive              # Archive program
POST /api/v1/payments/resume               # Resume from pause
```

#### Dictionaries
```
GET /api/v1/dictionaries/pause-reasons
GET /api/v1/dictionaries/payment-methods
GET /api/v1/dictionaries/discount-types
GET /api/v1/dictionaries/refund-reasons
GET /api/v1/dictionaries/tariffs
```

#### Salary
```
GET  /api/v1/salary/teacher/{id}           # Get salary calculation
POST /api/v1/salary/{id}/confirm           # Confirm salary
POST /api/v1/salary/{id}/dispute           # Dispute salary
```

#### Groups
```
GET  /api/v1/new-groups                    # List new groups
POST /api/v1/new-groups/create             # Create group
POST /api/v1/new-groups/start              # Start group
POST /api/v1/new-groups/delete             # Delete group
POST /api/v1/new-groups/add-students       # Add students to group
POST /api/v1/new-groups/remove-student     # Remove student
GET  /api/v1/new-groups/students           # Get group students
GET  /api/v1/new-groups/master-students    # Get master student list
GET  /api/v1/new-groups/teachers           # Get teacher list
```

#### Recruitment
```
GET  /api/v1/expelled-students             # List expelled students
PATCH /api/v1/expelled-students/{id}       # Update student
POST /api/v1/expelled-students/{id}/archive # Archive student
POST /api/v1/expelled-students/{id}/transfer # Transfer to group
POST /api/v1/expelled-students/bulk-assign  # Bulk assign manager
POST /api/v1/expelled-students/bulk-archive # Bulk archive

GET  /api/v1/recruitment/new-students      # Trial students
POST /api/v1/recruitment/new-students      # Create trial student
POST /api/v1/recruitment/new-students/{id}/archive

GET  /api/v1/recruitment/leads             # Sales leads
POST /api/v1/recruitment/leads             # Create lead
PATCH /api/v1/recruitment/leads/{id}       # Update lead
```

#### Settings
```
GET  /api/v1/settings/users                # User list
PATCH /api/v1/settings/users/{id}          # Update user
DELETE /api/v1/settings/users/{id}         # Delete user

#### Access Control (NEW)
```
GET   /api/v1/gls/me/access-control        # Get current user permission matrix
GET   /api/v1/gls/settings/access-control  # Manage role-resource matrix
```
```

### 6.3 External Services

**Planned Integrations:**
- **iMoje**: Payment gateway (Phase 4)
- **KSeF**: Polish electronic invoicing system (Phase 5)

---

## 7. Configuration

### 7.1 Environment Variables

**File**: `.env.local` (not committed, see `.env.example`)

```bash
# API Configuration
VITE_USE_MOCK=false                          # true = use mock adapter, false = real API
VITE_API_URL=https://memory.firm.kiev.ua/api/v1/
VITE_RECRUITMENT_API_URL=https://memory.firm.kiev.ua/api/v1/

# Mixed Mode (optional)
VITE_MOCK_ONLY=                              # Comma-separated prefixes to force mock
VITE_REAL_ONLY=                              # Comma-separated prefixes to force real API
```

**Usage Examples:**
```bash
# Development with mock API
npm run dev:mock

# Development with real API
npm run dev:api

# Or manually
VITE_USE_MOCK=true npm run dev
```

### 7.2 Vite Configuration

**File**: `vite.config.ts`

- **Port**: 5173
- **Proxy**: `/api/v1` → `http://localhost:3000` (for local backend testing)
- **Code Splitting**: Manual chunks for vendor libraries (router/pinia, i18n, axios)
- **Bundle Analysis**: `npm run analyze` generates `dist/stats.html`
- **Custom Plugin**: Copies `.htaccess` to dist for Apache deployments

### 7.3 TypeScript Configuration

**Files**: `tsconfig.json`, `tsconfig.node.json`

- Target: ESNext
- Module: ESNext
- Strict mode enabled
- Path aliases configured (if any)

### 7.4 Tailwind Configuration

**File**: `tailwind.config.js`

- Custom color palette
- Typography settings
- Extended spacing/sizing

---

## 8. Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **axios** | 1.7.7 | HTTP client for API requests |
| **pinia** | 2.2.2 | State management (Vuex successor) |
| **vue** | 3.5.12 | Core UI framework |
| **vue-i18n** | 9.14.1 | Internationalization (4 languages) |
| **vue-router** | 4.4.5 | Client-side routing |
| **xlsx** | 0.18.5 | Excel export for reports |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **@types/node** | 25.3.5 | Node.js type definitions |
| **@vitejs/plugin-vue** | 5.1.4 | Vue 3 support for Vite |
| **cross-env** | 7.0.3 | Cross-platform env variables |
| **rimraf** | 5.0.10 | Clean dist folder |
| **rollup-plugin-visualizer** | 5.12.0 | Bundle size analysis |
| **typescript** | 5.6.3 | TypeScript compiler |
| **vite** | 7.3.1 | Build tool and dev server |

### Why These Dependencies?

- **Axios**: Flexible HTTP client with interceptors for auth/loading
- **Pinia**: Modern, TypeScript-friendly state management
- **Vue 3**: Composition API provides better code organization and TypeScript support
- **Vue I18n**: Required for multi-language support (4 languages)
- **XLSX**: Business requirement for exporting financial reports
- **Vite**: Fast HMR, optimized production builds

---

## 9. Current State

### ✅ Fully Implemented Features

#### Student Management
- ✅ Student list with pagination, search, filters (group, teacher)
- ✅ Student profile with 6 tabs (Payments, Groups, Info, Attendance, Progress, Notes)
- ✅ Full payment calendar (24-month view)
- ✅ Payment operations (14 methods): pause, discount, refund, tariff change, etc.
- ✅ Transaction history
- ✅ KSeF invoice tracking
- ✅ Balance correction system
- ✅ Group enrollment management

#### Teacher Salary System
- ✅ Teacher portal with detailed salary breakdown
- ✅ Salary calculation engine:
  - Subscriptions (11% rate)
  - Substitutions
  - Methodical work
  - Individual lessons
  - Olympiad
  - Admin 3% with QA evaluation
  - Bonuses
  - Trial lessons with conversion threshold (≥51%)
- ✅ Salary confirmation flow
- ✅ Dispute system with reasons
- ✅ Accountant view (Salary Calculator) with status tracking

#### Recruitment & Re-enrollment
- ✅ New students (trial) tracking
- ✅ Leads pipeline
- ✅ Expelled students dashboard
- ✅ Re-enrollment workflow
- ✅ Contact history tracking
- ✅ Manager assignment

#### Group Management
- ✅ New group creation
- ✅ Student assignment to groups
- ✅ Teacher assignment
- ✅ Group start/archive
- ✅ Group detail panel

#### Finance Settings
- ✅ Companies management (9 panels)
- ✅ Bank accounts
- ✅ Invoice templates
- ✅ Document series
- ✅ Projects/programs
- ✅ VAT rates
- ✅ User management
- ✅ Integrations settings
- ✅ Export settings

#### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Auto-logout on 401
- ✅ Token refresh logic
- ✅ Route guards
- ✅ User profile display
- ✅ **Access Control Matrix**: Flexible permission system with roles (super-admin, franchisee-manager) and modes (active, read-only, hidden)

#### UI/UX
- ✅ Responsive design
- ✅ Loading indicators (global + local)
- ✅ Toast notification system
- ✅ Modal system (12+ modals)
- ✅ Multi-language support (4 languages)
- ✅ Theme system (prepared for dark mode)
- ✅ Icon system (Lucide)

#### Developer Experience
- ✅ Comprehensive documentation (17 files, 12000+ lines)
- ✅ Mock API for offline development
- ✅ TypeScript type safety
- ✅ Hot module replacement (HMR)
- ✅ Bundle analysis tools
- ✅ AI agent workflows

### 🚧 Partially Implemented / Stub Routes

The following routes exist in the router but currently redirect to Dashboard:

#### My Cabinet
- `/my-cabinet` → Dashboard stub

#### HR Module
- `/hr/active` → HR: Active Employees
- `/hr/training` → HR: Training Pipeline
- `/hr/pipeline` → HR: Recruitment Pipeline
- `/hr/personal` → HR: Personal Files
- `/hr/analytics` → HR: Analytics

#### Trainer Module
- `/trainer/dashboard` → Trainer Dashboard
- `/trainer/students` → Trainer: My Students
- `/trainer/groups` → Trainer: My Groups
- `/trainer/lesson-tracker` → Lesson Tracker
- `/trainer/tasks` → Trainer Tasks
- `/trainer/trial-lesson` → Trial Lessons
- `/trainer/trial-month` → Trial Month
- `/trainer/zaliczenia` → Zaliczenia (Assessments)
- `/trainer/olimpiad` → Olympiad

#### Finance Module (Additional)
- `/finance/students` → Finance: All Students
- `/finance/debtors` → Debtors
- `/finance/nadplaty` → Overpayments

#### Accounting
- `/accounting/faktury` → Invoices

#### Quality Module
- `/quality/rezygnacje` → Resignations
- `/quality/holidays-return` → Holidays & Returns
- `/quality/monitoring` → Quality Monitoring
- `/quality/analytics` → Quality Analytics
- `/quality/trial-lessons` → Trial Lessons (QA)
- `/quality/zaliczenia` → Zaliczenia (QA)
- `/quality/olimpiad` → Olympiad (QA)
- `/quality/spotkania` → Meetings
- `/quality/sciezka` → Learning Path
- `/quality/materials` → Materials
- `/quality/zaliczenia-calendar` → Zaliczenia Calendar
- `/quality/all-tasks` → All Tasks
- `/quality/stats` → Statistics

### ❌ Not Implemented

- ❌ Payment gateway integration (iMoje)
- ❌ KSeF electronic invoicing (API integration)
- ❌ Automated email notifications
- ❌ SMS notifications
- ❌ Advanced analytics dashboard
- ❌ Predictive forecasting
- ❌ Mobile app
- ❌ Real-time WebSocket updates
- ❌ File upload system
- ❌ Calendar integration
- ❌ Print-ready reports
- ❌ Audit log system

---

## 10. Glossary

### Business Terms

| Term | Definition |
|------|------------|
| **Abonament** | Monthly subscription fee (490-990 PLN) |
| **Próbny zajęcia** | Trial lesson for new students |
| **Konwersja** | Trial lesson conversion rate (≥51% threshold for teacher payout) |
| **Zastępstwo** | Substitution (teacher covers another teacher's lesson) |
| **Metodyczny** | Methodical work (teacher training meetings, 31.40 PLN/hour) |
| **Obowiązki admina** | Administrative duties (3% of subscription base with QA evaluation) |
| **Olimpiada** | Olympiad program (40 PLN/hour) |
| **Indywidualne** | Individual coaching (40 PLN/hour) |
| **Rezygnacja** | Student cancellation/resignation |
| **Wypisany** | Expelled student |
| **Dział rekrutacji** | Recruitment department |
| **Dział jakości** | Quality department |
| **Księgowość** | Accounting |
| **Zaliczenie** | Assessment/certification |
| **KSeF** | Krajowy System e-Faktur (Polish electronic invoicing system) |

### Technical Terms

| Term | Definition |
|------|------------|
| **Store** | Pinia state management module (e.g., `auth.store.ts`) |
| **Mock Adapter** | Axios adapter that intercepts requests and returns mock data |
| **Setup Store** | Pinia store pattern using Composition API |
| **Composable** | Reusable Composition API logic (not heavily used in this project) |
| **i18n** | Internationalization (multi-language support) |
| **Locale** | Language setting (pl/en/ru/uk) |
| **Route Guard** | Navigation guard that checks authentication |
| **Lazy Loading** | Dynamic imports for code splitting |
| **HMR** | Hot Module Replacement (instant updates during dev) |

### Payment Glossary

| Term | Definition |
|------|------------|
| **Taryfa** | Tariff/pricing tier |
| **Zniżka** | Discount |
| **Pauza** | Pause subscription |
| **Zwrot** | Refund |
| **Korekta** | Balance correction |
| **Dodatkowa opłata** | Extra charge |
| **Faktura** | Invoice |
| **Transakcja** | Payment transaction |
| **Nadpłata** | Overpayment |
| **Zadłużenie** | Debt/outstanding balance |
| **Program** | Educational program (Space Memory, Speedy Mind Indigo) |

### Salary Glossary

| Term | Definition |
|------|------------|
| **Prowizja** | Commission (11% of subscription base) |
| **Premia** | Bonus |
| **Retencja** | Retention bonus (0 cancellations) |
| **Próg konwersji** | Conversion threshold (51% for trial lessons) |
| **QA Score** | Quality assurance score (affects admin 3%) |
| **Status: draft** | Salary calculation not yet confirmed |
| **Status: confirmed** | Salary confirmed by teacher |
| **Status: disputed** | Salary disputed by teacher |
| **Status: paid** | Salary paid out |

---

## How to Use This Document

### For New Developers
1. Read sections 1-2 to understand the project purpose and tech stack
2. Review section 3 (Project Structure) to locate files
3. Study section 5 (Data Flow) to understand request lifecycle
4. Explore section 4 (Key Components) for detailed component descriptions
5. Refer to section 10 (Glossary) for domain-specific terms

### For Planning New Features
1. Review section 9 (Current State) to see what exists
2. Check section 6 (APIs & Interfaces) for available endpoints
3. Study similar implemented features in section 4
4. Consult `docs/` folder for detailed module documentation

### For Context in New Chat Sessions
Use this document as a comprehensive reference to:
- Understand the full scope of the project
- Locate specific files and their purposes
- Understand the architecture and design patterns
- Know which features are implemented vs planned
- Get familiar with business logic and domain terminology

### For Breaking Down Tasks
This document provides:
- Clear module boundaries (see Project Structure)
- Existing patterns to follow (see Key Components)
- API contracts (see APIs & Interfaces)
- Current implementation status (see Current State)

---

**Next Steps:**
1. For detailed Payment system documentation: See `docs/PAYMENTS_START_HERE.md`
2. For API reference: See `docs/API_ALL.md`
3. For quick start: See `QUICK_START.md`
4. For salary implementation: See `Sallery_API.md`

---

**Maintained by:** GLS Development Team
**Documentation Version:** 1.1
**Last Updated:** 2026-04-16
