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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const emailService_1 = require("./emailService");
const ALLOWED_DOMAIN = "lonestarcowboychurch.org";
const SUPER_ADMINS = [
    "keithb@lonestarcowboychurch.org",
    "michaelp@lonestarcowboychurch.org",
];
class AuthService {
    constructor(db, clientId, clientSecret, redirectUri) {
        this.db = db;
        this.jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
        this.oauth2Client = new google_auth_library_1.OAuth2Client(clientId, clientSecret, redirectUri);
    }
    getGoogleAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ],
            hd: ALLOWED_DOMAIN,
            prompt: "select_account",
        });
    }
    authenticateWithGoogle(code, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokens } = yield this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            const ticket = yield this.oauth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: this.oauth2Client._clientId,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error("Invalid Google token");
            }
            const googleUser = {
                sub: payload.sub,
                email: payload.email,
                name: payload.name || payload.email,
                picture: payload.picture,
                hd: payload.hd,
            };
            if (googleUser.hd !== ALLOWED_DOMAIN) {
                throw new Error(`Access denied. Only ${ALLOWED_DOMAIN} accounts are allowed.`);
            }
            const usersCollection = this.db.collection("users");
            let user = yield usersCollection.findOne({ email: googleUser.email });
            if (!user) {
                // No user exists - check if they're a super admin who can self-register
                const isSuperAdmin = SUPER_ADMINS.includes(googleUser.email);
                if (!isSuperAdmin) {
                    throw new Error("Access denied. You have not been invited to use this application. Please contact an administrator.");
                }
                const newUser = {
                    email: googleUser.email,
                    googleId: googleUser.sub,
                    name: googleUser.name,
                    picture: googleUser.picture,
                    role: "SUPER_ADMIN",
                    status: "ACTIVE",
                    lastLoginAt: new Date(),
                    createdAt: new Date(),
                };
                const result = yield usersCollection.insertOne(newUser);
                user = yield usersCollection.findOne({ _id: result.insertedId });
            }
            else if (user.status === "INVITED") {
                // User was invited - activate their account on first login
                yield usersCollection.updateOne({ _id: user._id }, {
                    $set: {
                        googleId: googleUser.sub,
                        name: googleUser.name,
                        picture: googleUser.picture,
                        status: "ACTIVE",
                        lastLoginAt: new Date(),
                    },
                });
                user = yield usersCollection.findOne({ _id: user._id });
            }
            else if (user.status === "DISABLED") {
                throw new Error("Your account has been disabled. Please contact an administrator.");
            }
            else {
                // Existing active user - update their info on login
                yield usersCollection.updateOne({ _id: user._id }, {
                    $set: {
                        googleId: googleUser.sub,
                        name: googleUser.name,
                        picture: googleUser.picture,
                        lastLoginAt: new Date(),
                    },
                });
                user = yield usersCollection.findOne({ _id: user._id });
            }
            if (!user) {
                throw new Error("Failed to create or retrieve user");
            }
            yield this.logAudit({
                userId: user._id,
                action: "LOGIN",
                ipAddress,
                userAgent,
                timestamp: new Date(),
            });
            const token = this.generateToken(user);
            return { token, user };
        });
    }
    generateToken(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, { expiresIn: "7d" });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.jwtSecret);
        }
        catch (_a) {
            return null;
        }
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectId = typeof id === "string" ? new mongodb_1.ObjectId(id) : id;
            return this.db.collection("users").findOne({ _id: objectId });
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.collection("users").findOne({ email });
        });
    }
    getUsers(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {};
            if (where === null || where === void 0 ? void 0 : where.role) {
                filter.role = where.role;
            }
            if (where === null || where === void 0 ? void 0 : where.status) {
                filter.status = where.status;
            }
            return this.db.collection("users").find(filter).toArray();
        });
    }
    inviteUser(email, name, role = "USER", invitedBy, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
                throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
            }
            const existing = yield this.getUserByEmail(email);
            if (existing) {
                throw new Error("User with this email already exists");
            }
            const newUser = {
                email,
                name,
                role,
                status: "INVITED",
                invitedBy,
                invitedAt: new Date(),
                createdAt: new Date(),
            };
            const result = yield this.db
                .collection("users")
                .insertOne(newUser);
            yield this.logAudit({
                userId: invitedBy,
                action: "USER_INVITE",
                resourceType: "User",
                resourceId: result.insertedId,
                details: { email, role },
                timestamp: new Date(),
            });
            const user = yield this.getUserById(result.insertedId);
            if (!user) {
                throw new Error("Failed to create user");
            }
            // Grant permissions and gather details for email
            const emailPermissions = [];
            if (permissions && permissions.length > 0) {
                for (const p of permissions) {
                    // Grant the permission
                    yield this.grantPermission(user._id, new mongodb_1.ObjectId(p.departmentId), p.accessLevel, invitedBy);
                    // Get department name for email
                    const dept = yield this.db.collection("departments").findOne({ _id: new mongodb_1.ObjectId(p.departmentId) });
                    if (dept) {
                        emailPermissions.push({
                            departmentId: p.departmentId,
                            departmentName: dept.name,
                            accessLevel: p.accessLevel
                        });
                    }
                }
            }
            // Send invite email with detailed permissions
            const inviter = yield this.getUserById(invitedBy);
            try {
                yield (0, emailService_1.sendInviteEmail)({
                    toEmail: email,
                    toName: name,
                    invitedByName: (inviter === null || inviter === void 0 ? void 0 : inviter.name) || "Administrator",
                    role,
                    permissions: emailPermissions,
                });
            }
            catch (error) {
                console.error("Failed to send invite email, but user was created:", error);
            }
            return user;
        });
    }
    updateUser(id, updates, updatedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.collection("users").updateOne({ _id: id }, { $set: updates });
            yield this.logAudit({
                userId: updatedBy,
                action: "USER_UPDATE",
                resourceType: "User",
                resourceId: id,
                details: updates,
                timestamp: new Date(),
            });
            const user = yield this.getUserById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        });
    }
    getUserPermissions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db
                .collection("userPermissions")
                .find({ userId })
                .toArray();
        });
    }
    grantPermission(userId, departmentId, accessLevel, grantedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.db
                .collection("userPermissions")
                .findOne({ userId, departmentId });
            if (existing) {
                yield this.db
                    .collection("userPermissions")
                    .updateOne({ _id: existing._id }, { $set: { accessLevel, grantedBy, grantedAt: new Date() } });
                yield this.logAudit({
                    userId: grantedBy,
                    action: "PERMISSION_GRANT",
                    resourceType: "UserPermission",
                    resourceId: existing._id,
                    details: { userId: userId.toString(), departmentId: departmentId.toString(), accessLevel },
                    timestamp: new Date(),
                });
                return (yield this.db
                    .collection("userPermissions")
                    .findOne({ _id: existing._id }));
            }
            const permission = {
                userId,
                departmentId,
                accessLevel,
                grantedBy,
                grantedAt: new Date(),
            };
            const result = yield this.db
                .collection("userPermissions")
                .insertOne(permission);
            yield this.logAudit({
                userId: grantedBy,
                action: "PERMISSION_GRANT",
                resourceType: "UserPermission",
                resourceId: result.insertedId,
                details: { userId: userId.toString(), departmentId: departmentId.toString(), accessLevel },
                timestamp: new Date(),
            });
            return (yield this.db
                .collection("userPermissions")
                .findOne({ _id: result.insertedId }));
        });
    }
    revokePermission(userId, departmentId, revokedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const permission = yield this.db
                .collection("userPermissions")
                .findOne({ userId, departmentId });
            if (!permission) {
                return false;
            }
            yield this.db
                .collection("userPermissions")
                .deleteOne({ _id: permission._id });
            yield this.logAudit({
                userId: revokedBy,
                action: "PERMISSION_REVOKE",
                resourceType: "UserPermission",
                resourceId: permission._id,
                details: { userId: userId.toString(), departmentId: departmentId.toString() },
                timestamp: new Date(),
            });
            return true;
        });
    }
    getAccessibleDepartmentIds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserById(userId);
            if (!user)
                return [];
            if (user.role === "SUPER_ADMIN") {
                return [];
            }
            const permissions = yield this.getUserPermissions(userId);
            return permissions.map((p) => p.departmentId);
        });
    }
    getSubdepartmentIds(parentDeptId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subdepts = [];
            const queue = [parentDeptId];
            while (queue.length > 0) {
                const currentId = queue.shift();
                const children = yield this.db
                    .collection("departments")
                    .find({ "parent.type": "Department", "parent.id": currentId })
                    .toArray();
                for (const child of children) {
                    subdepts.push(child._id);
                    queue.push(child._id);
                }
            }
            return subdepts;
        });
    }
    grantDeptAdminWithSubdepartments(userId, departmentId, grantedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.grantPermission(userId, departmentId, "ADMIN", grantedBy);
            const subdeptIds = yield this.getSubdepartmentIds(departmentId);
            for (const subdeptId of subdeptIds) {
                yield this.grantPermission(userId, subdeptId, "ADMIN", grantedBy);
            }
        });
    }
    revokeDeptAdminWithSubdepartments(userId, departmentId, revokedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.revokePermission(userId, departmentId, revokedBy);
            const subdeptIds = yield this.getSubdepartmentIds(departmentId);
            for (const subdeptId of subdeptIds) {
                yield this.revokePermission(userId, subdeptId, revokedBy);
            }
        });
    }
    canAccessDepartment(userId, departmentId, requiredLevel = "VIEW") {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserById(userId);
            if (!user)
                return false;
            if (user.role === "SUPER_ADMIN")
                return true;
            const permission = yield this.db
                .collection("userPermissions")
                .findOne({ userId, departmentId });
            if (!permission)
                return false;
            const levelHierarchy = { VIEW: 1, EDIT: 2, ADMIN: 3 };
            return levelHierarchy[permission.accessLevel] >= levelHierarchy[requiredLevel];
        });
    }
    logAudit(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.collection("auditLog").insertOne(entry);
        });
    }
    getAuditLog(where, limit = 100, offset = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {};
            if (where === null || where === void 0 ? void 0 : where.userId) {
                filter.userId = new mongodb_1.ObjectId(where.userId);
            }
            if (where === null || where === void 0 ? void 0 : where.action) {
                filter.action = where.action;
            }
            if (where === null || where === void 0 ? void 0 : where.resourceType) {
                filter.resourceType = where.resourceType;
            }
            return this.db
                .collection("auditLog")
                .find(filter)
                .sort({ timestamp: -1 })
                .skip(offset)
                .limit(limit)
                .toArray();
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvYXV0aFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkRBQW1EO0FBQ25ELGdFQUErQjtBQUMvQixxQ0FBdUM7QUFDdkMsaURBQWlEO0FBRWpELE1BQU0sY0FBYyxHQUFHLDBCQUEwQixDQUFDO0FBQ2xELE1BQU0sWUFBWSxHQUFHO0lBQ25CLGlDQUFpQztJQUNqQyxtQ0FBbUM7Q0FDcEMsQ0FBQztBQW1ERixNQUFhLFdBQVc7SUFLdEIsWUFBWSxFQUFNLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQixFQUFFLFdBQW1CO1FBQzdFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxnREFBZ0QsQ0FBQztRQUM1RixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksa0NBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO1lBQ3ZDLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRTtnQkFDTCxnREFBZ0Q7Z0JBQ2hELGtEQUFrRDthQUNuRDtZQUNELEVBQUUsRUFBRSxjQUFjO1lBQ2xCLE1BQU0sRUFBRSxnQkFBZ0I7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVLLHNCQUFzQixDQUMxQixJQUFZLEVBQ1osU0FBa0IsRUFDbEIsU0FBa0I7O1lBRWxCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FB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