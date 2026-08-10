# Tasks

> **Source**: `src/features/settings/task/`
> **Status**: ✅ Complete
> **Route**: `/settings/tasks`

## Responsibility

Manages task types that can be assigned to Daily Work entries. Tasks are a Settings sub-module.

## Module Structure

| Layer      | Files                             |
| ---------- | --------------------------------- |
| Pages      | `TaskPage.tsx`                    |
| Components | `TaskDialog.tsx`, `TaskTable.tsx` |
| Services   | `task.service.ts`                 |
| Schemas    | (Zod validation schemas)          |
| Mock       | `tasks.ts`                        |
| Types      | `types/index.ts`                  |

## Implementation Details

- Task names are stored in both Arabic and English.
- Tasks are used as work types when creating Daily Work records.
- Fully implemented with CRUD operations.

## Entity: Task

Represents a type of work/task that can be performed in Daily Work entries.

| Field    | Type     | Description       |
| -------- | -------- | ----------------- |
| `id`     | `string` | Unique identifier |
| `nameAr` | `string` | Arabic name       |
| `nameEn` | `string` | English name      |

## Form Values: TaskFormValues

| Field    | Type     |
| -------- | -------- |
| `nameAr` | `string` |
| `nameEn` | `string` |

## Relationships

- A Task can be referenced by multiple Daily Work records.
- Daily Work uses the Task `id` to identify the type of work performed.

## Related Modules

- [Daily Work](./daily-work.md) — each Daily Work entry references a Task type.