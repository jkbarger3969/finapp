import { ObjectId } from "mongodb";
import { Context } from "../../types";
import { AuthService, AuthUser } from "../../services/authService";

export type PermissionAction = 
  | "ADD_TRANSACTION"
  | "EDIT_TRANSACTION"
  | "DELETE_TRANSACTION"
  | "ISSUE_REFUND"
  | "DELETE_REFUND";

/**
 * Check if the current user has permission to perform an action
 * 
 * Permission Rules:
 * - SUPER_ADMIN: Can do everything
 * - DEPT_ADMIN: Can only VIEW transactions in their departments, cannot add/edit/delete
 * - USER: Can only VIEW transactions in departments they have access to
 */
export async function checkPermission(
  context: Context,
  action: PermissionAction,
  departmentId?: string | ObjectId
): Promise<void> {
  if (!context.user?.id) {
    throw new Error("Unauthorized: Please log in");
  }

  if (!context.authService) {
    throw new Error("Auth service not configured");
  }

  const user = await context.authService.getUserById(context.user.id);
  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  if (user.status === "DISABLED") {
    throw new Error("Unauthorized: Your account has been disabled");
  }

  // SUPER_ADMIN can do everything
  if (user.role === "SUPER_ADMIN") {
    return;
  }

  // For transaction modifications, only SUPER_ADMIN is allowed
  const writeActions: PermissionAction[] = [
    "ADD_TRANSACTION",
    "EDIT_TRANSACTION", 
    "DELETE_TRANSACTION",
    "ISSUE_REFUND",
    "DELETE_REFUND"
  ];

  if (writeActions.includes(action)) {
    throw new Error(
      `Unauthorized: Only Super Admins can ${action.toLowerCase().replace(/_/g, ' ')}. ` +
      `Please contact an administrator if you need to make changes.`
    );
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(context: Context): Promise<AuthUser> {
  if (!context.user?.id) {
    throw new Error("Unauthorized: Please log in");
  }

  if (!context.authService) {
    throw new Error("Auth service not configured");
  }

  const user = await context.authService.getUserById(context.user.id);
  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  if (user.status === "DISABLED") {
    throw new Error("Unauthorized: Your account has been disabled");
  }

  return user;
}

/**
 * Check if user is a SUPER_ADMIN
 */
export async function requireSuperAdmin(context: Context): Promise<AuthUser> {
  const user = await getCurrentUser(context);
  
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: This action requires Super Admin privileges");
  }
  
  return user;
}
