import { Resolvers } from "./graphTypes";
import { alias, aliases, Alias, AliasTarget } from "./resolvers/alias";
import {
  account,
  accounts,
  accountCard,
  accountCards,
  AccountInterface,
  AccountWithCardsInterface,
  AccountCard,
  AccountCheck,
  AccountChecking,
  AccountCreditCard,
} from "./resolvers/account";
import { budget, budgets, Budget, BudgetOwner } from "./resolvers/budget";
import { business, businesses, Business } from "./resolvers/business";
import {
  department,
  departments,
  Department,
  DepartmentAncestor,
} from "./resolvers/department";
import { Entity, entities } from "./resolvers/entity";
import {
  addNewEntry,
  addNewEntryRefund,
  entry,
  entries,
  entryRefund,
  entryRefunds,
  deleteEntry,
  deleteEntryRefund,
  Entry,
  EntryItem,
  EntryRefund,
  updateEntry,
  updateEntryRefund,
  reconcileEntries,
} from "./resolvers/entry";
import {
  PaymentCardInterface,
  PaymentCheckInterface,
  PaymentMethodInterface,
  PaymentMethodCard,
} from "./resolvers/paymentMethod";
import { sources } from "./resolvers/entrySource";
import { Category, category, categories } from "./resolvers/category/index";
import { people, person, Person } from "./resolvers/person";
import { fiscalYear, fiscalYears, FiscalYear } from "./resolvers/fiscalYear";
import { User } from "./resolvers/user";

import { dateScalar, rationalScalar } from "./resolvers/scalars";

const resolvers: Resolvers = {
  AccountInterface,
  AccountWithCardsInterface,
  AccountCard,
  AccountCheck,
  AccountChecking,
  AccountCreditCard,
  Alias,
  AliasTarget,
  Date: dateScalar,
  Rational: rationalScalar,
  Budget,
  BudgetOwner,
  Business,
  Department,
  DepartmentAncestor,
  Entity,
  Entry,
  EntryRefund,
  EntryItem,
  FiscalYear,
  PaymentCardInterface,
  PaymentCheckInterface,
  PaymentMethodInterface,
  PaymentMethodCard,
  Person,
  Category,
  User,
  Query: {
    account,
    accounts,
    accountCard,
    accountCards,
    alias,
    aliases,
    budget,
    businesses,
    business,
    budgets,
    entities,
    entry,
    entryRefund,
    entries,
    entryRefunds,
    sources,
    categories,
    category,
    departments,
    department,
    person,
    people,
    fiscalYear,
    fiscalYears,
  },
  Mutation: {
    addNewEntry,
    addNewEntryRefund,
    deleteEntry,
    deleteEntryRefund,
    updateEntry,
    updateEntryRefund,
    reconcileEntries,
  },
  Subscription: {
    // entryUpserted,
  },
};

export default resolvers;
