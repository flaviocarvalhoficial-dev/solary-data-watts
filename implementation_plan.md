# Implementation Plan — Watts MVP

## 1. Context & Objective
Migrate the mock-based prototype to a solid production-ready application using Supabase for persistence, real-time calculations, and batch PDF generation.

## 2. Status Tracking
- 🟢 **DONE**: Ready
- 🟡 **IN PROGRESS**: Being implemented
- ⚪ **TODO**: Pending

---

## Phase 1: Foundation & Auth 🟢
- [x] Initialize Vite + Tailwind + Lucide project 🟢
- [x] Configure Supabase Client & Context 🟢
- [x] Implement Auth (Login/Logout) 🟢
- [x] Design System Tokens (Bright CRM inspired) 🟢

## Phase 2: CRUD & Real Data 🟡
- [x] Create `clients` table schema & RLS 🟢
- [x] Create `bills` table schema & RLS 🟢
- [x] Create `audit_logs` table schema & RLS 🟢
- [x] Implement `useClients` CRUD hook 🟢
- [x] Implement `useBills` CRUD hook 🟢
- [x] Implement `useAuditLog` hook 🟢
- [ ] Refactor `App.tsx` into smaller components (Layout, Sidebar, Dashboard, ClientList, ClientDetail) ⚪
- [x] Connect `App.tsx` state to Supabase hooks 🟢
- [ ] Implement advanced metrics in calculation engine (ROI, Economia Acumulada, Economia Anual) ⚪

## Phase 3: OCR & Parsing 🟡
- [x] Integrate `pdfjs-dist` for PDF reading 🟢
- [x] Implement Regex-based extraction (Equatorial Pará format) 🟢
- [ ] Add support for multiple concessionária formats (Multi-OCR) ⚪
- [ ] Improve extraction confidence and manual fallback UI 🟡

## Phase 4: Solar APIs ⚪
- [ ] Connect with APsystems API (token-based) ⚪
- [ ] Connect with Sungrow API ⚪
- [ ] Connect with GoodWe API ⚪
- [ ] Implement daily sync for generation data into `generation_cache` table ⚪

## Phase 5: Report Engine 🟡
- [x] Implement `jsPDF` + `html2canvas` generator 🟢
- [x] Dynamic text generation based on stats 🟢
- [x] Batch generation (ZIP) with progress feedback 🟢
- [ ] Indicação visual de FALLBACK nos relatórios (conforme PRD) ⚪

## Phase 6: UX & Polishing 🟡
- [x] Responsive Sidebar & Navigation 🟢
- [x] Client Status Logic (Completo, Divergente, Incompleto) 🟢
- [ ] Implement Skeleton Loaders for data fetching ⚪
- [ ] Add empty states for new accounts ⚪
- [ ] Refine the "Edit Bill" modal for better manual entry 🟡
- [ ] Implement logs/activity view for manual edits ⚪

---

## Next Steps
1. **Refactor App.tsx**: It's currently too large (>700 lines). Break it into components.
2. **Advanced Metrics**: Update `calcStats` to handle historical data for "Acumulada" and "Anual".
3. **API Integrations**: Prepare the `generation_cache` table and APsystems connection.
