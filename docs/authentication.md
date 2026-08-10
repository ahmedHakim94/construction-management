# Authentication

> **Source**: `src/features/auth/`
> **Status**: ✅ Complete
> **Route**: `/login`

## Responsibility

Handles user login, authentication state, session persistence, and route protection.

## Module Structure

| Layer    | Files                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Pages    | `LoginPage.tsx`                                                          |
| Services | `auth.service.ts` (mock authentication — returns a hardcoded user/token) |
| Schemas  | `login.schema.ts` (Zod validation for login form)                        |
| Store    | `authSlice.ts` (Redux slice: `setCredentials`, `logout`)                 |

## Implementation Details

- Authentication state is managed through Redux.
- The authentication state contains:
  - Current user profile
  - Access token
  - Refresh token
  - Authentication status
- Auth state is persisted across browser sessions using Redux Persist.
- The current authentication service is a mock implementation and does not communicate with a real backend.
- The mock service resolves immediately with predefined authentication data.
- Authentication state is used by the application's route guards.

### Route Guards

- `ProtectedRoute`
  - Requires the user to be authenticated.
  - Redirects unauthenticated users to `/login`.

- `PublicRoute`
  - Used for public pages such as login.
  - Redirects authenticated users to `/dashboard`.

## Entity: UserProfile

Represents the authenticated user's profile.

| Field   | Type     | Description               |
| ------- | -------- | ------------------------- |
| `id`    | `number` | Unique user identifier    |
| `email` | `string` | User email address        |
| `name`  | `string` | User display name         |
| `role`  | `string` | User role, e.g. `"Admin"` |

## Auth State (Redux)

| Field             | Type                  | Description                   |
| ----------------- | --------------------- | ----------------------------- |
| `user`            | `UserProfile \| null` | Currently authenticated user  |
| `token`           | `string \| null`      | Access token                  |
| `refreshToken`    | `string \| null`      | Refresh token                 |
| `isAuthenticated` | `boolean`             | Current authentication status |

## Current Limitations

- Authentication currently uses mock data.
- No real backend authentication endpoint is connected yet.
- Token refresh behavior is not implemented as a real API flow yet.
- User credentials and authentication behavior will need to be connected to the backend during the backend implementation phase.

## Related Modules

- [Dashboard](./dashboard.md) — default destination after successful authentication.
