import { ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { EntityDbRecord } from "../../dataSources/accountingDb/types";
import { EntityType, UpsertEntrySource } from "../../graphTypes";
import { addNewBusinessRecord, validateBusiness } from "../business";
import { addNewPersonRecord } from "../person/addNewPerson";
import { validatePerson } from "../person";

/**
 * Parses {@link UpsertEntrySource} and creates records.
 */
export const upsertEntrySourceToEntityDbRecord = async ({
  upsertEntrySourceInput,
  accountingDb,
}: {
  upsertEntrySourceInput: UpsertEntrySource;
  accountingDb: AccountingDb;
}): Promise<EntityDbRecord> =>
  accountingDb.withTransaction(async () => {
    const [name] = Object.keys(upsertEntrySourceInput) as [
      keyof UpsertEntrySource
    ];

    switch (name) {
      case "person": {
        const newPerson = upsertEntrySourceInput[name];

        validatePerson.newPerson({ newPerson });

        const { insertedId } = await addNewPersonRecord({
          newPerson,
          accountingDb,
        });

        return {
          type: "Person",
          id: insertedId,
        };
      }

      case "business": {
        const newBusiness = upsertEntrySourceInput[name];

        validateBusiness.newBusiness({
          newBusiness,
        });

        const { insertedId } = await addNewBusinessRecord({
          newBusiness,
          accountingDb,
        });

        return {
          type: "Business",
          id: insertedId,
        };
      }

      case "source": {
        const source = upsertEntrySourceInput[name];

        const id = new ObjectId(source.id);

        switch (source.type) {
          case EntityType.Business:
            return {
              type: "Business",
              id,
            };
          case EntityType.Department:
            return {
              type: "Department",
              id,
            };
          case EntityType.Person:
            return {
              type: "Person",
              id,
            };
        }
      }
    }
  });
