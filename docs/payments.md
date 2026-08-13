# Payments

> **Source**: `src/features/payments/`
> **Status**: ✅ Complete
> **Route**: `/payments`

## Responsibility

Payment records are derived from Daily Work groups, while Payment Transactions represent actual money paid. that are automatically synchronized from Daily Work, and tracks actual money paid against those payments via Payment Transactions.

## Module Structure

| Layer | Files |
|---|---|
| Pages | `PaymentPage.tsx` |
| Components | `PaymentDetailsDialog.tsx`, `PaymentFilters.tsx`, `PaymentSummary.tsx`, `PaymentTable.tsx`, `RecordPaymentDialog.tsx`, |
| Hooks | `usePaymentFilters.ts`, `usePayments.ts` |
| Services | `payment.service.ts` |
| Schemas | (Zod validation schemas) |
| Mock | `payments.ts`, `paymentTransactions.ts` |
| Types | `types.ts` |

## Implementation Details

- Has filtering capabilities by project and provides a payment summary view.
- Most feature-rich module in the project. Fully implemented with UI, mock data, and service layer.

## Business Rules

- **Daily Work is the source of truth** for payment amounts. Payments are not created or edited manually.
- Daily Work records are **automatically grouped** by `projectId` + `contractorId` + month (`YYYY-MM`) to form a single Payment.
- Adding or updating a Daily Work record **automatically synchronizes** the related Payment (creates it if it doesn't exist, updates amounts if it does).
- Each Payment tracks: `grossAmount`, `totalDeductions`, `netAmount`, `paidAmount`, and `remainingAmount`.
- **Payment Transactions** represent actual money paid against a Payment (recorded via `RecordPaymentDialog`).
- Payment status is **calculated** from `paidAmount` and `netAmount`:
  - `UNPAID` — no money paid yet (`paidAmount === 0`)
  - `PARTIALLY_PAID` — some money paid (`0 < paidAmount < netAmount`)
  - `PAID` — fully paid (`paidAmount >= netAmount`)
- When Daily Work synchronization recalculates payment amounts, **existing Payment Transactions are preserved**.

## Entity: Payment

Represents a payment record for a contractor on a specific project over a date range.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `projectId` | `string` | FK → Project |
| `contractorId` | `string` | FK → Contractor |
| `startDate` | `string` | Payment period start date |
| `endDate` | `string` | Payment period end date |
| `grossAmount` | `number` | Total gross amount before deductions |
| `totalDeductions` | `number` | Total deductions applied |
| `netAmount` | `number` | Net amount (grossAmount − totalDeductions) |
| `paidAmount` | `number` | Amount already paid |
| `remainingAmount` | `number` | Amount still owed (netAmount − paidAmount) |
| `status` | `PaymentStatus` | `"UNPAID"`, `"PARTIALLY_PAID"`, or `"PAID"` |
| `createdAt` | `string` | Creation timestamp |

## Entity: PaymentTransaction

Represents a single payment transaction recorded against a Payment.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `paymentId` | `string` | FK → Payment |
| `amount` | `number` | Transaction amount |
| `date` | `string` | Transaction date |
| `createdAt` | `string` | Creation timestamp |

## Form Values: RecordPaymentFormValues

| Field | Type |
|---|---|
| `amount` | `number` |

## Related Modules

- [Daily Work](./daily-work.md) — source of truth for payment amounts; synchronization trigger.
- [Contractors](./contractors.md) — each payment is linked to a contractor.
- [Projects](./projects.md) — each payment is linked to a project.

### Additional Rules

- A Daily Work record cannot be deleted if its related Payment has any recorded payment (`paidAmount > 0`).
- A Daily Work record with no recorded payment can be deleted normally.
- If all Daily Work records belonging to a payment group are deleted, the related Payment is removed during synchronization.
