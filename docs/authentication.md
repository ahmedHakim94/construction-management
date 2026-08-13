# Authentication

> **Source Path**: `src/features/auth/`  
> **Status**: ✅ Complete  
> **Login Route**: `/login`

## 1. Module Overview

The Authentication module manages user login sessions, credentials validation, state persistence, and client-side route protection. The system is designed to switch seamlessly to a real backend service in the future by isolating mock verification inside the service layer.

---

## 2. Module Structure

The features and layouts are structured into self-contained files under the module directory:

| Layer | File / Path | Responsibility |
|---|---|---|
| **Pages** | [LoginPage.tsx](file:///d:/myProject/construction-management/src/features/auth/pages/LoginPage.tsx) | Renders the split-pane screen layout (visual panel on desktop, forms on the right). |
| **Components** | [LoginForm.tsx](file:///d:/myProject/construction-management/src/features/auth/components/LoginForm.tsx) | Handles user inputs, validation hooks, loading states, and submit trigger. |
| | [BoxOverLayer.tsx](file:///d:/myProject/construction-management/src/features/auth/components/BoxOverLayer.tsx) | Left visual/branding overlay containing feature highlights. |
| | [AuthLoading.tsx](file:///d:/myProject/construction-management/src/features/auth/components/AuthLoading.tsx) | Spinner loader component during session loading/checks. |
| **Services** | [auth.service.ts](file:///d:/myProject/construction-management/src/features/auth/services/auth.service.ts) | Verifies user credentials, handles simulated latency, and mocks responses. |
| **Schemas** | [login.schema.ts](file:///d:/myProject/construction-management/src/features/auth/schemas/login.schema.ts) | Zod schema defining fields and validation rules. |
| **Store** | [authSlice.ts](file:///d:/myProject/construction-management/src/features/auth/store/authSlice.ts) | Redux store slice managing the session actions and state reducers. |
| **Styles** | `src/features/auth/styles/login.scss` | Custom responsive SCSS grid and styles for the modern layout. |
| | `src/features/auth/styles/auth-loading.scss` | Custom SCSS spinner animation styles. |

---

## 3. Login Behavior

### Form Input & Validation
Login requires only two fields:
- **Username**: Validated as a non-empty string.
- **Password**: Validated as a non-empty string.

Validation is handled by `react-hook-form` using a `zodResolver` bound to `loginSchema`.

### Mock Authentication Service
The authentication process calls `login(username, password)` inside `auth.service.ts`.
- **Predefined Credentials**:
  - **Username**: `admin`
  - **Password**: `admin123`
- The service simulates backend latency (600ms delay).

### Success Flow
1. If the credentials match `admin` / `admin123`, the service resolves with a mock `AuthResponse`.
2. The UI dispatches the Redux action `setCredentials(...)` with the returned user profile and tokens.
3. The user is redirected to the `/dashboard` route.

### Failure Flow
1. On mismatched credentials, the service throws `Error("InvalidCredentials")`.
2. The catch block in `LoginForm.tsx` intercepts the error.
3. A toast alert displays the localized error message `invalidCredentials`.
4. The loading indicator clears, enabling form resubmission.

---

## 4. Authentication State

Redux state is managed under the `auth` slice using Redux Toolkit.

```typescript
interface AuthState {
  user: UserProfile | null;       // Logged-in user's profile details
  token: string | null;           // Mock access token
  refreshToken: string | null;    // Mock refresh token
  isAuthenticated: boolean;       // Authentication status flag
}
```

---

## 5. Persistence

- **Mechanism**: The Redux state is persisted across browser reloads and sessions using `redux-persist`.
- **Storage**: Browser's `localStorage` is used under the key `construction-management`.
- **Configuration**: The `auth` slice is whitelisted for persistent storage.

---

## 6. Routing Protection

Route guarding is enforced by two React Router components:

- **[ProtectedRoute.tsx](file:///d:/myProject/construction-management/src/app/router/ProtectedRoute.tsx)**:
  - Protects private routes.
  - If `isAuthenticated` is `false`, it redirects the user to `/login`.
  - If `isAuthenticated` is `true`, it mounts the route's components via `<Outlet />`.

- **[PublicRoute.tsx](file:///d:/myProject/construction-management/src/app/router/PublicRoute.tsx)**:
  - Applied to the `/login` route.
  - If `isAuthenticated` is `true`, it redirects the user directly to `/dashboard`.

---

## 7. Rehydration / Loading Behavior

- **Rehydration Execution**: Redux Persist rehydration loads the saved session state from `localStorage` before any routing guard evaluates `isAuthenticated`.
- **Layout Presence**: During rehydration, the root `PersistGate` blocks rendering of the router. 
- **Redirect Resolution**: Once bootstrapped, the router mounts immediately. If authenticated, the user lands directly on the requested page. If unauthenticated, the user is redirected cleanly to the `/login` page.

---

## 8. Entities / Types

### `UserProfile`
Represents the profile information of the authenticated user.
```typescript
interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
}
```

### `AuthResponse`
Represents the standard API response structure returned upon successful login.
```typescript
interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserProfile;
}
```

---

## 9. Related Modules

- [Dashboard](./dashboard.md) — Default landing page redirected to after a successful login session is established.
