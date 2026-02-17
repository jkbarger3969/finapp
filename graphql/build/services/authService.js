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
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("FATAL: JWT_SECRET environment variable is required in production. Server cannot start without it.");
            }
            console.warn("⚠️  WARNING: JWT_SECRET not set. Using insecure default for development only.");
            this.jwtSecret = "dev-only-insecure-jwt-secret-do-not-use-in-production";
        }
        else {
            this.jwtSecret = jwtSecret;
        }
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
                    canInviteUsers: true,
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
    inviteUser(email, name, role = "USER", canInviteUsers = false, invitedBy, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
                throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
            }
            const existing = yield this.getUserByEmail(email);
            if (existing) {
                throw new Error("User with this email already exists");
            }
            // Get inviter to check their permissions
            const inviter = yield this.getUserById(invitedBy);
            if (!inviter) {
                throw new Error("Inviter not found");
            }
            // Non-SUPER_ADMIN inviters have restrictions
            if (inviter.role !== "SUPER_ADMIN") {
                // Must have canInviteUsers permission
                if (!inviter.canInviteUsers) {
                    throw new Error("You do not have permission to invite users");
                }
                // Cannot set role to SUPER_ADMIN
                if (role === "SUPER_ADMIN") {
                    throw new Error("Only Super Admins can create other Super Admins");
                }
                // Cannot grant canInviteUsers permission
                if (canInviteUsers) {
                    throw new Error("Only Super Admins can grant invite permissions");
                }
                // Can only assign departments they have access to
                if (permissions && permissions.length > 0) {
                    const inviterPermissions = yield this.getUserPermissions(invitedBy);
                    const inviterDeptIds = new Set(inviterPermissions.map(p => p.departmentId.toString()));
                    for (const p of permissions) {
                        if (!inviterDeptIds.has(p.departmentId)) {
                            throw new Error(`You do not have access to department ${p.departmentId}`);
                        }
                        // Can only assign VIEW or EDIT
                        if (p.accessLevel !== "VIEW" && p.accessLevel !== "EDIT") {
                            throw new Error("You can only assign VIEW or EDIT access levels");
                        }
                    }
                }
            }
            const newUser = {
                email,
                name,
                role,
                status: "INVITED",
                canInviteUsers: inviter.role === "SUPER_ADMIN" ? canInviteUsers : false,
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
            // Send invite email with detailed permissions (inviter already fetched above)
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
            // Get the updater to check permissions
            const updater = yield this.getUserById(updatedBy);
            if (!updater) {
                throw new Error("Updater not found");
            }
            // Only SUPER_ADMIN can update users
            if (updater.role !== "SUPER_ADMIN") {
                throw new Error("Only Super Admins can update user profiles");
            }
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
            const levelHierarchy = { VIEW: 1, EDIT: 2 };
            return levelHierarchy[permission.accessLevel] >= levelHierarchy[requiredLevel];
        });
    }
    logAudit(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.collection("auditLog").insertOne(entry);
        });
    }
    getAuditLog(where, limit = 100, offset = 0) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {};
            if (where === null || where === void 0 ? void 0 : where.userId) {
                // Handle both { eq: "id" } format and direct string
                const userId = typeof where.userId === 'object' && ((_a = where.userId) === null || _a === void 0 ? void 0 : _a.eq)
                    ? where.userId.eq
                    : where.userId;
                filter.userId = new mongodb_1.ObjectId(userId);
            }
            if (where === null || where === void 0 ? void 0 : where.action) {
                filter.action = where.action;
            }
            if (where === null || where === void 0 ? void 0 : where.resourceType) {
                filter.resourceType = where.resourceType;
            }
            if (where === null || where === void 0 ? void 0 : where.timestamp) {
                const timestampFilter = where.timestamp;
                filter.timestamp = {};
                if (timestampFilter.gte) {
                    filter.timestamp.$gte = new Date(timestampFilter.gte);
                }
                if (timestampFilter.lte) {
                    filter.timestamp.$lte = new Date(timestampFilter.lte);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvYXV0aFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkRBQW1EO0FBQ25ELGdFQUErQjtBQUMvQixxQ0FBdUM7QUFDdkMsaURBQWlEO0FBRWpELE1BQU0sY0FBYyxHQUFHLDBCQUEwQixDQUFDO0FBQ2xELE1BQU0sWUFBWSxHQUFHO0lBQ25CLGlDQUFpQztJQUNqQyxtQ0FBbUM7Q0FDcEMsQ0FBQztBQW9ERixNQUFhLFdBQVc7SUFLdEIsWUFBWSxFQUFNLEVBQUUsUUFBZ0IsRUFBRSxZQUFvQixFQUFFLFdBQW1CO1FBQzdFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRWIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNkLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFO2dCQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLG1HQUFtRyxDQUFDLENBQUM7YUFDdEg7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLCtFQUErRSxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLFNBQVMsR0FBRyx1REFBdUQsQ0FBQztTQUMxRTthQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDNUI7UUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksa0NBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO1lBQ3ZDLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRTtnQkFDTCxnREFBZ0Q7Z0JBQ2hELGtEQUFrRDthQUNuRDtZ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