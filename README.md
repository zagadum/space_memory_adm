# 📊 GLS CRM — Leadership School Management System

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-Vue%203%20|%20Pinia%20|%20Vite-blue)
![Localization](https://img.shields.io/badge/Localization-PL%20|%20EN%20|%20RU%20|%20UK-orange)

**GLS CRM** (Global Leaders Skills) is an innovative, enterprise-grade management platform designed for leadership schools. The system focuses on automating financial workflows, advanced salary calculations, and comprehensive student subscription management.

---

## 🚀 Key Features

### 💰 Advanced Salary Engine
A sophisticated calculation core supporting complex piecework logic:
- **Retention Bonuses**: Automatic calculation of bonuses for low student churn (0 cancellations).
- **Trial Conversion Logic**: Integrated performance tracking with payout thresholds (e.g., conversion ≥ 51%).
- **Administrative Duties**: Automatic 3% calculation based on total subscription pools and QA scores.

### 🏦 Dual-Interface Financial Hub
Tailored experiences for different organizational roles:
- **Teacher View (My Salary)**: Interactive personal dashboard with detailed session breakdowns and payout transparency.
- **Accountant View (Salary Calculator)**: A high-density "Pixel-Perfect" calculation center for precise payroll management and status tracking (Draft → Confirmed → Paid).

### 🎓 Student Lifecycle Management
End-to-end management of the student journey:
- **Subscription Engine**: Handling payments, automated discounts, and 24-month planning horizons.
- **Lifecycle Events**: Seamless management of pauses, transfers, and resignations with financial reconciliation.

### 🌍 Multi-language & Global Ready
Full internationalization (i18n) support across **Polish**, **English**, **Russian**, and **Ukrainian**, ensuring a localized experience for diverse staff and users.

---

## 🛠 Tech Stack

| Component          | Technology                                                                 |
|--------------------|----------------------------------------------------------------------------|
| **Frontend Framework** | [Vue 3](https://vuejs.org/) (Composition API with `<script setup lang="ts">`) |
| **Build Tool**     | [Vite](https://vitejs.dev/)                                                |
| **State Management** | [Pinia](https://pinia.vuejs.org/) (Setup Store pattern)                     |
| **Styling**        | Tailwind CSS + Custom "Pixel-Perfect" CSS modules                          |
| **Typography**     | `Outfit` (Headings & UI) & `Space Mono` (Numbers & Analytics)             |
| **Icons & Media**  | Lucide Icons & Custom SVG assets                                           |
| **Utilities**      | XLSX for advanced reporting and data exports                               |

---

## 🏗 Architecture Highlights

### Atomic & Component-Oriented Design
We transitioned from monolithic views to a modular, component-driven architecture inspired by **Atomic Design** principles. This ensures:
- **Scalability**: Components like `SummaryCard`, `DataTable`, and `SectionHeader` are highly reusable.
- **Maintainability**: Clear separation between layout and functional components.

### Isolated Business Logic
All business logic and data processing are strictly isolated within **Pinia Stores**. UI components remain "pure" and declarative, consuming state and invoking actions without handling complex side effects directly.

---

## 📂 Project Structure

```bash
src/
  api/          # Axios HTTP client and centralized endpoint definitions
  app/          # Application core: Router, i18n, and bootstrap
  components/   # Design system: /layout (Sidebar, Header) and /ui (UiButton, etc.)
  stores/       # Pinia state management (business logic layer)
  views/        # Top-level pages (organized by module: /finance, /teacher, etc.)
  locales/      # Multi-language dictionary files (JSON)
  styles/       # Global styles and design system variables
```

---

## 🏁 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🗺 Roadmap

- [ ] **Phase 4: Payment Gateways** — Integration with **Imoje** for automated online payments.
- [ ] **Phase 5: Fiscal Integration** — Support for **KSeF** (Krajowy System e-Faktur) for electronic invoicing compliance.
- [ ] **Advanced Analytics** — Predictive forecasting for student retention and financial growth.

---

© 2026 Global Leaders Skills. All rights reserved.
