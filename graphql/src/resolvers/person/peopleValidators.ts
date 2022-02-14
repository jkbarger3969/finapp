import { UserInputError } from "apollo-server-core";
import { ObjectId } from "mongodb";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { NewPerson } from "../../graphTypes";

export const validatePerson = {
  exists: async ({
    person,
    accountingDb,
  }: {
    person: ObjectId;
    accountingDb: AccountingDb;
  }) => {
    if (
      !(await accountingDb.findOne({
        collection: "people",
        filter: {
          _id: person,
        },
        options: {
          projection: {
            _id: true,
          },
        },
      }))
    ) {
      throw new UserInputError(
        `"Person" id "${person.toHexString()}" does not exists.`
      );
    }
  },
  newPerson: ({ newPerson }: { newPerson: NewPerson }) => {
    if (newPerson.name.first.length < 3) {
      throw new UserInputError(`"NewPerson.name.first" is too short.`);
    }

    if (newPerson.name.last.length < 3) {
      throw new UserInputError(`"NewPerson.name.last" is too short.`);
    }

    /* Keep the following code for future use.
    if (!(newPerson.email || newPerson.phone)) {
      throw new UserInputError(
        `"NewPerson.email" or "NewPerson.phone" is required.`
      );
    } */
  },
} as const;
