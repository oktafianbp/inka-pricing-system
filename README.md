# Multi-Division Manufacturing Cost Estimation & Approval Architecture (Conceptual Reference)

Author: Oktafian Bayu Prakosa, S.T.  
Stack: Laravel 11 (PHP 8.3), MySQL 8.0 (InnoDB), REST API, Vanilla JavaScript (Server-Sent Events)

> **Confidentiality & Dummy-Data Notice:**  
> This repository is a **sanitized conceptual reference** illustrating the software architecture, security controls, and automated testing discipline I applied while working on a multi-division industrial cost-estimation system. All calculation examples, numeric values, role names, and workflow diagrams below are **illustrative dummy examples**. No proprietary company source code, real tender figures, internal pricing margins, API paths, or corporate documents are included.

## Background

Complex heavy-manufacturing bids require synchronized inputs from engineering, procurement, labor planning, finance, commercial teams, and executive reviewers. Managing that handoff through detached spreadsheets creates version drift, unlogged manual overrides, and long audit reviews before a tender can be submitted.

To address those failure modes, I co-architected a centralized web application separating write permissions per department, locking revisions during management review, and backing every calculation with deterministic automated tests.

## Conceptual 6-Module Architecture (Illustrative Dummy Model)

Instead of exposing a single mutable spreadsheet, the architecture isolates six functional domains behind role-based boundaries:

1. **Engineering Module:** Tracks hierarchical multi-unit Bill of Materials (BOM) structures and local-content classification rules.
2. **Procurement & Logistics Module:** Applies multi-currency reference exchange rates, shipping delivery terms (Incoterms 2020), and vendor quotation histories.
3. **Labor & Capacity Module:** Stores shop-floor work-center hourly tariffs, machine utilization hours, and field travel allowances.
4. **Finance Module:** Holds financing cost parameters, bank guarantee structures, letter-of-credit provisions, and project cashflow schedules.
5. **Commercial Consolidation Module:** Aggregates direct material, labor, and supporting costs into a unified tender summary with cascade delivery-term outputs.
6. **Multi-Stage Approval Module:** Routes completed bids sequentially across management tiers and produces verifiable approval summary documents.

### Illustrative Dummy Calculation Example

To demonstrate how the calculation engine maintains deterministic arithmetic without exposing real corporate formulas or percentages, consider a simplified **dummy unit**:

```text
[ILLUSTRATIVE DUMMY EXAMPLE - NOT REAL CORPORATE DATA]

1. Direct Cost (Dummy Base)
   Material Pool (Dummy)        = 100.00 units
   Labor Hours x Tariff (Dummy) =  25.00 units
   Subtotal Direct              = 125.00 units

2. Supporting Cost (Dummy)
   Freight + Financing (Dummy)  =  15.00 units
   Total Production Base        = 140.00 units

3. Commercial Policy & Delivery Output (Dummy)
   Dummy Contingency + Margin   = +X% (configurable per policy table)
   Applicable Tax               = +Y%
   Final Delivered Quote        = Base + Policy + Tax + Delivery Cascade
```

All calculations run in deterministic fixed-precision backend services so repeated recalculations never suffer browser floating-point drift.

## Security & Governance Patterns Applied

| Control Area | Problem Addressed | Engineering Approach (Conceptual) |
| :--- | :--- | :--- |
| Division Access Boundaries | Cross-department edits overwriting another team's numbers | Token-based RBAC across 22 generic personas with read-only visibility outside a user's own module |
| Spreadsheet & Browser Input Hygiene | Formula injection in exported CSV/Excel files and DOM XSS | Server-side neutralization of leading formula characters (`=`, `+`, `-`, `@`) and strict HTML escaping |
| Revision Locks & Idempotency | Duplicate submissions or edits during active approval review | State-machine lock returning HTTP 422 while a bid is under revision, paired with short-window idempotency keys |
| Tamper-Evident Audit Trail | Unlogged changes to historical pricing decisions | Hash-chained SHA-256 audit table linking each event hash to the prior record (`prev_hash` to `chain_hash`) |
| Safe Document Handling | Malicious uploads or external SSRF during PDF generation | Magic-byte file validation, randomized UUID disk names, and sandboxed offline PDF rendering |

## Performance & Automated Verification

* **Conditional HTTP 304 ETag Caching:** Master rate endpoints validate `If-None-Match` headers so unchanged reference tables return empty 304 responses, cutting factory network payload by **85%**.
* **Automated Quality Gate:** Verified through **180 unit and feature tests (3,154 assertions, 100% pass rate)** covering calculation precision, permission boundaries, and approval lock transitions, supplemented by **29 headless browser smoke checks** and **7 multi-role end-to-end flows**.
