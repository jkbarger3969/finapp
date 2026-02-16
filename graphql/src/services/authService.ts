import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Db, ObjectId } from "mongodb";
import { sendInviteEmail } from "./emailService";

const ALLOWED_DOMAIN = "lonestarcowboychurch.org";
const SUPER_ADMINS = [
  "keithb@lonestarcowboychurch.org",
  "michaelp@lonestarcowboychurch.org",
];

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

export class AuthService {
  private oauth2Client: OAuth2Client;
  private jwtSecret: string;
  private db: Db;

  constructor(db: Db, clientId: string, clientSecret: string, redirectUri: string) {
    this.db = db;
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("FATAL: JWT_SECRET environment variable is required in production. Server cannot start without it.");
      }
      console.warn("⚠️  WARNING: JWT_SECRET not set. Using insecure default for development only.");
      this.jwtSecret = "dev-only-insecure-jwt-secret-do-not-use-in-production";
    } else {
      this.jwtSecret = jwtSecret;
    }
    
    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  getGoogleAuthUrl(): string {
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

  async authenticateWithGoogle(
    code: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ token: string; user: AuthUser }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: this.oauth2Client._clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const googleUser: GoogleUserInfo = {
      sub: payload.sub,
      email: payload.email!,
      name: payload.name || payload.email!,
      picture: payload.picture,
      hd: payload.hd,
    };

    if (googleUser.hd !== ALLOWED_DOMAIN) {
      throw new Error(
        `Access denied. Only ${ALLOWED_DOMAIN} accounts are allowed.`
      );
    }

    const usersCollection = this.db.collection<AuthUser>("users");
    let user = await usersCollection.findOne({ email: googleUser.email });

    if (!user) {
      // No user exists - check if they're a super admin who can self-register
      const isSuperAdmin = SUPER_ADMINS.includes(googleUser.email);

      if (!isSuperAdmin) {
        throw new Error(
          "Access denied. You have not been invited to use this application. Please contact an administrator."
        );
      }

      const newUser: Omit<AuthUser, "_id"> = {
        email: googleUser.email,
        googleId: googleUser.sub,
        name: googleUser.name,
        picture: googleUser.picture,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        lastLoginAt: new Date(),
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser as AuthUser);
      user = await usersCollection.findOne({ _id: result.insertedId });
    } else if (user.status === "INVITED") {
      // User was invited - activate their account on first login
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            googleId: googleUser.sub,
            name: googleUser.name,
            picture: googleUser.picture,
            status: "ACTIVE",
            lastLoginAt: new Date(),
          },
        }
      );
      user = await usersCollection.findOne({ _id: user._id });
    } else if (user.status === "DISABLED") {
      throw new Error(
        "Your account has been disabled. Please contact an administrator."
      );
    } else {
      // Existing active user - update their info on login
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            googleId: googleUser.sub,
            name: googleUser.name,
            picture: googleUser.picture,
            lastLoginAt: new Date(),
          },
        }
      );
      user = await usersCollection.findOne({ _id: user._id });
    }

    if (!user) {
      throw new Error("Failed to create or retrieve user");
    }

    await this.logAudit({
      userId: user._id,
      action: "LOGIN",
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    const token = this.generateToken(user);

    return { token, user };
  }

  generateToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: "7d" });
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch {
      return null;
    }
  }

  async getUserById(id: string | ObjectId): Promise<AuthUser | null> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return this.db.collection<AuthUser>("users").findOne({ _id: objectId });
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    return this.db.collection<AuthUser>("users").findOne({ email });
  }

  async getUsers(where?: Record<string, unknown>): Promise<AuthUser[]> {
    const filter: Record<string, unknown> = {};

    if (where?.role) {
      filter.role = where.role;
    }
    if (where?.status) {
      filter.status = where.status;
    }

    return this.db.collection<AuthUser>("users").find(filter).toArray();
  }

  async inviteUser(
    email: string,
    name: string,
    role: "SUPER_ADMIN" | "DEPT_ADMIN" | "USER" = "USER",
    invitedBy: ObjectId,
    permissions?: { departmentId: string; accessLevel: string }[]
  ): Promise<AuthUser> {
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      throw new Error(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
    }

    const existing = await this.getUserByEmail(email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const newUser: Omit<AuthUser, "_id"> = {
      email,
      name,
      role,
      status: "INVITED",
      invitedBy,
      invitedAt: new Date(),
      createdAt: new Date(),
    };

    const result = await this.db
      .collection<AuthUser>("users")
      .insertOne(newUser as AuthUser);

    await this.logAudit({
      userId: invitedBy,
      action: "USER_INVITE",
      resourceType: "User",
      resourceId: result.insertedId,
      details: { email, role },
      timestamp: new Date(),
    });

    const user = await this.getUserById(result.insertedId);
    if (!user) {
      throw new Error("Failed to create user");
    }

    // Grant permissions and gather details for email
    const emailPermissions: { departmentId: string; departmentName: string; accessLevel: "VIEW" | "EDIT" | "ADMIN" }[] = [];

    if (permissions && permissions.length > 0) {
      for (const p of permissions) {
        // Grant the permission
        await this.grantPermission(
          user._id,
          new ObjectId(p.departmentId),
          p.accessLevel as "VIEW" | "EDIT" | "ADMIN",
          invitedBy
        );

        // Get department name for email
        const dept = await this.db.collection("departments").findOne({ _id: new ObjectId(p.departmentId) });
        if (dept) {
          emailPermissions.push({
            departmentId: p.departmentId,
            departmentName: dept.name,
            accessLevel: p.accessLevel as "VIEW" | "EDIT" | "ADMIN"
          });
        }
      }
    }

    // Send invite email with detailed permissions
    const inviter = await this.getUserById(invitedBy);

    try {
      await sendInviteEmail({
        toEmail: email,
        toName: name,
        invitedByName: inviter?.name || "Administrator",
        role,
        permissions: emailPermissions,
      });
    } catch (error) {
      console.error("Failed to send invite email, but user was created:", error);
    }

    return user;
  }

  async updateUser(
    id: ObjectId,
    updates: Partial<Pick<AuthUser, "name" | "role" | "status">>,
    updatedBy: ObjectId
  ): Promise<AuthUser> {
    await this.db.collection<AuthUser>("users").updateOne({ _id: id }, { $set: updates });

    await this.logAudit({
      userId: updatedBy,
      action: "USER_UPDATE",
      resourceType: "User",
      resourceId: id,
      details: updates,
      timestamp: new Date(),
    });

    const user = await this.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getUserPermissions(userId: ObjectId): Promise<UserPermission[]> {
    return this.db
      .collection<UserPermission>("userPermissions")
      .find({ userId })
      .toArray();
  }

  async grantPermission(
    userId: ObjectId,
    departmentId: ObjectId,
    accessLevel: "VIEW" | "EDIT" | "ADMIN",
    grantedBy: ObjectId
  ): Promise<UserPermission> {
    const existing = await this.db
      .collection<UserPermission>("userPermissions")
      .findOne({ userId, departmentId });

    if (existing) {
      await this.db
        .collection<UserPermission>("userPermissions")
        .updateOne(
          { _id: existing._id },
          { $set: { accessLevel, grantedBy, grantedAt: new Date() } }
        );

      await this.logAudit({
        userId: grantedBy,
        action: "PERMISSION_GRANT",
        resourceType: "UserPermission",
        resourceId: existing._id,
        details: { userId: userId.toString(), departmentId: departmentId.toString(), accessLevel },
        timestamp: new Date(),
      });

      return (await this.db
        .collection<UserPermission>("userPermissions")
        .findOne({ _id: existing._id }))!;
    }

    const permission: Omit<UserPermission, "_id"> = {
      userId,
      departmentId,
      accessLevel,
      grantedBy,
      grantedAt: new Date(),
    };

    const result = await this.db
      .collection<UserPermission>("userPermissions")
      .insertOne(permission as UserPermission);

    await this.logAudit({
      userId: grantedBy,
      action: "PERMISSION_GRANT",
      resourceType: "UserPermission",
      resourceId: result.insertedId,
      details: { userId: userId.toString(), departmentId: departmentId.toString(), accessLevel },
      timestamp: new Date(),
    });

    return (await this.db
      .collection<UserPermission>("userPermissions")
      .findOne({ _id: result.insertedId }))!;
  }

  async revokePermission(
    userId: ObjectId,
    departmentId: ObjectId,
    revokedBy: ObjectId
  ): Promise<boolean> {
    const permission = await this.db
      .collection<UserPermission>("userPermissions")
      .findOne({ userId, departmentId });

    if (!permission) {
      return false;
    }

    await this.db
      .collection<UserPermission>("userPermissions")
      .deleteOne({ _id: permission._id });

    await this.logAudit({
      userId: revokedBy,
      action: "PERMISSION_REVOKE",
      resourceType: "UserPermission",
      resourceId: permission._id,
      details: { userId: userId.toString(), departmentId: departmentId.toString() },
      timestamp: new Date(),
    });

    return true;
  }

  async getAccessibleDepartmentIds(userId: ObjectId): Promise<ObjectId[]> {
    const user = await this.getUserById(userId);
    if (!user) return [];

    if (user.role === "SUPER_ADMIN") {
      return [];
    }

    const permissions = await this.getUserPermissions(userId);
    return permissions.map((p) => p.departmentId);
  }

  async getSubdepartmentIds(parentDeptId: ObjectId): Promise<ObjectId[]> {
    const subdepts: ObjectId[] = [];
    const queue: ObjectId[] = [parentDeptId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await this.db
        .collection("departments")
        .find({ "parent.type": "Department", "parent.id": currentId })
        .toArray();

      for (const child of children) {
        subdepts.push(child._id);
        queue.push(child._id);
      }
    }

    return subdepts;
  }

  async grantDeptAdminWithSubdepartments(
    userId: ObjectId,
    departmentId: ObjectId,
    grantedBy: ObjectId
  ): Promise<void> {
    await this.grantPermission(userId, departmentId, "ADMIN", grantedBy);

    const subdeptIds = await this.getSubdepartmentIds(departmentId);
    for (const subdeptId of subdeptIds) {
      await this.grantPermission(userId, subdeptId, "ADMIN", grantedBy);
    }
  }

  async revokeDeptAdminWithSubdepartments(
    userId: ObjectId,
    departmentId: ObjectId,
    revokedBy: ObjectId
  ): Promise<void> {
    await this.revokePermission(userId, departmentId, revokedBy);

    const subdeptIds = await this.getSubdepartmentIds(departmentId);
    for (const subdeptId of subdeptIds) {
      await this.revokePermission(userId, subdeptId, revokedBy);
    }
  }

  async canAccessDepartment(
    userId: ObjectId,
    departmentId: ObjectId,
    requiredLevel: "VIEW" | "EDIT" | "ADMIN" = "VIEW"
  ): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    if (user.role === "SUPER_ADMIN") return true;

    const permission = await this.db
      .collection<UserPermission>("userPermissions")
      .findOne({ userId, departmentId });

    if (!permission) return false;

    const levelHierarchy = { VIEW: 1, EDIT: 2, ADMIN: 3 };
    return levelHierarchy[permission.accessLevel] >= levelHierarchy[requiredLevel];
  }

  async logAudit(entry: Omit<AuditLogEntry, "_id">): Promise<void> {
    await this.db.collection<AuditLogEntry>("auditLog").insertOne(entry as AuditLogEntry);
  }

  async getAuditLog(
    where?: Record<string, unknown>,
    limit = 100,
    offset = 0
  ): Promise<AuditLogEntry[]> {
    const filter: Record<string, unknown> = {};

    if (where?.userId) {
      // Handle both { eq: "id" } format and direct string
      const userId = typeof where.userId === 'object' && (where.userId as any)?.eq
        ? (where.userId as any).eq
        : where.userId;
      filter.userId = new ObjectId(userId as string);
    }
    if (where?.action) {
      filter.action = where.action;
    }
    if (where?.resourceType) {
      filter.resourceType = where.resourceType;
    }
    if (where?.timestamp) {
      const timestampFilter = where.timestamp as Record<string, string>;
      filter.timestamp = {};
      if (timestampFilter.gte) {
        (filter.timestamp as any).$gte = new Date(timestampFilter.gte);
      }
      if (timestampFilter.lte) {
        (filter.timestamp as any).$lte = new Date(timestampFilter.lte);
      }
    }

    return this.db
      .collection<AuditLogEntry>("auditLog")
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }
}
