import {
  JournalEntryResolvers,
  Budget,
  BudgetOwnerType,
} from "../../graphTypes";
import { nodeFieldResolver } from "../utils/nodeResolver";
import paymentMethodResolver from "../paymentMethod/paymentMethod";
import { fractionToRational } from "../../utils/rational";
import budgetsQuery from "../budget/budgets";
import fiscalYearsQuery from "../fiscalYear/fiscalYears";
import Fraction from "fraction.js";
import { ObjectId } from "mongodb";
import { NodeValue } from "../../types";
import fiscalYears from "../fiscalYear/fiscalYears";

const deptNode = new ObjectId("5dc4addacf96e166daaa008f");
const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");

const paymentMethod: JournalEntryResolvers["paymentMethod"] = async (
  doc: any,
  args,
  context,
  info
) => {
  const payMethod = doc.paymentMethod ?? doc;
  if ("node" in payMethod && "id" in payMethod) {
    return paymentMethodResolver(
      payMethod,
      { id: payMethod.id as string },
      context,
      info
    );
  }

  return payMethod;
};

const budget: JournalEntryResolvers["budget"] = async (
  doc,
  args,
  context,
  info
) => {
  return (
    (
      await budgetsQuery(
        doc,
        {
          where: {
            fiscalYear: { hasDate: { eq: doc.date } },
            department: ((doc.department
              .id as unknown) as ObjectId).toHexString(),
          },
        },
        context,
        info
      )
    )[0] || null
  );
};

const fiscalYear: JournalEntryResolvers["fiscalYear"] = async (
  doc,
  args,
  context,
  info
) => {
  return (
    await fiscalYearsQuery(
      doc,
      {
        where: {
          hasDate: {
            eq: doc.date,
          },
        },
      },
      context,
      info
    )
  )[0];
};

const JournalEntry: JournalEntryResolvers = {
  fiscalYear,
  budget,
  department: nodeFieldResolver,
  category: nodeFieldResolver,
  paymentMethod,
  source: nodeFieldResolver,
  total: (doc) => fractionToRational((doc.total as unknown) as Fraction),
};

export default JournalEntry;
