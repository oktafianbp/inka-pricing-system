# Enterprise Rolling Stock Cost Estimation & Form-2 HPP/DDP Platform

**Author:** Oktafian Bayu Prakosa, S.T.  
**Context:** Engineering Development Center (EDC) Intern Project, PT Industri Kereta Api (Persero) (Aug 2026 - Feb 2027)  
**Stack:** Laravel 11.x (PHP 8.3), MySQL 8.0 (InnoDB), RESTful API (`/api/v1`), Vanilla JS Server-Sent Events (SSE)

> **Confidentiality & GCG Notice:**  
> In compliance with State-Owned Enterprise Good Corporate Governance (GCG) and ISO 37001:2016 information security policies, this public repository documents the **sanitized architecture, deterministic Form-2 cost-engine formulas, OWASP Top 10 hardening matrix, and automated verification framework**. Proprietary internal corporate documents, historical procurement databases, and employee personal identifiers are excluded.

---

## 1. Engineering Brief

* **Challenge:** Manual cross-division tender spreadsheets introduced version drift, unverified margin overrides, and slow audit sign-off on high-value rolling stock bids scaling beyond Rp 500 Billion.
* **Architecture:** Co-architected a unified 6-division full-stack Laravel 11 platform enforcing ISO 37001:2016 Segregation of Duties across 22 role personas, deterministic HPP/DDP consolidation, and cryptographic SHA-256 audit chaining.
* **Verified Outcome:** Automated Form-2 HPP/DDP pricing and BAPHJ PDF generation, reduced factory network payload by **85%** via HTTP 304 ETag caching, and passed **180 automated tests (3,154 assertions, 100% pass)** plus 29 headless browser smoke tests.

---

## 2. 6-Division Functional Integration & RBAC Boundaries

1. **Technology (`Teknologi/`):** Hierarchical 12-Car Bill of Materials (BOM), engineering drawing memos, and automated TKDN calculations aligned with Permenperin No. 29/2018.
2. **Logistics (`Logistik/`):** Live Bank Indonesia JISDOR FX rates (USD, EUR, JPY, CNY), Incoterms 2020 landed-cost matrix (EXW/FOB to DDP), vendor RFI quotes, and historical SAP PO escalation.
3. **Human Capital (`HC/`):** Direct manufacturing man-hour tariffs across 6 shop-floor work-centers, machine-hour rates, and official travel (SPPD) parameters.
4. **Finance (`Finance/`):** Discount rates, WACC (Cost of Money), 4-pillar Bank Guarantees (Bid, Advance Payment, Performance, Warranty), Import L/C fees, and S-Curve cashflow modeling.
5. **Marketing (`Pemasaran/`):** Tender parameters, 8 Variable-B direct supporting cost sub-modules, and Form-2 Master Consolidation (Subtotal A + Subtotal B + Executive Policy + 11% VAT + Cascade DDP).
6. **Executive Approval (`Approval/`):** 5-stage sequential review (Stage 0 Pricing Manager through Stage 4 CEO) across 3 value tiers (`< Rp 50B`, `Rp 50B - 500B`, `> Rp 500B`), generating SHA-256 stamped BAPHJ PDF approval minutes.

---

## 3. OWASP Top 10 & ISO 37001:2016 Security Matrix

| Security Pillar | Mitigated Threat | Implementation Mechanism | Status |
| :--- | :--- | :--- | :--- |
| **A01: Access Control & SoD** | Cross-division mutation or out-of-turn sign-off | Sanctum RBAC (`auth:sanctum`), `EnforceDivisionBoundary` (22 personas, read-only cross-division isolation), `CheckApprovalStage` (HTTP 403) | Enforced |
| **A03: Injection Defense** | CWE-1236 Excel formula injection & CWE-79 DOM XSS | `ExcelPricingService::sanitizeCsvCell()` neutralizes leading `=,+,-,@`; strict `escapeHtml()` on all dynamic DOM writes | Sanitized |
| **A04: State & Replay Lock** | Revision bypass or duplicate form commits | `REVISION_REQUESTED` hard lock (HTTP 422) until Stage 0 resubmission; 60 s `X-Idempotency-Key` middleware (HTTP 409) | Locked |
| **A07: Auth Hardening** | Credential stuffing & idle session hijacking | 15-min lockout after 5 failures (HTTP 429), `throttle:10,1`, 480-min token TTL, 30-min client auto-logout | Active |
| **A08/A09: Forensic Audit** | Retrospective tampering with approval logs | Blockchain-like SHA-256 `audit_logs` chain (`prev_hash` / `chain_hash`), verified via `php artisan inka:verify-audit-chain` | Tamper-Proof |
| **A10: SSRF & Uploads** | Malicious payloads or PDF renderer SSRF/LFI | Magic-byte `SecureFileInspector` (UUIDv4 storage) + Dompdf `isRemoteEnabled => false` and strict `chroot` jail | Isolated |
| **ISO 37001 Anomaly Engine** | Abnormal margin or labor-ratio overrides | `CostAnomalyDetectorService` flags contingency outside 1.5% - 2.5%, margin outside 5% - 30%, or labor ratio outside 2% - 40% | Automated |

---

## 4. Performance & Automated Verification Gate

| Verification Suite | Command / Mechanism | Scope & Verified Result |
| :--- | :--- | :--- |
| **Bandwidth Optimization** | Conditional HTTP 304 `If-None-Match` ETag | **85% payload reduction** on `/logistik/rates`, `/hc/rates`, and `/finance/rates` |
| **Unit & Feature Suite** | `composer verify` | **180 automated tests (3,154 assertions, 100% pass, 0 warnings)** |
| **Headless Smoke Suite** | `composer smoke` | **29 frontend division views** verified in headless Chromium (0 console/runtime errors) |
| **Multi-Role E2E Suite** | `composer e2e` | **7 full cross-division tender and approval workflows** validated end-to-end |
