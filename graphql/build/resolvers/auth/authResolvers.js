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
            if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "DEPT_ADMIN") {
                throw new Error("Unauthorized: Only admins can view user list");
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
            if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "DEPT_ADMIN") {
                throw new Error("Unauthorized: Only admins can invite users");
            }
            if (args.input.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can create other super admins");
            }
            return context.authService.inviteUser(args.input.email, args.input.name, args.input.role || "USER", new mongodb_1.ObjectId(currentUser._id), args.input.permissions);
        }),
        updateUser: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            if (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "DEPT_ADMIN") {
                throw new Error("Unauthorized: Only admins can update users");
            }
            const targetUser = yield context.authService.getUserById(args.id);
            if (!targetUser) {
                throw new Error("User not found");
            }
            if (targetUser.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can modify other super admins");
            }
            if (args.input.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized: Only super admins can grant super admin role");
            }
            const updates = {};
            if (args.input.name)
                updates.name = args.input.name;
            if (args.input.role)
                updates.role = args.input.role;
            if (args.input.status)
                updates.status = args.input.status;
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
            if (currentUser.role === "USER") {
                throw new Error("Unauthorized: Only admins can grant permissions");
            }
            if (currentUser.role === "DEPT_ADMIN") {
                const canAdmin = yield context.authService.canAccessDepartment(new mongodb_1.ObjectId(currentUser._id), new mongodb_1.ObjectId(args.input.departmentId), "ADMIN");
                if (!canAdmin) {
                    throw new Error("Unauthorized: You don't have admin access to this department");
                }
            }
            const targetUser = yield context.authService.getUserById(args.input.userId);
            if ((targetUser === null || targetUser === void 0 ? void 0 : targetUser.role) === "DEPT_ADMIN" && args.input.accessLevel === "ADMIN") {
                yield context.authService.grantDeptAdminWithSubdepartments(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), new mongodb_1.ObjectId(currentUser._id));
                const permission = yield context.authService.getUserPermissions(new mongodb_1.ObjectId(args.input.userId));
                return permission.find(p => p.departmentId.toString() === args.input.departmentId);
            }
            return context.authService.grantPermission(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), args.input.accessLevel, new mongodb_1.ObjectId(currentUser._id));
        }),
        revokePermission: (_parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const currentUser = yield requireAuth(context);
            if (currentUser.role === "USER") {
                throw new Error("Unauthorized: Only admins can revoke permissions");
            }
            if (currentUser.role === "DEPT_ADMIN") {
                const canAdmin = yield context.authService.canAccessDepartment(new mongodb_1.ObjectId(currentUser._id), new mongodb_1.ObjectId(args.input.departmentId), "ADMIN");
                if (!canAdmin) {
                    throw new Error("Unauthorized: You don't have admin access to this department");
                }
            }
            const targetUser = yield context.authService.getUserById(args.input.userId);
            if ((targetUser === null || targetUser === void 0 ? void 0 : targetUser.role) === "DEPT_ADMIN") {
                yield context.authService.revokeDeptAdminWithSubdepartments(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), new mongodb_1.ObjectId(currentUser._id));
                return true;
            }
            return context.authService.revokePermission(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), new mongodb_1.ObjectId(currentUser._id));
        }),
    },
    AuthUser: {
        id: (parent) => parent._id.toString(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvYXV0aC9hdXRoUmVzb2x2ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHFDQUFtQztBQUl0QixRQUFBLGFBQWEsR0FBRztJQUMzQixLQUFLLEVBQUU7UUFDTCxFQUFFLEVBQUUsQ0FDRixPQUFnQixFQUNoQixLQUFjLEVBQ2QsT0FBeUIsRUFDQyxFQUFFOztZQUM1QixJQUFJLENBQUMsQ0FBQSxNQUFBLE9BQU8sQ0FBQyxJQUFJLDBDQUFFLEVBQUUsQ0FBQTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNuQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzlCLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQTtRQUVELEtBQUssRUFBRSxDQUNMLE9BQWdCLEVBQ2hCLElBQXlDLEVBQ3pDLE9BQXlCLEVBQ0osRUFBRTtZQUN2QixNQUFNLFdBQVcsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssYUFBYSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO2dCQUMzRSxNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7YUFDakU7WUFFRCxPQUFPLE9BQU8sQ0FBQyxXQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUE7UUFFRCxJQUFJLEVBQUUsQ0FDSixPQUFnQixFQUNoQixJQUFvQixFQUNwQixPQUF5QixFQUNDLEVBQUU7WUFDNUIsTUFBTSxXQUFXLENBQUMsT0FBTyxD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