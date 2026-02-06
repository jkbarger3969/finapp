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
      args: { input: { email: string; name: string; role?: string; departmentIds?: string[] } },
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
        args.input.departmentIds
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
      return context.authService!.getUserPermissions(parent._id);
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
    ): Promise<AuthUser | null> => {
      return context.authService!.getUserById(parent.userId);
    },
    department: async (
      parent: UserPermission,
      _args: unknown,
      context: Context<unknown>
    ) => {
      return context.db.collection("departments").findOne({ _id: parent.departmentId });
    },
    grantedBy: async (
      parent: UserPermission,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser | null> => {
      return context.authService!.getUserById(parent.grantedBy);
    },
  },

  AuditLogEntry: {
    id: (parent: AuditLogEntry) => parent._id!.toString(),
    user: async (
      parent: AuditLogEntry,
      _args: unknown,
      context: Context<unknown>
    ): Promise<AuthUser | null> => {
      return context.authService!.getUserById(parent.userId);
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
