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
    inviteUser(email, name, role = "USER", invitedBy) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvYXV0aFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkRBQW1EO0FBQ25ELGdFQUErQjtBQUMvQixxQ0FBdUM7QUFFdkMsTUFBTSxjQUFjLEdBQUcsMEJBQTBCLENBQUM7QUFDbEQsTUFBTSxZQUFZLEdBQUc7SUFDbkIsaUNBQWlDO0lBQ2pDLG1DQUFtQztDQUNwQyxDQUFDO0FBbURGLE1BQWEsV0FBVztJQUt0QixZQUFZLEVBQU0sRUFBRSxRQUFnQixFQUFFLFlBQW9CLEVBQUUsV0FBbUI7UUFDN0UsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGdEQUFnRCxDQUFDO1FBQzVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxrQ0FBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELGdCQUFnQjtRQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUM7WUFDdkMsV0FBVyxFQUFFLFNBQVM7WUFDdEIsS0FBSyxFQUFFO2dCQUNMLGdEQUFnRDtnQkFDaEQsa0RBQWtEO2FBQ25EO1lBQ0QsRUFBRSxFQUFFLGNBQWM7WUFDbEIsTUFBTSxFQUFFLGdCQUFnQjtTQUN6QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUssc0JBQXNCLENBQzFCLElBQVksRUFDWixTQUFrQixFQUNsQixTQUFrQjs7WUFFbEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFekMs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