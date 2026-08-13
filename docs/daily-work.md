# Daily Work

> **Source**: `src/features/daily-work/`
> **Status**: ✅ Complete
> **Route**: `/daily-work`

## Responsibility

Records daily work entries that track equipment usage, working hours, fuel consumption, costs, and deductions on specific projects.

Daily Work is the main operational source of work and cost data in the system and is the source of truth for Payment amounts.

## Module Structure

| Layer      | Files                                       |
| ---------- | ------------------------------------------- |
| Pages      | `DailyWorkPage.tsx`                         |
| Components | `DailyWorkDialog.tsx`, `DailyWorkTable.tsx` |
| Services   | `dailyWork.service.ts`                      |
| Schemas    | (Zod validation schemas)                    |
| Mock       | `dailyWork.ts`                              |
| Types      | `types/index.ts`                            |

## Implementation Details

- Each entry links to a Project, Contractor, Equipment (or temporary equipment name), and Task.
- Tracks working hours, fuel consumption, hourly rate, cost, deductions, and deduction reasons.
- Equipment can either reference a registered Equipment record or use a temporary equipment name.
- Fully implemented with UI, mock data, and service layer.

## Entity: DailyWork

Represents a single daily work record tracking equipment usage on a project.

| Field                    | Type      | Description                                |
| ------------------------ | --------- | ------------------------------------------ |
| `id`                     | `string`  | Unique identifier                          |
| `date`                   | `string`  | Date of the work entry                     |
| `projectId`              | `string`  | FK → Project                               |
| `contractorId`           | `string`  | FK → Contractor                            |
| `equipmentId`            | `string?` | FK → Equipment (optional)                  |
| `temporaryEquipmentName` | `string?` | Name for unregistered equipment (optional) |
| `hourRate`               | `number`  | Hourly rate applied                        |
| `workingHours`           | `number`  | Total hours worked                         |
| `fuelConsumption`        | `number`  | Fuel consumed                              |
| `taskId`                 | `string`  | FK → Task                                  |
| `cost`                   | `number`  | Calculated cost (`hourRate × workingHours`)|
| `deduction`              | `number`  | Amount deducted                            |
| `deductionReason`        | `string?` | Reason for deduction (optional)            |
| `notes`                  | `string?` | Additional notes (optional)                |
| `createdAt`               | `string`  | Creation timestamp                         |

## Form Values: DailyWorkFormValues

| Field                    | Type      |
| ------------------------ | --------- |
| `date`                   | `string`  |
| `projectId`              | `string`  |
| `contractorId`           | `string`  |
| `equipmentId`             | `string?` |
| `temporaryEquipmentName`  | `string?` |
| `hourRate`               | `number`  |
| `workingHours`            | `number`  |
| `fuelConsumption`         | `number`  |
| `taskId`                  | `string`  |
| `cost`                    | `number`  |
| `deduction`               | `number`  |
| `deductionReason`         | `string?` |
| `notes`                   | `string?` |

## Business Rules

### Work Cost

- The work cost is calculated from:

  `cost = hourRate × workingHours`

- `deduction` represents an amount deducted from the work cost.
- The Payment `grossAmount` is calculated from the total `cost` of the Daily Work records in the payment group.
- The Payment `totalDeductions` is calculated from the total `deduction` of the Daily Work records.
- The Payment `netAmount` is:

  `netAmount = grossAmount − totalDeductions`

### Payment Synchronization

Daily Work is the **source of truth** for Payment amounts.

Daily Work records are automatically grouped using:

`projectId + contractorId + YYYY-MM`

This means:

- Multiple Daily Work records for the same Project, Contractor, and month belong to the same Payment.
- Adding a Daily Work record to an existing group updates the existing Payment.
- A Daily Work record in a new month creates a new Payment for that group.
- Different Projects or Contractors always produce separate Payment groups.

### Daily Work Deletion

Daily Work deletion has an additional payment-related rule:

- A Daily Work record can be deleted if no money has been paid for its related Payment group.
- If the related Payment has any recorded Payment Transaction (`paidAmount > 0`), the Daily Work record cannot be deleted.
- The user receives an error message indicating that the Daily Work cannot be deleted because a payment has already been recorded.

When Daily Work records are deleted:

- The related Payment is recalculated through synchronization.
- If all Daily Work records belonging to a Payment group are deleted, that group no longer produces a Payment.
- Existing Payment Transactions are preserved during synchronization for existing Payment records.

## Relationships

- Each Daily Work entry belongs to one Project.
- Each Daily Work entry belongs to one Contractor.
- Each Daily Work entry may reference one registered Equipment.
- A Daily Work entry may instead use `temporaryEquipmentName`.
- Each Daily Work entry references one Task.
- Daily Work records are the source of truth for Payment amounts.

## Related Modules

- [Contractors](./contractors.md) — each entry references a Contractor.
- [Equipment](./equipment.md) — each entry may reference registered Equipment.
- [Projects](./projects.md) — each entry is recorded against a Project.
- [Tasks](./tasks.md) — each entry references a Task type.
- [Payments](./payments.md) — Payments are automatically derived from Daily Work records.