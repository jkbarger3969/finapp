import { Resolvers } from "./graphTypes";
import { Budget, budgets } from "./resolvers/budget";
import {
  Business,
  business,
  businesses,
  addBusiness
} from "./resolvers/business";
import { Department, departments, department } from "./resolvers/departments";
import {
  journalEntryAdd,
  journalEntryUpdate,
  JournalEntry,
  journalEntryAdded,
  journalEntryUpdated,
  journalEntryDelete
} from "./resolvers/journalEntry";
import journalEntries from "./resolvers/journalEntry/journalEntries";
import journalEntry from "./resolvers/journalEntry/journalEntry";
import { journalEntrySources } from "./resolvers/journalEntrySource";
import {
  JournalEntryCategory,
  journalEntryCategories,
  journalEntryCategory
} from "./resolvers/journalEntryCategory";
import { PaymentMethod, paymentMethods } from "./resolvers/paymentMethod";
import { people, addPerson } from "./resolvers/person";
import { User } from "./resolvers/user";

const resolvers: Resolvers = {
  Budget,
  Business,
  Department,
  JournalEntry,
  PaymentMethod,
  JournalEntryCategory,
  User,
  Query: {
    businesses,
    business,
    budgets,
    journalEntry,
    journalEntries,
    journalEntrySources,
    journalEntryCategories,
    journalEntryCategory,
    departments,
    department,
    paymentMethods,
    people
  },
  Mutation: {
    journalEntryAdd,
    journalEntryUpdate,
    journalEntryDelete,
    addPerson,
    addBusiness
  },
  Subscription: {
    journalEntryAdded,
    journalEntryUpdated
  }
};

export default resolvers;
