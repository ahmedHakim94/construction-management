# Projects

> **Source**: `src/features/settings/projects/`
> **Status**: ✅ Complete
> **Route**: `/settings/projects`

## Responsibility

Manages construction projects. Projects are a Settings sub-module.

## Module Structure

| Layer      | Files                                   |
| ---------- | --------------------------------------- |
| Pages      | `ProjectPage.tsx`                       |
| Components | `ProjectDialog.tsx`, `ProjectTable.tsx` |
| Services   | `project.service.ts`                    |
| Schemas    | (Zod validation schemas)                |
| Mock       | `projects.ts`                           |
| Types      | `types/index.ts`                        |

## Implementation Details

- Projects have a name and address.
- Projects are used as a reference for Daily Work and Payments.
- Fully implemented with CRUD operations.

## Entity: Project

Represents a construction project.

| Field     | Type     | Description              |
| --------- | -------- | ------------------------ |
| `id`      | `string` | Unique identifier        |
| `name`    | `string` | Project name             |
| `address` | `string` | Project location/address |

## Form Values: ProjectFormValues

| Field     | Type     |
| --------- | -------- |
| `name`    | `string` |
| `address` | `string` |

## Relationships

- A Project can have multiple Daily Work records.
- A Project can have multiple Payment records.
- Payment grouping uses `projectId` as part of the payment group key.
- Daily Work records are associated with a Project through `projectId`.

## Related Modules

- [Daily Work](./daily-work.md) — daily work entries are recorded against a project.
- [Payments](./payments.md) — payments are linked to a project.