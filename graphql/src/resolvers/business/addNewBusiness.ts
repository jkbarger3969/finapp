import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { BusinessDbRecord } from "../../dataSources/accountingDb/types";
import { NewBusiness } from "../../graphTypes";

export const addNewBusinessRecord = ({
  newBusiness,
  accountingDb,
}: {
  newBusiness: NewBusiness;
  accountingDb: AccountingDb;
}) => {
  const newBusinessRecord: Omit<BusinessDbRecord, "_id"> = {
    name: newBusiness.name,
  };

  return accountingDb.insertOne({
    collection: "businesses",
    doc: newBusinessRecord,
  });
};
