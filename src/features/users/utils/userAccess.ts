import type { UserRole } from "../types";

export interface UserActor {
  id: number;
  role: UserRole;
  projectId?: number | null;
  project_id?: number | null;
}

export interface UserTarget {
  id: number;
  role: UserRole;
  projectId?: number | null;
  project_id?: number | null;
}

/**
 * Extracts normalized project id from either `projectId` or backend `project_id`.
 */
export function getUserProjectId(
  user: { projectId?: number | null; project_id?: number | null } | null | undefined,
): number | null {
  if (!user) return null;
  const raw = user.projectId ?? user.project_id;
  return raw !== null && raw !== undefined ? Number(raw) : null;
}

/**
 * Returns whether a role must belong to a project.
 * - `super_admin`: does not require a project (null).
 * - `admin` and `user`: must belong to a project.
 */
export function isProjectRequired(role: UserRole | string | undefined | null): boolean {
  return role === "admin" || role === "user";
}

/**
 * Returns the roles the given actor is allowed to assign/create.
 * - `super_admin`: can assign `super_admin`, `admin`, and `user`.
 * - `admin`: can assign `user` only.
 * - `user` or unauthenticated: cannot assign any roles.
 */
export function getAssignableRoles(actor: UserActor | null | undefined): UserRole[] {
  if (!actor) return [];

  if (actor.role === "super_admin") {
    return ["super_admin", "admin", "user"];
  }

  if (actor.role === "admin") {
    return ["user"];
  }

  return [];
}

/**
 * Determines whether the actor has permission to manage the target user.
 * - `super_admin` can manage users across all projects.
 * - `admin` can manage `user` accounts within their own project only.
 * - `admin` cannot manage other Admins or Super Admins.
 * - `user` accounts cannot manage users.
 */
export function canManageUser(
  actor: UserActor | null | undefined,
  target: UserTarget | null | undefined,
): boolean {
  if (!actor || !target) return false;

  if (actor.role === "super_admin") {
    return true;
  }

  if (actor.role === "admin") {
    if (target.role !== "user") {
      return false;
    }

    const actorProjectId = getUserProjectId(actor);
    const targetProjectId = getUserProjectId(target);

    return (
      actorProjectId !== null &&
      targetProjectId !== null &&
      Number(actorProjectId) === Number(targetProjectId)
    );
  }

  return false;
}

/**
 * Determines whether the actor can activate or deactivate the target user.
 * Enforces `canManageUser` AND prevents modifying own account status.
 */
export function canChangeUserStatus(
  actor: UserActor | null | undefined,
  target: UserTarget | null | undefined,
): boolean {
  if (!actor || !target) return false;
  if (Number(actor.id) === Number(target.id)) return false;

  return canManageUser(actor, target);
}

/**
 * Determines whether the actor can delete the target user.
 * Enforces `canManageUser` AND prevents deleting own account.
 */
export function canDeleteUser(
  actor: UserActor | null | undefined,
  target: UserTarget | null | undefined,
): boolean {
  if (!actor || !target) return false;
  if (Number(actor.id) === Number(target.id)) return false;

  return canManageUser(actor, target);
}
