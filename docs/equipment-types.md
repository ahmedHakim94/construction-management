# Equipment Types

> **Source**: `src/features/settings/equipment-type/`
> **Status**: ✅ Complete
> **Route**: `/settings/equipment-types`

## Responsibility

Manages the catalog of equipment categories such as Excavator, Crane, and Loader.

## Module Structure

| Layer      | Files                                               |
| ---------- | --------------------------------------------------- |
| Pages      | `EquipmentTypePage.tsx`                             |
| Components | `EquipmentTypeDialog.tsx`, `EquipmentTypeTable.tsx` |
| Services   | `equipmentType.service.ts`                          |
| Schemas    | (Zod validation schemas)                            |
| Mock       | `equipmentTypes.ts`                                 |
| Types      | `types.ts`                                          |

## Implementation Details

- Equipment types have bilingual names (`nameAr`, `nameEn`).
- Each equipment type has a `prefix` used for automatic equipment number generation.
- Fully implemented with CRUD operations.

## Entity: EquipmentType

Represents a category/type of equipment managed under Settings.

| Field       | Type     | Description                         |
| ----------- | -------- | ----------------------------------- |
| `id`        | `string` | Unique identifier                   |
| `nameAr`    | `string` | Arabic name                         |
| `nameEn`    | `string` | English name                        |
| `prefix`    | `string` | Code prefix for equipment numbering |
| `createdAt` | `string` | Creation timestamp                  |

## Form Values: EquipmentTypeFormValues

| Field    | Type     |
| -------- | -------- |
| `nameAr` | `string` |
| `nameEn` | `string` |

## Prefix

- Each Equipment Type has a `prefix`.
- The prefix is used when automatically generating equipment numbers.
- Equipment numbers generated for the same prefix use a sequential three-digit number.
- The current frontend determines the next number by counting existing equipment records whose equipment number starts with the same prefix.

## Relationships

- An Equipment Type can be referenced by multiple Equipment records.
- Equipment references the type through `equipmentTypeId`.

## Related Modules

- [Equipment](./equipment.md) — equipment records reference an equipment type.