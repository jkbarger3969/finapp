import { ObjectId } from "mongodb";
import { Context } from "../../types";
import { AuthService, AuthUser, UserPermission, AuditLogEntry } from "../../services/authService";

export const authResolvers = {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser | null> => {
      if (!context.user?.id) return null;
      const authService = context.authService;
      if (!authService) return null;
      return authService.getUserById(context.user.id);
    },

    users: async (
      _parent: unknown,
      args: { where?: Record<string, unknown> },
      context: Context<unknown>
    ): Promise<AuthUser[]> => {
      const currentUser = await requireAuth(context);

      if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "DEPT_ADMIN") {
        throw new Error("Unauthorized: Only admins can view user list");
      }

      return context.authService!.getUsers(args.where);
    },

    user: async (
      _parent: unknown,
      args: { id: string },
      context: Context<unknown>
    ): Promise<AuthUser | null> => {
      await requireAuth(context);
      return context.authService!.getUserById(args.id);
    },

    auditLog: async (
      _parent: unknown,
      args: { where?: Record<string, unknown>; limit?: number; offset?: number },
      context: Context<unknown>
    ): Promise<AuditLogEntry[]> => {
      const currentUser = await requireAuth(context);

      if (currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can view audit log");
      }

      return context.authService!.getAuditLog(args.where, args.limit, args.offset);
    },

    googleAuthUrl: (
      _parent: unknown,
      _args: unknown,
      context: Context<unknown>
    ): { url: string } => {
      if (!context.authService) {
        throw new Error("Auth service not configured");
      }
      return { url: context.authService.getGoogleAuthUrl() };
    },
  },

  Mutation: {
    googleAuth: async (
      _parent: unknown,
      args: { code: string },
      context: Context<unknown>
    ): Promise<{ token: string; user: AuthUser }> => {
      if (!context.authService) {
        throw new Error("Auth service not configured");
      }

      const ipAddress = context.ipAddress;
      const userAgent = context.userAgent;

      return context.authService.authenticateWithGoogle(args.code, ipAddress, userAgent);
    },

    logout: async (
      _parent: unknown,
      _args: unknown,
      context: Context<unknown>
    ): Promise<boolean> => {
      if (context.user?.id && context.authService) {
        await context.authService.logAudit({
          userId: new ObjectId(context.user.id),
          action: "LOGOUT",
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          timestamp: new Date(),
        });
      }
      return true;
    },

    inviteUser: async (
      _parent: unknown,
      args: { input: { email: string; name: string; role?: string; permissions?: { departmentId: string; accessLevel: string }[] } },
      context: Context<unknown>
    ): Promise<AuthUser> => {
      const currentUser = await requireAuth(context);

      if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "DEPT_ADMIN") {
        throw new Error("Unauthorized: Only admins can invite users");
      }

      if (args.input.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can create other super admins");
      }

      return context.authService!.inviteUser(
        args.input.email,
        args.input.name,
        (args.input.role as "SUPER_ADMIN" | "DEPT_ADMIN" | "USER") || "USER",
        new ObjectId(currentUser._id),
        args.input.permissions
      );
    },

    updateUser: async (
      _parent: unknown,
      args: { id: string; input: { name?: string; role?: string; status?: string } },
      context: Context<unknown>
    ): Promise<AuthUser> => {
      const currentUser = await requireAuth(context);

      if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "DEPT_ADMIN") {
        throw new Error("Unauthorized: Only admins can update users");
      }

      const targetUser = await context.authService!.getUserById(args.id);
      if (!targetUser) {
        throw new Error("User not found");
      }

      if (targetUser.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can modify other super admins");
      }

      if (args.input.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can grant super admin role");
      }

      const updates: Record<string, unknown> = {};
      if (args.input.name) updates.name = args.input.name;
      if (args.input.role) updates.role = args.input.role;
      if (args.input.status) updates.status = args.input.status;

      return context.authService!.updateUser(
        new ObjectId(args.id),
        updates as Partial<Pick<AuthUser, "name" | "role" | "status">>,
        new ObjectId(currentUser._id)
      );
    },

    deleteUser: async (
      _parent: unknown,
      args: { id: string },
      context: Context<unknown>
    ): Promise<boolean> => {
      const currentUser = await requireAuth(context);

      // Only super admins can delete users
      if (currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can delete users");
      }

      const targetUser = await context.authService!.getUserById(args.id);
      if (!targetUser) {
        throw new Error("User not found");
      }

      // Cannot delete yourself
      if (targetUser._id.toString() === currentUser._id.toString()) {
        throw new Error("Cannot delete your own account");
      }

      // Delete the user from the database
      await context.db.collection("users").deleteOne({ _id: new ObjectId(args.id) });

      // Delete all permissions for this user
      await context.db.collection("userPermissions").deleteMany({ userId: new ObjectId(args.id) });

      // Log the deletion
      await context.authService!.logAudit({
        userId: new ObjectId(currentUser._id),
        action: "USER_DELETE" as any,
        resourceType: "User",
        resourceId: new ObjectId(args.id),
        details: { email: targetUser.email, name: targetUser.name },
        timestamp: new Date(),
      });

      return true;
    },

    grantPermission: async (
      _parent: unknown,
      args: { input: { userId: string; departmentId: string; accessLevel: string } },
      context: Context<unknown>
    ): Promise<UserPermission> => {
      const currentUser = await requireAuth(context);

      if (currentUser.role === "USER") {
        throw new Error("Unauthorized: Only admins can grant permissions");
      }

      if (currentUser.role === "DEPT_ADMIN") {
        const canAdmin = await context.authService!.canAccessDepartment(
          new ObjectId(currentUser._id),
          new ObjectId(args.input.departmentId),
          "ADMIN"
        );
        if (!canAdmin) {
          throw new Error("Unauthorized: You don't have admin access to this department");
        }
      }

      const targetUser = await context.authService!.getUserById(args.input.userId);

      if (targetUser?.role === "DEPT_ADMIN" && args.input.accessLevel === "ADMIN") {
        await context.authService!.grantDeptAdminWithSubdepartments(
          new ObjectId(args.input.userId),
          new ObjectId(args.input.departmentId),
          new ObjectId(currentUser._id)
        );

        const permission = await context.authService!.getUserPermissions(new ObjectId(args.input.userId));
        return permission.find(p => p.departmentId.toString() === args.input.departmentId)!;
      }

      return context.authService!.grantPermission(
        new ObjectId(args.input.userId),
        new ObjectId(args.input.departmentId),
        args.input.accessLevel as "VIEW" | "EDIT" | "ADMIN",
        new ObjectId(currentUser._id)
      );
    },

    revokePermission: async (
      _parent: unknown,
      args: { input: { userId: string; departmentId: string } },
      context: Context<unknown>
    ): Promise<boolean> => {
      const currentUser = await requireAuth(context);

      if (currentUser.role === "USER") {
        throw new Error("Unauthorized: Only admins can revoke permissions");
      }

      if (currentUser.role === "DEPT_ADMIN") {
        const canAdmin = await context.authService!.canAccessDepartment(
          new ObjectId(currentUser._id),
          new ObjectId(args.input.departmentId),
          "ADMIN"
        );
        if (!canAdmin) {
          throw new Error("Unauthorized: You don't have admin access to this department");
        }
      }

      const targetUser = await context.authService!.getUserById(args.input.userId);

      if (targetUser?.role === "DEPT_ADMIN") {
        await context.authService!.revokeDeptAdminWithSubdepartments(
          new ObjectId(args.input.userId),
          new ObjectId(args.input.departmentId),
          new ObjectId(currentUser._id)
        );
        return true;
      }

      return context.authService!.revokePermission(
        new ObjectId(args.input.userId),
        new ObjectId(args.input.departmentId),
        new ObjectId(currentUser._id)
      );
    },
  },

  AuthUser: {
    id: (parent: AuthUser) => parent._id.toString(),
    departments: async (
      parent: AuthUser,
      _args: unknown,
      context: Context<unknown>
    ): Promise<UserPermission[]> => {
      try {
        const userId = (parent._id as any) instanceof ObjectId
          ? parent._id
          : new ObjectId((parent._id as any).toString());
        return context.authService!.getUserPermissions(userId);
      } catch (error) {
        console.error(`Error fetching permissions for user ${parent._id}:`, error);
        return [];
      }
    },
    invitedBy: async (
      parent: AuthUser,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser | null> => {
      if (!parent.invitedBy) return null;
      return context.authService!.getUserById(parent.invitedBy);
    },
  },

  UserPermission: {
    id: (parent: UserPermission) => parent._id.toString(),
    user: async (
      parent: UserPermission,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser> => {
      try {
        const userId = parent.userId instanceof ObjectId
          ? parent.userId
          : new ObjectId((parent.userId as any).toString());
        const user = await context.authService!.getUserById(userId);
        if (!user) {
          console.error(`UserPermission.user: User not found: ${userId}`);
          throw new Error(`User not found: ${userId}`);
        }
        return user;
      } catch (error) {
        console.error(`UserPermission.user error:`, error);
        throw error;
      }
    },
    department: async (
      parent: UserPermission,
      _args: unknown,
      context: Context<unknown>
    ) => {
      try {
        const deptId = parent.departmentId instanceof ObjectId
          ? parent.departmentId
          : new ObjectId((parent.departmentId as any).toString());
        const dept = await context.db.collection("departments").findOne({ _id: deptId });
        if (!dept) {
          console.error(`UserPermission.department: Department not found: ${deptId}`);
          throw new Error(`Department not found: ${deptId}`);
        }
        return dept;
      } catch (error) {
        console.error(`UserPermission.department error for deptId ${parent.departmentId}:`, error);
        throw error;
      }
    },
    grantedBy: async (
      parent: UserPermission,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser> => {
      try {
        const grantedById = parent.grantedBy instanceof ObjectId
          ? parent.grantedBy
          : new ObjectId((parent.grantedBy as any).toString());
        const user = await context.authService!.getUserById(grantedById);
        if (!user) {
          console.error(`UserPermission.grantedBy: User not found: ${grantedById}`);
          throw new Error(`GrantedBy user not found: ${grantedById}`);
        }
        return user;
      } catch (error) {
        console.error(`UserPermission.grantedBy error:`, error);
        throw error;
      }
    },
  },

  AuditLogEntry: {
    id: (parent: AuditLogEntry) => parent._id!.toString(),
    user: async (
      parent: AuditLogEntry,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser> => {
      const user = await context.authService!.getUserById(parent.userId);
      if (!user) {
        throw new Error(`User not found: ${parent.userId}`);
      }
      return user;
    },
  },
};

async function requireAuth(context: Context<unknown>): Promise<AuthUser> {
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

export { requireAuth };
