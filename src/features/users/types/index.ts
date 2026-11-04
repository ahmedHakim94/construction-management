import type { PaginationMeta } from "@/types";

export type UserRole = "super_admin" | "admin" | "user";

export type UserStatus = "ACTIVE" | "INACTIVE";

/**
 * User record as displayed/stored on the frontend.
 * Never contains a password.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  /** `null` only for `super_admin`; required for `admin` and `user`. */
  projectId: number | null;
  projectName?: string | null;
  status: UserStatus;
  createdAt: string;
}

/**
 * Add/Edit form values.
 * Password fields exist only in the form and are never persisted.
 */
export interface UserFormValues {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  projectId: number | null;
  status: UserStatus;
}

/** Table filters. Empty string means "all". */
export interface UserFilters {
  search: string;
  role: UserRole | "";
  projectId: number | "";
  status: UserStatus | "";
}

export type UsersParams = Partial<UserFilters> & {
  page?: number;
  limit?: number;
};

export type UsersResult = {
  data: User[];
  pagination: PaginationMeta;
};

export type ChangeUserStatusPayload = {
  id: number;
  status: UserStatus;
};

export interface BackendUserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: number | boolean;
  created_at: string;
  project_id: number | null;
  project_name?: string | null;
}

export interface BackendUsersResponse {
  success: boolean;
  data: BackendUserItem[];
  pagination: PaginationMeta;
  users?: BackendUserItem[];
}

export interface BackendSingleUserResponse {
  success: boolean;
  data: BackendUserItem;
  message?: string;
}
