import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, Db, ObjectId } from "mongodb";

import { AccountingDb } from "../dataSources/accountingDb/accountingDb";
import {
  CategoryDbRecord,
  DepartmentDbRecord,
} from "../dataSources/accountingDb/types";
import { createLoaders } from "../loaders";
import { AuthService, AuthUser, UserPermission } from "../services/authService";
import { Context } from "../types";

export interface TestEnv {
  mongoServer: MongoMemoryServer;
  client: MongoClient;
  db: Db;
  accountingDb: AccountingDb;
  authService: AuthService;
}

export async function startTestEnv(): Promise<TestEnv> {
  const mongoServer = await MongoMemoryServer.create();
  const client = new MongoClient(mongoServer.getUri());
  await client.connect();
  const db = client.db("accounting");
  const accountingDb = new AccountingDb({ client });
  const authService = new AuthService(
    db,
    "test-client-id",
    "test-client-secret",
    "http://localhost/callback"
  );

  return { mongoServer, client, db, accountingDb, authService };
}

export async function stopTestEnv(env: TestEnv): Promise<void> {
  await env.client.close();
  await env.mongoServer.stop();
}

export function buildContext(env: TestEnv, userId?: ObjectId): Context {
  return {
    client: env.client,
    db: env.db,
    user: userId ? { id: userId } : undefined,
    reqDateTime: new Date(),
    authService: env.authService,
    ipAddress: "127.0.0.1",
    userAgent: "vitest",
    loaders: createLoaders(env.db),
    dataSources: { accountingDb: env.accountingDb },
  } as Context;
}

export async function createDepartment(
  db: Db,
  {
    name,
    parent,
  }: {
    name: string;
    parent?: { type: "Business" | "Department"; id: ObjectId };
  }
): Promise<ObjectId> {
  const doc: Omit<DepartmentDbRecord, "_id"> = {
    code: name.toUpperCase().replace(/\s+/g, "_"),
    name,
    parent: parent ?? { type: "Business", id: new ObjectId() },
  };

  const { insertedId } = await db.collection("departments").insertOne(doc);
  return insertedId;
}

export async function createCategory(
  db: Db,
  { name, type }: { name: string; type: "Credit" | "Debit" }
): Promise<ObjectId> {
  const doc: Omit<CategoryDbRecord, "_id"> = {
    name,
    code: name.toUpperCase().replace(/\s+/g, "_"),
    externalId: name,
    type,
    inactive: false,
    donation: false,
    active: true,
  };

  const { insertedId } = await db.collection("categories").insertOne(doc);
  return insertedId;
}

export async function createUser(
  db: Db,
  { email, role }: { email: string; role: "SUPER_ADMIN" | "USER" }
): Promise<ObjectId> {
  const doc: Omit<AuthUser, "_id"> = {
    email,
    name: email,
    role,
    status: "ACTIVE",
    canInviteUsers: false,
    createdAt: new Date(),
  };

  const { insertedId } = await db.collection("users").insertOne(doc);
  return insertedId;
}

export async function grantDeptAccess(
  db: Db,
  {
    userId,
    departmentId,
    accessLevel = "EDIT",
  }: {
    userId: ObjectId;
    departmentId: ObjectId;
    accessLevel?: "VIEW" | "EDIT";
  }
): Promise<void> {
  const doc: Omit<UserPermission, "_id"> = {
    userId,
    departmentId,
    accessLevel,
    grantedBy: userId,
    grantedAt: new Date(),
  };

  await db.collection("userPermissions").insertOne(doc);
}
