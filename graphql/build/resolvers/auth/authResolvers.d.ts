import { Context } from "../../types";
import { AuthUser, UserPermission, AuditLogEntry } from "../../services/authService";
export declare const authResolvers: {
    Query: {
        me: (_parent: unknown, _args: unknown, context: Context<unknown>) => Promise<AuthUser | null>;
        users: (_parent: unknown, args: {
            where?: Record<string, unknown>;
        }, context: Context<unknown>) => Promise<AuthUser[]>;
        user: (_parent: unknown, args: {
            id: string;
        }, context: Context<unknown>) => Promise<AuthUser | null>;
        auditLog: (_parent: unknown, args: {
            where?: Record<string, unknown>;
            limit?: number;
            offset?: number;
        }, context: Context<unknown>) => Promise<AuditLogEntry[]>;
        googleAuthUrl: (_parent: unknown, _args: unknown, context: Context<unknown>) => {
            url: string;
        };
    };
    Mutation: {
        googleAuth: (_parent: unknown, args: {
            code: string;
        }, context: Context<unknown>) => Promise<{
            token: string;
            user: AuthUser;
        }>;
        logout: (_parent: unknown, _args: unknown, context: Context<unknown>) => Promise<boolean>;
        inviteUser: (_parent: unknown, args: {
            input: {
                email: string;
                name: string;
                role?: string;
            };
        }, context: Context<unknown>) => Promise<AuthUser>;
        updateUser: (_parent: unknown, args: {
            id: string;
            input: {
                name?: string;
                role?: string;
                status?: string;
            };
        }, context: Context<unknown>) => Promise<AuthUser>;
        grantPermission: (_parent: unknown, args: {
            input: {
                userId: string;
                departmentId: string;
                accessLevel: string;
            };
        }, context: Context<unknown>) => Promise<UserPermission>;
        revokePermission: (_parent: unknown, args: {
            input: {
                userId: string;
                departmentId: string;
            };
        }, context: Context<unknown>) => Promise<boolean>;
    };
    AuthUser: {
        id: (parent: AuthUser) => string;
        departments: (parent: AuthUser, _args: unknown, context: Context<unknown>) => Promise<UserPermission[]>;
        invitedBy: (parent: AuthUser, _args: unknown, context: Context<unknown>) => Promise<AuthUser | null>;
    };
    UserPermission: {
        id: (parent: UserPermission) => string;
        user: (parent: UserPermission, _args: unknown, context: Context<unknown>) => Promise<AuthUser | null>;
        department: (parent: UserPermission, _args: unknown, context: Context<unknown>) => Promise<import("mongodb").WithId<import("bson").Document>>;
        grantedBy: (parent: UserPermission, _args: unknown, context: Context<unknown>) => Promise<AuthUser | null>;
    };
    AuditLogEntry: {
        id: (parent: AuditLogEntry) => string;
        user: (parent: AuditLogEntry, _args: unknown, context: Context<unknown>) => Promise<AuthUser | null>;
    };
};
declare function requireAuth(context: Context<unknown>): Promise<AuthUser>;
export { requireAuth };
