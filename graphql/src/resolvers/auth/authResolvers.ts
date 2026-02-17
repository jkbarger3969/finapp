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

      if (currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can view user list");
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
      args: { input: { email: string; name: string; role?: string; canInviteUsers?: boolean; permissions?: { departmentId: string; accessLevel: string }[] } },
      context: Context<unknown>
    ): Promise<AuthUser> => {
      const currentUser = await requireAuth(context);

      // Check if user has permission to invite
      if (currentUser.role !== "SUPER_ADMIN" && !currentUser.canInviteUsers) {
        throw new Error("Unauthorized: You do not have permission to invite users");
      }

      return context.authService!.inviteUser(
        args.input.email,
        args.input.name,
        (args.input.role as "SUPER_ADMIN" | "USER") || "USER",
        args.input.canInviteUsers || false,
        new ObjectId(currentUser._id),
        args.input.permissions
      );
    },

    updateUser: async (
      _parent: unknown,
      args: { id: string; input: { name?: string; role?: string; status?: string; canInviteUsers?: boolean } },
      context: Context<unknown>
    ): Promise<AuthUser> => {
      const currentUser = await requireAuth(context);

      // Only SUPER_ADMIN can update users
      if (currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can update users");
      }

      const targetUser = await context.authService!.getUserById(args.id);
      if (!targetUser) {
        throw new Error("User not found");
      }

      const updates: Record<string, unknown> = {};
      if (args.input.name) updates.name = args.input.name;
      if (args.input.role) updates.role = args.input.role;
      if (args.input.status) updates.status = args.input.status;
      if (args.input.canInviteUsers !== undefined) updates.canInviteUsers = args.input.canInviteUsers;

      return context.authService!.updateUser(
        new ObjectId(args.id),
        updates as Partial<Pick<AuthUser, "name" | "role" | "status" | "canInviteUsers">>,
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

      // Check if user has permission to grant access
      if (currentUser.role !== "SUPER_ADMIN") {
        // Non-super-admins need canInviteUsers permission
        if (!currentUser.canInviteUsers) {
          throw new Error("Unauthorized: You don't have permission to grant access");
        }
        
        // Can only grant to departments they have access to
        const canAccess = await context.authService!.canAccessDepartment(
          new ObjectId(currentUser._id),
          new ObjectId(args.input.departmentId),
          "VIEW"
        );
        if (!canAccess) {
          throw new Error("Unauthorized: You don't have access to this department");
        }
        
        // Can only grant VIEW or EDIT (not ADMIN)
        if (args.input.accessLevel !== "VIEW" && args.input.accessLevel !== "EDIT") {
          throw new Error("You can only grant VIEW or EDIT access");
        }
      }

      return context.authService!.grantPermission(
        new ObjectId(args.input.userId),
        new ObjectId(args.input.departmentId),
        args.input.accessLevel as "VIEW" | "EDIT",
        new ObjectId(currentUser._id)
      );
    },

    revokePermission: async (
      _parent: unknown,
      args: { input: { userId: string; departmentId: string } },
      context: Context<unknown>
    ): Promise<boolean> => {
      const currentUser = await requireAuth(context);

      // Only SUPER_ADMIN can revoke permissions
      if (currentUser.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized: Only super admins can revoke permissions");
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
    canInviteUsers: (parent: AuthUser) => parent.canInviteUsers ?? false,
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
          console.warn(`UserPermission.user: User not found: ${userId}`);
          return {
            _id: userId,
            email: 'deleted@user',
            name: 'Deleted User',
            role: 'USER',
            canInviteUsers: false,
            status: 'DISABLED',
            createdAt: new Date(),
          } as AuthUser;
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
          console.warn(`UserPermission.department: Department not found: ${deptId}`);
          return { _id: deptId, name: 'Deleted Department', parent: null };
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
      // Handle null/undefined grantedBy for old permissions
      if (!parent.grantedBy) {
        return {
          _id: new ObjectId(),
          email: 'system@user',
          name: 'System',
          role: 'USER',
          canInviteUsers: false,
          status: 'ACTIVE',
          createdAt: new Date(),
        } as AuthUser;
      }
      
      try {
        const grantedById = parent.grantedBy instanceof ObjectId
          ? parent.grantedBy
          : new ObjectId((parent.grantedBy as any).toString());
        const user = await context.authService!.getUserById(grantedById);
        if (!user) {
          console.warn(`UserPermission.grantedBy: User not found: ${grantedById}`);
          return {
            _id: grantedById,
            email: 'deleted@user',
            name: 'Deleted User',
            role: 'USER',
            canInviteUsers: false,
            status: 'DISABLED',
            createdAt: new Date(),
          } as AuthUser;
        }
        return user;
      } catch (error) {
        console.error(`UserPermission.grantedBy error:`, error);
        return {
          _id: new ObjectId(),
          email: 'unknown@user',
          name: 'Unknown User',
          role: 'USER',
          canInviteUsers: false,
          status: 'DISABLED',
          createdAt: new Date(),
        } as AuthUser;
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
        console.warn(`AuditLogEntry.user: User not found: ${parent.userId}`);
        return {
          _id: parent.userId,
          email: 'deleted@user',
          name: 'Deleted User',
          role: 'USER',
          canInviteUsers: false,
          status: 'DISABLED',
          createdAt: new Date(),
        } as AuthUser;
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
