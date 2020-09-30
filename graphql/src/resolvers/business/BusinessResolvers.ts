import {
  BusinessResolvers as TBusinessResolvers,
  BudgetOwnerType,
  DepartmentAncestorType,
} from "../../graphTypes";

import budgetsQuery from "../budget/budgets";
import { getDeptDescendants } from "../department/DepartmentResolvers";

const budgets: TBusinessResolvers["budgets"] = async (
  doc,
  args,
  context,
  info
) => {
  return budgetsQuery(
    {},
    {
      where: {
        owner: {
          eq: {
            id: doc.id,
            type: BudgetOwnerType.Business,
          },
        },
      },
    },
    context,
    info
  );
};

const departments: TBusinessResolvers["departments"] = (
  doc,
  args,
  context,
  info
) => {
  return getDeptDescendants(
    { id: doc.id, type: DepartmentAncestorType.Business },
    context,
    info
  );
};

const BusinessResolvers: TBusinessResolvers = {
  budgets,
  departments,
} as const;

export default BusinessResolvers;
