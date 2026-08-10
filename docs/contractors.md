# Contractors

> **Source**: `src/features/contractors/`
> **Status**: ✅ Complete
> **Route**: `/contractors`

## Responsibility

CRUD management of contractors (subcontractors/vendors) working on construction projects.

## Module Structure

| Layer      | Files                                                                        |
| ---------- | ---------------------------------------------------------------------------- |
| Pages      | `ContractorsPage.tsx`                                                        |
| Components | `ContractorDialog.tsx`, `ContractorsTable.tsx`, `DeleteContractorDialog.tsx` |
| Services   | `contractor.service.ts`                                                      |
| Schemas    | (Zod validation schemas)                                                     |
| Mock       | `contractors.ts`                                                             |
| Types      | `types.ts`                                                                   |

## Implementation Details

- Supports creating, editing, deleting, and listing contractors.
- Contractors have a status (`ACTIVE` / `INACTIVE`).
- Fully implemented with UI, mock data, and service layer.

## Entity: Contractor

Represents a subcontractor or vendor that performs work on construction projects.

| Field        | Type               | Description                                 |
| ------------ | ------------------ | ------------------------------------------- |
| `id`         | `string`           | Unique identifier                           |
| `code`       | `string`           | System-generated contractor code            |
| `name`       | `string`           | Contractor name                             |
| `phone`      | `string`           | Contact phone number                        |
| `address`    | `string`           | Contractor address                          |
| `nationalId` | `string?`          | National ID (optional)                      |
| `notes`      | `string?`          | Additional notes (optional)                 |
| `status`     | `ContractorStatus` | `"ACTIVE"` or `"INACTIVE"`                  |
| `createdAt`  | `string`           | Creation timestamp                          |
| `isSystem`   | `boolean?`         | Whether this is a system-managed contractor |

## Form Values: ContractorFormValues

| Field        | Type               |
| ------------ | ------------------ |
| `name`       | `string`           |
| `phone`       | `string`           |
| `address`     | `string`           |
| `nationalId`  | `string`           |
| `notes`       | `string`           |
| `status`      | `ContractorStatus` |

## Relationships

- A Contractor can have multiple Equipment records.
- A Contractor can have multiple Daily Work records.
- A Contractor can have multiple Payment records.
- Daily Work references the Contractor through `contractorId`.
- Payment records reference the Contractor through `contractorId`.

## Contractor Status

- `ACTIVE` — contractor is currently active.
- `INACTIVE` — contractor is currently inactive.

The current frontend does not document or enforce additional business rules based on contractor status.

## Related Modules

- [Equipment](./equipment.md) — equipment is owned by a contractor.
- [Daily Work](./daily-work.md) — Daily Work entries reference a contractor.
- [Payments](./payments.md) — Payments are linked to a contractor.