import {Resolvers} from "./graphTypes";
import {Budget, budgets} from "./resolvers/budget";
import {Business, businesses} from "./resolvers/business";
import {Department, departments, department} from "./resolvers/departments";
import {journalEntries, addJournalEntry, updateJournalEntry, JournalEntry
} from "./resolvers/journalEntry";
import {journalEntrySources} from "./resolvers/journalEntrySource";
import {JournalEntryType, journalEntryTypes
} from "./resolvers/journalEntryType";
import {PaymentMethod, paymentMethods} from "./resolvers/paymentMethod";
import {people, addPerson} from "./resolvers/person";
import {User} from "./resolvers/user";

const resolvers:Resolvers = {
  Budget,
  Business,
  Department,
  JournalEntry,
  PaymentMethod,
  JournalEntryType,
  User,
  Query: {
    businesses,
    budgets,
    journalEntries,
    journalEntryTypes,
    journalEntrySources,
    departments,
    department,
    paymentMethods,
    people
  },
  Mutation:{
    addJournalEntry,
    updateJournalEntry,
    addPerson
  }
};

export default resolvers;