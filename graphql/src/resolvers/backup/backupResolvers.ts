import { ObjectId } from "mongodb";
import path from "path";

import { MutationResolvers, QueryResolvers } from "../../graphTypes";
import { Context } from "../../types";
import {
  BackupConfig,
  createBackupArchive,
  deleteBackupArchive,
  listBackups,
  restoreFromArchive,
  verifyBackupArchive,
} from "../../services/backupService";
import { requireAuth } from "../auth/authResolvers";

const RESTORE_CONFIRMATION_PHRASE = "RESTORE ALL DATA";

function getBackupConfig(): BackupConfig {
  const baseDir = process.env.BACKUP_STORAGE_PATH || "/tmp/backups";
  return {
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: process.env.DB_PORT || "27017",
    dbName: "accounting",
    archivesDir: path.join(baseDir, "archives"),
    tmpDir: path.join(baseDir, "tmp"),
  };
}

async function requireSuperAdmin(context: Context<unknown>) {
  const currentUser = await requireAuth(context);
  if (currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only super admins can manage backups");
  }
  return currentUser;
}

export const backups: QueryResolvers["backups"] = async (_, __, context) => {
  await requireSuperAdmin(context);
  return listBackups(getBackupConfig());
};

export const createBackup: MutationResolvers["createBackup"] = async (_, __, context) => {
  const currentUser = await requireSuperAdmin(context);
  const config = getBackupConfig();

  const backup = await createBackupArchive(config, "manual");
  const verification = await verifyBackupArchive(config, backup.filename);

  await context.authService!.logAudit({
    userId: new ObjectId(currentUser._id),
    action: "DATA_BACKUP" as any,
    resourceType: "Database",
    details: { filename: backup.filename, sizeBytes: backup.sizeBytes, verified: verification.ok },
    timestamp: new Date(),
  });

  return { backup, verification };
};

export const verifyBackup: MutationResolvers["verifyBackup"] = async (_, { filename }, context) => {
  await requireSuperAdmin(context);
  return verifyBackupArchive(getBackupConfig(), filename);
};

export const deleteBackup: MutationResolvers["deleteBackup"] = async (_, { filename }, context) => {
  const currentUser = await requireSuperAdmin(context);

  await deleteBackupArchive(getBackupConfig(), filename);

  await context.authService!.logAudit({
    userId: new ObjectId(currentUser._id),
    action: "DATA_BACKUP_DELETE" as any,
    resourceType: "Database",
    details: { filename },
    timestamp: new Date(),
  });

  return true;
};

export const restoreBackup: MutationResolvers["restoreBackup"] = async (
  _,
  { filename, confirmationPhrase },
  context
) => {
  const currentUser = await requireSuperAdmin(context);

  if (confirmationPhrase !== RESTORE_CONFIRMATION_PHRASE) {
    throw new Error(`Confirmation phrase must be exactly "${RESTORE_CONFIRMATION_PHRASE}"`);
  }

  const result = await restoreFromArchive(getBackupConfig(), filename);

  await context.authService!.logAudit({
    userId: new ObjectId(currentUser._id),
    action: "DATA_RESTORE" as any,
    resourceType: "Database",
    details: {
      restoredFrom: result.restoredFrom,
      preRestoreBackup: result.preRestoreBackup,
    },
    timestamp: new Date(),
  });

  return result;
};

export const backupResolvers = {
  Query: { backups },
  Mutation: { createBackup, restoreBackup, deleteBackup, verifyBackup },
};
