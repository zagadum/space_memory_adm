# 📊 GLS Admin — Space Memory Platform

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-Vue%203%20|%20Laravel%2011%20|%20PostgreSQL-blue)
![Localization](https://img.shields.io/badge/Localization-PL%20|%20EN%20|%20RU%20|%20UK-orange)

**GLS Admin (Space Memory)** is a modern CRM and ERP system for a language school in Warsaw. It automates financial workflows, student management, and recruitment pipelines with a high-performance, developer-friendly architecture.

---

## 🚀 Key Modules & Features

### 💰 Finance & Salary Engine
- **Salary Calculator**: Advanced piecework calculation for teachers with retention bonuses and trial conversion tracking.
- **Returns & Refunds**: Automated management of student refunds and balance corrections.
- **Financial Status Tracking**: Pipeline for payroll (Draft → Confirmed → Paid).

### 👩‍🚀 Student Management
- **Lifecycle Engine**: End-to-end management of subscriptions, pauses, transfers, and resignations.
- **Student Profile**: 6-tab comprehensive view including Payments, Groups, Attendance, Progress, and Notes.
- **Side Panel & History**: Real-time access to student event history and quick actions.

### 🌟 Recruitment Hub
- **Leads & Pipeline**: Management of potential students through a structured recruitment funnel.
- **New Groups Engine**: Advanced tool for assembling and launching new classes.
- **Expelled Students**: Tracking and recovery logic for former students.

### 🏗️ Advanced UI/UX
- **Dynamic Themes**: Intelligent Dark/Light mode with persistence and CSS Design Tokens.
- **Flexible Views**: Calendar Grid ↔ Table view toggle for payments and schedules.
- **Pixel-Perfect Design**: Custom UI library (`UiButton`, `UiInput`, `UiBadge`) with "Glassmorphism" effects.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup lang="ts">`)
- **State**: [Pinia](https://pinia.vuejs.org/) (Setup focus)
- **Tooling**: [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **i18n**: Full support for PL, EN, RU, UK locales.

### Backend
- **Core**: [Laravel 11](https://laravel.com/)
- **Database**: PostgreSQL (Primary) + Redis (Queue/Cache)
- **Auth**: Laravel Sanctum

---

## 📂 Project Structure (`src/`)

```bash
src/
  api/          # Axios functions, centralized endpoints.ts, mock adapters
  app/          # Core: Main entry, Router, i18n initialization
  components/   # reusable design system: /layout and /ui components
  layouts/      # AppLayout.vue, AuthLayout.vue
  stores/       # Pinia stores (business logic and state)
  views/        # Page components (Finance, Students, Teacher, etc.)
  modals/       # Centralized ModalHost.vue and modal windows
  locales/      # Multi-language JSON dictionaries
  styles/       # Global CSS (base.css, layout.css) with Design Tokens
  types/        # Shared TypeScript interfaces
  utils/        # Business logic helpers (date, formatters, etc.)
```

---

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env` and configure your API URLs.
   ```bash
   VITE_API_BASE_URL=https://api.gls-admin.com/v1
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📜 Core Development Rules

- **Strict TypeScript**: Always use interfaces for props, emits, and API responses.
- **i18n Mandatory**: Hardcoded strings are forbidden. Add translations to all 4 locale files.
- **API Versioning**: All endpoints must use the `/v1/` prefix via `src/api/http.ts`.
- **Component Style**: Use `<script setup lang="ts">` and `<style scoped>`.

> [!IMPORTANT]
> Detailed coding standards are maintained in the project-wide `gls-main.md` rulebook.

---

© 2026 Global Leaders Skills. All rights reserved.
