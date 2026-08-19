import { Db, ObjectId } from "mongodb";

import { AuthService } from "../../services/authService";

async function getDescendantDeptIds(
  parentId: ObjectId,
  db: Db
): Promise<ObjectId[]> {
  const descendants: ObjectId[] = [];
  const queue: ObjectId[] = [parentId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await db
      .collection("departments")
      .find(
        { "parent.type": "Department", "parent.id": currentId },
        { projection: { _id: 1 } }
      )
      .toArray();

    for (const child of children) {
      descendants.push(child._id);
      queue.push(child._id);
    }
  }

  return descendants;
}

/**
 * Resolves the set of department ids a user may access, including descendants
 * of any directly-granted department.
 *
 * @returns `null` when the caller is unrestricted (SUPER_ADMIN, or no
 * authService/user on context - matching the existing permissive fallback
 * used throughout the entry resolvers). Otherwise the full accessible +
 * descendant department id set, which may be empty.
 */
export async function getAccessibleDeptIdsWithDescendants({
  authService,
  userId,
  db,
}: {
  authService: AuthService | undefined;
  userId: ObjectId | undefined;
  db: Db;
}): Promise<ObjectId[] | null> {
  if (!authService || !userId) {
    return null;
  }

  const authUser = await authService.getUserById(userId);

  if (!authUser || authUser.role === "SUPER_ADMIN") {
    return null;
  }

  const accessibleDeptIds = await authService.getAccessibleDepartmentIds(
    userId
  );

  const allAccessibleIds = new Set<string>();
  for (const deptId of accessibleDeptIds) {
    allAccessibleIds.add(deptId.toString());

    const descendants = await getDescendantDeptIds(deptId, db);
    descendants.forEach((id) => allAccessibleIds.add(id.toString()));
  }

  return Array.from(allAccessibleIds).map((id) => new ObjectId(id));
}
