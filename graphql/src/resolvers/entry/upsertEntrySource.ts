import { UserInputError } from "apollo-server-core";
import { Db, ObjectId } from "mongodb";
import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import {
  EntityDbRecord,
  PersonDbRecord,
} from "../../dataSources/accountingDb/types";
import { EntityType, Person, UpsertEntrySource } from "../../graphTypes";

/**
 * Parses and validates {@link UpsertEntrySource} and creates records.
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
        const addNewPerson = upsertEntrySourceInput[name];

        const newPerson: Omit<PersonDbRecord, "_id"> = {
          name: {
            first: addNewPerson.name.first,
            last: addNewPerson.name.last,
          },
        };

        if (addNewPerson.email) {
          newPerson.email = addNewPerson.email;
        }

        if (addNewPerson.phone) {
          newPerson.phone = addNewPerson.phone;
        }

        const { insertedId } = await accountingDb.insertOne({
          collection: "people",
          doc: newPerson,
        });

        return {
          type: "Person",
          id: insertedId,
        };
      }

      case "source": {
        const source = upsertEntrySourceInput[name];

        const id = new ObjectId(source.id);

        switch (source.type) {
          case EntityType.Business:
            if (
              !(await accountingDb.findOne({
                collection: "businesses",
                filter: {
                  _id: id,
                },
                options: {
                  projection: {
                    _id: true,
                  },
                },
              }))
            ) {
              throw new UserInputError(
                `"Business" id "${source.id}" does not exists.`
              );
            }
            return {
              type: "Business",
              id,
            };
          case EntityType.Department:
            if (
              !(await accountingDb.findOne({
                collection: "departments",
                filter: {
                  _id: id,
                },
                options: {
                  projection: {
                    _id: true,
                  },
                },
              }))
            ) {
              throw new UserInputError(
                `"Department" id "${source.id}" does not exists.`
              );
            }
            return {
              type: "Department",
              id,
            };
          case EntityType.Person:
            if (
              !(await accountingDb.findOne({
                collection: "people",
                filter: {
                  _id: id,
                },
                options: {
                  projection: {
                    _id: true,
                  },
                },
              }))
            ) {
              throw new UserInputError(
                `"Person" id "${source.id}" does not exists.`
              );
            }
            return {
              type: "Person",
              id,
            };
        }
      }
    }
  });
