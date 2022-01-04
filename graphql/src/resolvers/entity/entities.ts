import { UserInputError } from "apollo-server-errors";
import { QueryResolvers } from "../../graphTypes";

import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereBusiness } from "../business";
import { whereDepartments } from "../department";
import { wherePeople } from "../person";
import { addTypename } from "../utils/queryUtils";

export const entities: QueryResolvers["entities"] = async (
  _,
  { where },
  { dataSources: { accountingDb } }
) => {
  const results: any[] = [];

  const promises: Promise<void>[] = [];

  for (const whereKey of iterateOwnKeys(where)) {
    switch (whereKey) {
      case "businesses":
        promises.push(
          (async () => {
            results.push(
              ...(await addTypename(
                "Business",
                accountingDb.find({
                  collection: "businesses",
                  filter: whereBusiness(where[whereKey]),
                })
              ))
            );
          })()
        );
        break;
      case "departments":
        promises.push(
          (async () => {
            results.push(
              ...(await addTypename(
                "Department",
                accountingDb.find({
                  collection: "departments",
                  filter: await whereDepartments(
                    where[whereKey],
                    accountingDb.db
                  ),
                })
              ))
            );
          })()
        );
        break;
      case "people":
        promises.push(
          (async () => {
            results.push(
              ...(await addTypename(
                "Person",
                accountingDb.find({
                  collection: "people",
                  filter: wherePeople(where[whereKey]),
                })
              ))
            );
          })()
        );

        break;
    }
  }

  if (!promises.length) {
    throw new UserInputError(
      "At least where businesses, departments, or people filter required.",
      {
        argumentName: "where",
      }
    );
  }

  await Promise.all(promises);

  return results;
};
