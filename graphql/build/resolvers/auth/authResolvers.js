"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.authResolvers = void 0;
const mongodb_1 = require("mongodb");
exports.authResolvers = {
    Query: {
        me: (_parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (!((_a = context.user) === null || _a === void 0 ? void 0 : _a.id))
                return null;
            const authService = context.authService;
            if (!authService)
                return null;
            return authService.getUserById(context.user.id);
        }),
        users: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            if (currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can view user list");
            }
            return context.authService.getUsers(args.where);
        }),
        user: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            yield requireAuth(context);
            return context.authService.getUserById(args.id);
        }),
        auditLog: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            if (currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can view audit log");
            }
            return context.authService.getAuditLog(args.where, args.limit, args.offset);
        }),
        googleAuthUrl: (_parent, _args, context) => {
            if (!context.authService) {
                throw new Error("Auth service not configured");
            }
            return { url: context.authService.getGoogleAuthUrl() };
        },
    },
    Mutation: {
        googleAuth: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            if (!context.authService) {
                throw new Error("Auth service not configured");
            }
            const ipAddress = context.ipAddress;
            const userAgent = context.userAgent;
            return context.authService.authenticateWithGoogle(args.code, ipAddress, userAgent);
        }),
        logout: (_parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            if (((_b = context.user) === null || _b === void 0 ? void 0 : _b.id) && context.authService) {
                yield context.authService.logAudit({
                    userId: new mongodb_1.ObjectId(context.user.id),
                    action: "LOGOUT",
                    ipAddress: context.ipAddress,
                    userAgent: context.userAgent,
                    timestamp: new Date(),
                });
            }
            return true;
        }),
        inviteUser: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            // Check if user has permission to invite
            if (currentUser.role !== "SUPER_ADMIN" && !currentUser.canInviteUsers) {
                throw new Error("Unauthorized: You do not have permission to invite users");
            }
            return context.authService.inviteUser(args.input.email, args.input.name, args.input.role || "USER", args.input.canInviteUsers || false, new mongodb_1.ObjectId(currentUser._id), args.input.permissions);
        }),
        updateUser: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            // Only SUPER_ADMIN can update users
            if (currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can update users");
            }
            const targetUser = yield context.authService.getUserById(args.id);
            if (!targetUser) {
                throw new Error("User not found");
            }
            const updates = {};
            if (args.input.name)
                updates.name = args.input.name;
            if (args.input.role)
                updates.role = args.input.role;
            if (args.input.status)
                updates.status = args.input.status;
            if (args.input.canInviteUsers !== undefined)
                updates.canInviteUsers = args.input.canInviteUsers;
            return context.authService.updateUser(new mongodb_1.ObjectId(args.id), updates, new mongodb_1.ObjectId(currentUser._id));
        }),
        deleteUser: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            // Only super admins can delete users
            if (currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can delete users");
            }
            const targetUser = yield context.authService.getUserById(args.id);
            if (!targetUser) {
                throw new Error("User not found");
            }
            // Cannot delete yourself
            if (targetUser._id.toString() === currentUser._id.toString()) {
                throw new Error("Cannot delete your own account");
            }
            // Delete the user from the database
            yield context.db.collection("users").deleteOne({ _id: new mongodb_1.ObjectId(args.id) });
            // Delete all permissions for this user
            yield context.db.collection("userPermissions").deleteMany({ userId: new mongodb_1.ObjectId(args.id) });
            // Log the deletion
            yield context.authService.logAudit({
                userId: new mongodb_1.ObjectId(currentUser._id),
                action: "USER_DELETE",
                resourceType: "User",
                resourceId: new mongodb_1.ObjectId(args.id),
                details: { email: targetUser.email, name: targetUser.name },
                timestamp: new Date(),
            });
            return true;
        }),
        grantPermission: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            // Check if user has permission to grant access
            if (currentUser.role !== "SUPER_ADMIN") {
                // Non-super-admins need canInviteUsers permission
                if (!currentUser.canInviteUsers) {
                    throw new Error("Unauthorized: You don't have permission to grant access");
                }
                // Can only grant to departments they have access to
                const canAccess = yield context.authService.canAccessDepartment(new mongodb_1.ObjectId(currentUser._id), new mongodb_1.ObjectId(args.input.departmentId), "VIEW");
                if (!canAccess) {
                    throw new Error("Unauthorized: You don't have access to this department");
                }
                // Can only grant VIEW or EDIT (not ADMIN)
                if (args.input.accessLevel !== "VIEW" && args.input.accessLevel !== "EDIT") {
                    throw new Error("You can only grant VIEW or EDIT access");
                }
            }
            return context.authService.grantPermission(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), args.input.accessLevel, new mongodb_1.ObjectId(currentUser._id));
        }),
        revokePermission: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            // Only SUPER_ADMIN can revoke permissions
            if (currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can revoke permissions");
            }
            return context.authService.revokePermission(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), new mongodb_1.ObjectId(currentUser._id));
        }),
    },
    AuthUser: {
        id: (parent) => parent._id.toString(),
        canInviteUsers: (parent) => { var _a; return (_a = parent.canInviteUsers) !== null && _a !== void 0 ? _a : false; },
        departments: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const userId = parent._id instanceof mongodb_1.ObjectId
                    ? parent._id
                    : new mongodb_1.ObjectId(parent._id.toString());
                return context.authService.getUserPermissions(userId);
            }
            catch (error) {
                console.error(`Error fetching permissions for user ${parent._id}:`, error);
                return [];
            }
        }),
        invitedBy: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            if (!parent.invitedBy)
                return null;
            return context.authService.getUserById(parent.invitedBy);
        }),
    },
    UserPermission: {
        id: (parent) => parent._id.toString(),
        user: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const userId = parent.userId instanceof mongodb_1.ObjectId
                    ? parent.userId
                    : new mongodb_1.ObjectId(parent.userId.toString());
                const user = yield context.authService.getUserById(userId);
                if (!user) {
                    console.error(`UserPermission.user: User not found: ${userId}`);
                    throw new Error(`User not found: ${userId}`);
                }
                return user;
            }
            catch (error) {
                console.error(`UserPermission.user error:`, error);
                throw error;
            }
        }),
        department: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const deptId = parent.departmentId instanceof mongodb_1.ObjectId
                    ? parent.departmentId
                    : new mongodb_1.ObjectId(parent.departmentId.toString());
                const dept = yield context.db.collection("departments").findOne({ _id: deptId });
                if (!dept) {
                    console.error(`UserPermission.department: Department not found: ${deptId}`);
                    throw new Error(`Department not found: ${deptId}`);
                }
                return dept;
            }
            catch (error) {
                console.error(`UserPermission.department error for deptId ${parent.departmentId}:`, error);
                throw error;
            }
        }),
        grantedBy: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const grantedById = parent.grantedBy instanceof mongodb_1.ObjectId
                    ? parent.grantedBy
                    : new mongodb_1.ObjectId(parent.grantedBy.toString());
                const user = yield context.authService.getUserById(grantedById);
                if (!user) {
                    console.error(`UserPermission.grantedBy: User not found: ${grantedById}`);
                    throw new Error(`GrantedBy user not found: ${grantedById}`);
                }
                return user;
            }
            catch (error) {
                console.error(`UserPermission.grantedBy error:`, error);
                throw error;
            }
        }),
    },
    AuditLogEntry: {
        id: (parent) => parent._id.toString(),
        user: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield context.authService.getUserById(parent.userId);
            if (!user) {
                throw new Error(`User not found: ${parent.userId}`);
            }
            return user;
        }),
    },
};
function requireAuth(context) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!((_a = context.user) === null || _a === void 0 ? void 0 : _a.id)) {
            throw new Error("Unauthorized: Please log in");
        }
        if (!context.authService) {
            throw new Error("Auth service not configured");
        }
        const user = yield context.authService.getUserById(context.user.id);
        if (!user) {
            throw new Error("Unauthorized: User not found");
        }
        if (user.status === "DISABLED") {
            throw new Error("Unauthorized: Your account has been disabled");
        }
        return user;
    });
}
exports.requireAuth = requireAuth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYXV0aC9hdXRoUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUl0QixRQUFBLGFBQWEsR0FBRztJQUMzQixLQUFLLEVBQUU7UUFDTCxFQUFFLEVBQUUsQ0FDRixPQUFnQixFQUNoQixLQUFjLEVBQ2QsT0FBeUIsRUFDQyxFQUFFOztZQUM1QixJQUFJLENBQUMsQ0FBQSxNQUFBLE9BQU8sQ0FBQyxJQUFJLDBDQUFFLEVBQUUsQ0FBQTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNuQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzlCLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQTtRQUVELEtBQUssRUFBRSxDQUNMLE9BQWdCLEVBQ2hCLElBQXlDLEVBQ3pDLE9BQXlCLEVBQ0osRUFBRTtZQUN2QixNQUFNLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUFFO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7YUFDdkU7WUFFRCxPQUFPLE9BQU8sQ0FBQyxXQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUE7UUFFRCxJQUFJLEVBQUUsQ0FDSixPQUFnQixFQUNoQixJQUFvQixFQUNwQixPQUF5QixFQUNDLEVBQUU7WUFDNUIsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsT0FBTyxPQUFPLENBQUMs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