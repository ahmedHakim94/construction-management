import type { ChipProps } from "@mui/material";
import type { UserFilters, UserRole, UserStatus } from "./types";

export const USER_ROLES = {
  superAdmin: "super_admin",
  admin: "admin",
  user: "user",
} as const satisfies Record<string, UserRole>;

export const USER_STATUSES = {
  active: "ACTIVE",
  inactive: "INACTIVE",
} as const satisfies Record<string, UserStatus>;

/** Roles that must be assigned to a project. */
export const PROJECT_REQUIRED_ROLES: readonly UserRole[] = [
  USER_ROLES.admin,
  USER_ROLES.user,
];

/** Options use i18n keys as labels; translate with `t(option.labelKey)`. */
export const USER_ROLE_OPTIONS: readonly { value: UserRole; labelKey: string }[] =
  [
    { value: USER_ROLES.superAdmin, labelKey: "roleSuperAdmin" },
    { value: USER_ROLES.admin, labelKey: "roleAdmin" },
    { value: USER_ROLES.user, labelKey: "roleUser" },
  ];

export const USER_STATUS_OPTIONS: readonly {
  value: UserStatus;
  labelKey: string;
}[] = [
  { value: USER_STATUSES.active, labelKey: "active" },
  { value: USER_STATUSES.inactive, labelKey: "inactive" },
];

export const USER_ROLE_COLORS: Record<UserRole, ChipProps["color"]> = {
  super_admin: "secondary",
  admin: "primary",
  user: "default",
};

export const USER_STATUS_COLORS: Record<UserStatus, ChipProps["color"]> = {
  ACTIVE: "success",
  INACTIVE: "default",
};

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: "",
  role: "",
  projectId: "",
  status: "",
};

export const USERS_PAGE_LIMIT = 10;

