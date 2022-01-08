import { Db, Filter as FilterQuery, ObjectId } from "mongodb";

import { EntitiesWhere } from "../../graphTypes";
import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereBusiness } from "../business";
import { whereDepartments } from "../department";
import { wherePeople } from "../person";

export interface WhereEntitiesResults {
  businesses?: ObjectId[];
  departments?: ObjectId[];
  people?: ObjectId[];
}
export const whereEntities = async (
  entitiesWhere: EntitiesWhere,
  db: Db
): Promise<WhereEntitiesResults> => {
  const whereEntityResults: WhereEntitiesResults = {};

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(entitiesWhere)) {
    switch (whereKey) {
      case "businesses":
        promises.push(
          (async () => {
            const result = whereBusiness(entitiesWhere[whereKey]);

            const query = result instanceof Promise ? await result : result;

            const results = (
              await db
                .collection<{
                  _id: ObjectId;
                }>("businesses")
                .find(query, {
                  projection: {
                    _id: true,
                  },
                })
                .toArray()
            ).map(({ _id }) => _id);

            if (results.length) {
              whereEntityResults.businesses = results;
            }
          })()
        );
        break;
      case "departments":
        promises.push(
          (async () => {
            const result = whereDepartments(entitiesWhere[whereKey], db);
            const query = result instanceof Promise ? await result : result;

            const results = (
              await db
                .collection<{
                  _id: ObjectId;
                }>("departments")
                .find(query, {
                  projection: {
                    _id: true,
                  },
                })
                .toArray()
            ).map(({ _id }) => _id);

            if (results.length) {
              whereEntityResults.departments = results;
            }
          })()
        );
        break;
      case "people":
        promises.push(
          (async () => {
            const query = wherePeople(entitiesWhere[whereKey]);

            const results = (
              await db
                .collection<{
                  _id: ObjectId;
                }>("people")
                .find(query, {
                  projection: {
                    _id: true,
                  },
                })
                .toArray()
            ).map(({ _id }) => _id);

            if (results.length) {
              whereEntityResults.people = results;
            }
          })()
        );
        break;
    }
  }

  await Promise.all(promises);

  return whereEntityResults;
};
