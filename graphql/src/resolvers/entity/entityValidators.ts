import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { EntityDbRecord } from "../../dataSources/accountingDb/types";
import { validateBusiness } from "../business/index";
import { validateDepartment } from "../department";
import { validatePerson } from "../person/index";

export const validateEntity = {
  exists: async ({
    entity: { type, id: entityId },
    accountingDb,
  }: {
    entity: EntityDbRecord;
    accountingDb: AccountingDb;
  }) => {
    switch (type) {
      case "Business":
        await validateBusiness.exists({
          business: entityId,
          accountingDb,
        });
      case "Department":
        await validateDepartment.exists({
          department: entityId,
          accountingDb,
        });
        break;
      case "Person":
        await validatePerson.exists({
          person: entityId,
          accountingDb,
        });
    }
  },
};
