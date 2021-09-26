import { Db, ObjectId } from "mongodb";
import { CategoryDbRecord } from "../category";
import { DepartmentDbRecord } from "../department";

import { AliasDbRecord } from "./aliasResolvers";

export type AliasTargetTypes = "Category" | "Department";

/**
 * @returns All aliases that apply to the target.  Both direct aliases and
 * inherited pre and post fixes.
 */
export const getAliases = async (
  targetType: AliasTargetTypes,
  targetId: ObjectId,
  db: Db
): Promise<AliasDbRecord[]> => {
  const aliases: AliasDbRecord[] = [];

  const promises: Promise<void>[] = [];

  // Direct aliases
  promises.push(
    db
      .collection<AliasDbRecord>("aliases")
      .find({
        "target.type": targetType,
        "target.id": targetId,
        type: "Alias",
      })
      .toArray()
      .then((results) => {
        aliases.push(...results);
      })
  );

  // Inherited aliases
  promises.push(
    (async () => {
      const promises: Promise<void>[] = [];
      switch (targetType) {
        case "Category":
          {
            let { parent } = await db
              .collection<Pick<CategoryDbRecord, "parent">>("categories")
              .findOne(
                { _id: targetId },
                {
                  projection: {
                    parent: true,
                  },
                }
              );

            while (parent) {
              promises.push(
                db
                  .collection<AliasDbRecord>("aliases")
                  .find({
                    "target.type": targetType,
                    "target.id": parent,
                    type: { $ne: "Alias" },
                  })
                  .toArray()
                  .then((results) => {
                    aliases.push(...results);
                  })
              );

              ({ parent } = await db
                .collection<Pick<CategoryDbRecord, "parent">>("categories")
                .findOne(
                  { _id: parent },
                  {
                    projection: {
                      parent: true,
                    },
                  }
                ));
            }
          }
          break;
        case "Department":
          {
            let { parent } = await db
              .collection<Pick<DepartmentDbRecord, "parent">>("departments")
              .findOne(
                { _id: targetId },
                {
                  projection: {
                    parent: true,
                  },
                }
              );

            while (parent.type === "Department") {
              promises.push(
                db
                  .collection<AliasDbRecord>("aliases")
                  .find({
                    "target.type": targetType,
                    "target.id": parent.id,
                    type: { $ne: "Alias" },
                  })
                  .toArray()
                  .then((results) => {
                    aliases.push(...results);
                  })
              );

              ({ parent } = await db
                .collection<Pick<DepartmentDbRecord, "parent">>("departments")
                .findOne(
                  { _id: parent.id },
                  {
                    projection: {
                      parent: true,
                    },
                  }
                ));
            }
          }
          break;
      }

      await Promise.all(promises);
    })()
  );

  await Promise.all(promises);

  return aliases;
};
