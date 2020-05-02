import { Resolvers } from "./graphTypes";
import { Budget, budgets } from "./resolvers/budget";
import {
  Business,
  business,
  businesses,
  addBusiness,
} from "./resolvers/business";
import { Department, departments, department } from "./resolvers/departments";
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
import JournalEntry from "./resolvers/journalEntry/JournalEntryResolver";
import JournalEntryRefund from "./resolvers/journalEntry/JournalEntryRefundResolver";
import { journalEntrySources } from "./resolvers/journalEntrySource";
import {
  JournalEntryCategory,
  journalEntryCategories,
  journalEntryCategory,
} from "./resolvers/journalEntryCategory";
import paymentMethods from "./resolvers/paymentMethod/paymentMethods";
import paymentMethod from "./resolvers/paymentMethod/paymentMethod";
import paymentMethodAdd from "./resolvers/paymentMethod/paymentMethodAdd";
import paymentMethodUpdate from "./resolvers/paymentMethod/paymentMethodUpdate";
import PaymentMethod from "./resolvers/paymentMethod/PaymehtMethodResolver";
import { people, addPerson } from "./resolvers/person";
import { User } from "./resolvers/user";

const resolvers: Resolvers = {
  Budget,
  Business,
  Department,
  JournalEntry,
  JournalEntryRefund,
  PaymentMethod,
  JournalEntryCategory,
  User,
  Query: {
    businesses,
    business,
    budgets,
    journalEntry,
    journalEntryRefund,
    journalEntries,
    journalEntrySources,
    journalEntryCategories,
    journalEntryCategory,
    departments,
    department,
    paymentMethods,
    paymentMethod,
    people,
  },
  Mutation: {
    journalEntryAdd,
    journalEntryUpdate,
    journalEntryDelete,
    journalEntryAddRefund,
    journalEntryUpdateRefund,
    journalEntryDeleteRefund,
    addPerson,
    addBusiness,
    paymentMethodAdd,
    paymentMethodUpdate,
  },
  Subscription: {
    journalEntryAdded,
    journalEntryUpdated,
  },
};

export default resolvers;
