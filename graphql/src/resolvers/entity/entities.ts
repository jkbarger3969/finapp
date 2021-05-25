import { UserInputError } from "apollo-server-errors";
import { QueryResolvers } from "../../graphTypes";

import { iterateOwnKeys } from "../../utils/iterableFns";
import { whereBusiness } from "../business/index";
import { whereDepartments } from "../department";
import { wherePeople } from "../person/index";
import { addTypename } from "../utils/queryUtils";

export const entities: QueryResolvers["entities"] = async (
  _,
  { where },
  { db }
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
                db
                  .collection("businesses")
                  .find(whereBusiness(where[whereKey]))
                  .toArray()
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
                db
                  .collection("departments")
                  .find(await whereDepartments(where[whereKey], db))
                  .toArray()
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
                db
                  .collection("people")
                  .find(wherePeople(where[whereKey]))
                  .toArray()
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
