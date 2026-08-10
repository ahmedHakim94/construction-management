# Equipment

> **Source**: `src/features/equipment/`
> **Status**: ✅ Complete
> **Route**: `/equipment`

## Responsibility

Manages equipment records linked to contractors and equipment types.

## Module Structure

| Layer      | Files                                       |
| ---------- | ------------------------------------------- |
| Pages      | `EquipmentPage.tsx`                         |
| Components | `EquipmentDialog.tsx`, `EquipmentTable.tsx` |
| Services   | `equipment.service.ts`                      |
| Schemas    | (Zod validation schemas)                    |
| Mock       | `equipment.ts`, `index.ts`                  |
| Types      | `types.ts`                                  |

## Implementation Details

- Equipment is linked to a Contractor through `contractorId`.
- Equipment is linked to an Equipment Type through `equipmentTypeId`.
- Tracks model, plate number, equipment number, and hourly rate.
- Fully implemented with UI, mock data, and service layer.

## Entity: Equipment

Represents a piece of equipment owned by a contractor.

| Field             | Type      | Description                          |
| ----------------- | --------- | ------------------------------------ |
| `id`              | `string`  | Unique identifier                    |
| `contractorId`    | `string`  | FK → Contractor                      |
| `equipmentTypeId` | `string`  | FK → EquipmentType                   |
| `model`           | `string?` | Equipment model (optional)           |
| `plateNumber`     | `string?` | Vehicle plate number (optional)      |
| `equipmentNumber` | `string?` | Internal equipment number (optional) |
| `hourRate`        | `number`  | Hourly rental rate                   |
| `notes`           | `string?` | Additional notes (optional)          |
| `createdAt`       | `string`  | Creation timestamp                   |

## Form Values: EquipmentFormValues

| Field             | Type     |
| ----------------- | -------- |
| `contractorId`    | `string` |
| `equipmentTypeId` | `string` |
| `model`           | `string` |
| `plateNumber`     | `string` |
| `equipmentNumber` | `string` |
| `hourRate`        | `number` |
| `notes`           | `string` |

## Equipment Number

- `equipmentNumber` can be provided manually when creating equipment.
- If no equipment number is provided, the system generates one automatically using the Equipment Type `prefix`.
- The generated format is:

  `PREFIX-XXX`

  where `XXX` is a zero-padded sequential number based on the existing equipment records with the same prefix.

- Examples:
  - `EXC-001`
  - `EXC-002`
  - `LOA-001`
- The equipment number is not changed during equipment updates.
- The current frontend generation logic is based on the number of existing equipment records matching the same prefix.

## Relationships

- Each Equipment belongs to one Contractor.
- Each Equipment belongs to one Equipment Type.
- A Contractor can have multiple Equipment records.
- An Equipment Type can be assigned to multiple Equipment records.
- Daily Work records reference Equipment through `equipmentId`.

## Related Modules

- [Contractors](./contractors.md) — each equipment belongs to a contractor.
- [Equipment Types](./equipment-types.md) — each equipment references an equipment type.
- [Daily Work](./daily-work.md) — Daily Work entries reference equipment.