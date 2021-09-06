import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { PersonDbRecord } from "../../dataSources/accountingDb/types";
import { NewPerson } from "../../graphTypes";

export const addNewPersonRecord = async ({
  newPerson,
  accountingDb,
}: {
  newPerson: NewPerson;
  accountingDb: AccountingDb;
}) => {
  const personRecord: Omit<PersonDbRecord, "_id"> = {
    name: {
      first: newPerson.name.first,
      last: newPerson.name.last,
    },
  };

  if (newPerson.email) {
    personRecord.email = newPerson.email;
  }

  if (newPerson.phone) {
    personRecord.phone = newPerson.phone;
  }

  return accountingDb.insertOne({
    collection: "people",
    doc: newPerson,
  });
};
