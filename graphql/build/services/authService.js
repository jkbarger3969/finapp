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
                const existingInvite = yield usersCollection.findOne({
                    email: googleUser.email,
                    status: "INVITED",
                });
                if (existingInvite) {
                    yield usersCollection.updateOne({ _id: existingInvite._id }, {
                        $set: {
                            googleId: googleUser.sub,
                            name: googleUser.name,
                            picture: googleUser.picture,
                            status: "ACTIVE",
                            lastLoginAt: new Date(),
                        },
                    });
                    user = yield usersCollection.findOne({ _id: existingInvite._id });
                }
                else {
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
            }
            else {
                if (user.status === "DISABLED") {
                    throw new Error("Your account has been disabled. Please contact an administrator.");
                }
                yield usersCollection.updateOne({ _id: user._id }, {
                    $set: Object.assign({ googleId: googleUser.sub, name: googleUser.name, picture: googleUser.picture, lastLoginAt: new Date() }, (user.status === "INVITED" ? { status: "ACTIVE" } : {})),
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