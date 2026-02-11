import { Db, ObjectId } from "mongodb";
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
export interface GoogleUserInfo {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    hd?: string;
}
export interface AuthUser {
    _id: ObjectId;
    email: string;
    googleId?: string;
    name: string;
    picture?: string;
    role: "SUPER_ADMIN" | "DEPT_ADMIN" | "USER";
    status: "INVITED" | "ACTIVE" | "DISABLED";
    invitedBy?: ObjectId;
    invitedAt?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
}
export interface UserPermission {
    _id: ObjectId;
    userId: ObjectId;
    departmentId: ObjectId;
    accessLevel: "VIEW" | "EDIT" | "ADMIN";
    grantedBy: ObjectId;
    grantedAt: Date;
}
export interface AuditLogEntry {
    _id?: ObjectId;
    userId: ObjectId;
    action: string;
    resourceType?: string;
    resourceId?: ObjectId;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}
export declare class AuthService {
    private oauth2Client;
    private jwtSecret;
    private db;
    constructor(db: Db, clientId: string, clientSecret: string, redirectUri: string);
    getGoogleAuthUrl(): string;
    authenticateWithGoogle(code: string, ipAddress?: string, userAgent?: string): Promise<{
        token: string;
        user: AuthUser;
    }>;
    generateToken(user: AuthUser): string;
    verifyToken(token: string): JWTPayload | null;
    getUserById(id: string | ObjectId): Promise<AuthUser | null>;
    getUserByEmail(email: string): Promise<AuthUser | null>;
    getUsers(where?: Record<string, unknown>): Promise<AuthUser[]>;
    inviteUser(email: string, name: string, role: "SUPER_ADMIN" | "DEPT_ADMIN" | "USER", invitedBy: ObjectId, permissions?: {
        departmentId: string;
        accessLevel: string;
    }[]): Promise<AuthUser>;
    updateUser(id: ObjectId, updates: Partial<Pick<AuthUser, "name" | "role" | "status">>, updatedBy: ObjectId): Promise<AuthUser>;
    getUserPermissions(userId: ObjectId): Promise<UserPermission[]>;
    grantPermission(userId: ObjectId, departmentId: ObjectId, accessLevel: "VIEW" | "EDIT" | "ADMIN", grantedBy: ObjectId): Promise<UserPermission>;
    revokePermission(userId: ObjectId, departmentId: ObjectId, revokedBy: ObjectId): Promise<boolean>;
    getAccessibleDepartmentIds(userId: ObjectId): Promise<ObjectId[]>;
    getSubdepartmentIds(parentDeptId: ObjectId): Promise<ObjectId[]>;
    grantDeptAdminWithSubdepartments(userId: ObjectId, departmentId: ObjectId, grantedBy: ObjectId): Promise<void>;
    revokeDeptAdminWithSubdepartments(userId: ObjectId, departmentId: ObjectId, revokedBy: ObjectId): Promise<void>;
    canAccessDepartment(userId: ObjectId, departmentId: ObjectId, requiredLevel?: "VIEW" | "EDIT" | "ADMIN"): Promise<boolean>;
    logAudit(entry: Omit<AuditLogEntry, "_id">): Promise<void>;
    getAuditLog(where?: Record<string, unknown>, limit?: number, offset?: number): Promise<AuditLogEntry[]>;
}
