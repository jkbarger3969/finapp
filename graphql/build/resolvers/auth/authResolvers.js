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
            return context.authService.inviteUser(args.input.email, args.input.name, args.input.role || "USER", new mongodb_1.ObjectId(currentUser._id));
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
            return context.authService.revokePermission(new mongodb_1.ObjectId(args.input.userId), new mongodb_1.ObjectId(args.input.departmentId), new mongodb_1.ObjectId(currentUser._id));
        }),
    },
    AuthUser: {
        id: (parent) => parent._id.toString(),
        departments: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            return context.authService.getUserPermissions(parent._id);
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
            return context.authService.getUserById(parent.userId);
        }),
        department: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            return context.db.collection("departments").findOne({ _id: parent.departmentId });
        }),
        grantedBy: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            return context.authService.getUserById(parent.grantedBy);
        }),
    },
    AuditLogEntry: {
        id: (parent) => parent._id.toString(),
        user: (parent, _args, context) => __awaiter(void 0, void 0, void 0, function* () {
            return context.authService.getUserById(parent.userId);
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