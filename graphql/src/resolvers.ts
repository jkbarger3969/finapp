import { Resolvers } from "./graphTypes";
// import { Budget, budgets } from "./resolvers/budget";
import budget from "./resolvers/budget/budget";
import budgets from "./resolvers/budget/budgets";
import Budget from "./resolvers/budget/BudgetResolvers";
import { addBusiness } from "./resolvers/business";
import business from "./resolvers/business/business";
import businesses from "./resolvers/business/businesses";
import Business from "./resolvers/business/BusinessResolvers";
// import { Department, departments, department } from "./resolvers/departments";
import department from "./resolvers/department/department";
import departments from "./resolvers/department/departments";
import Department from "./resolvers/department/DepartmentResolvers";
import {
  journalEntryAdded,
  journalEntryUpdated,
  journalEntryDelete,
} from "./resolvers/journalEntry";
import journalEntries from "./resolvers/journalEntry/journalEntries";
import journalEntry from "./resolvers/journalEntry/journalEntry";
import journalEntryAdd from "./resolvers/journalEntry/journalEntryAdd";
import journalEntryUpdate from "./resolvers/journalEntry/journalEntryUpdate";
import journalEntryRefund from "./resolvers/journalEntry/journalEntryRefund";
import journalEntryAddRefund from "./resolvers/journalEntry/journalEntryAddRefund";
import journalEntryUpdateRefund from "./resolvers/journalEntry/journalEntryUpdateRefund";
import journalEntryDeleteRefund from "./resolvers/journalEntry/journalEntryDeleteRefund";
import journalEntryAddItem from "./resolvers/journalEntry/journalEntryAddItem";
import journalEntryUpdateItem from "./resolvers/journalEntry/journalEntryUpdateItem";
import journalEntryDeleteItem from "./resolvers/journalEntry/journalEntryDeleteItem";
import journalEntryItem from "./resolvers/journalEntry/journalEntryItem";
import JournalEntry from "./resolvers/journalEntry/JournalEntryResolver";
import JournalEntryRefund from "./resolvers/journalEntry/JournalEntryRefundResolver";
import JournalEntryItem from "./resolvers/journalEntry/JournalEntryItemResolver";
import journalEntryUpserted from "./resolvers/journalEntry/journalEntryUpserted";
import { journalEntrySources } from "./resolvers/journalEntrySource";
import {
  JournalEntryCategory,
  // journalEntryCategories,
  journalEntryCategory,
} from "./resolvers/journalEntryCategory";
import journalEntryCategories from "./resolvers/journalEntryCategory/journalEntryCategories";
import paymentMethods from "./resolvers/paymentMethod/paymentMethods";
import paymentMethod from "./resolvers/paymentMethod/paymentMethod";
import paymentMethodAdd from "./resolvers/paymentMethod/paymentMethodAdd";
import paymentMethodUpdate from "./resolvers/paymentMethod/paymentMethodUpdate";
import PaymentMethod from "./resolvers/paymentMethod/PaymehtMethodResolver";
import { addPerson } from "./resolvers/person";
import people from "./resolvers/person/people";
import person from "./resolvers/person/person";
import { User } from "./resolvers/user";

const resolvers: Resolvers = {
  Budget,
  Business,
  Department,
  JournalEntry,
  JournalEntryRefund,
  JournalEntryItem,
  PaymentMethod,
  JournalEntryCategory,
  User,
  Query: {
    budget,
    businesses,
    business,
    budgets,
    journalEntry,
    journalEntryRefund,
    journalEntryItem,
    journalEntries,
    journalEntrySources,
    journalEntryCategories,
    journalEntryCategory,
    departments,
    department,
    paymentMethods,
    paymentMethod,
    person,
    people,
  },
  Mutation: {
    journalEntryAdd,
    journalEntryUpdate,
    journalEntryDelete,
    journalEntryAddRefund,
    journalEntryUpdateRefund,
    journalEntryDeleteRefund,
    journalEntryAddItem,
    journalEntryUpdateItem,
    journalEntryDeleteItem,
    addPerson,
    addBusiness,
    paymentMethodAdd,
    paymentMethodUpdate,
  },
  Subscription: {
    journalEntryAdded,
    journalEntryUpdated,
    journalEntryUpserted,
  },
};

export default resolvers;
