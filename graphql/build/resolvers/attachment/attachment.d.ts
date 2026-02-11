import { MutationResolvers, Resolvers } from "../../graphTypes";
/**
 * Upload a receipt file to the filesystem (NAS mount)
 */
export declare const uploadReceipt: Extract<MutationResolvers["uploadReceipt"], Function>;
/**
 * Delete an attachment (soft delete in database)
 */
export declare const deleteAttachment: Extract<MutationResolvers["deleteAttachment"], Function>;
export declare const attachmentResolvers: Resolvers;
