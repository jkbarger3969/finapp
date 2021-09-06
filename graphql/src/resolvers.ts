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
import { addBusiness } from "./resolvers/business";
import { business, businesses, Business } from "./resolvers/business/index";
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
  entryRefunds,
  deleteEntry,
  deleteEntryRefund,
  Entry,
  EntryItem,
  EntryRefund,
  updateEntry,
  updateEntryRefund,
} from "./resolvers/entry/index";
import entryRefund from "./resolvers/entry/entryRefund";
import entryItem from "./resolvers/entry/entryItem";
// import entryUpserted from "./resolvers/entry/entryUpserted";
import {
  PaymentCardInterface,
  PaymentCheckInterface,
  PaymentMethodInterface,
  PaymentMethodCard,
} from "./resolvers/paymentMethod";
import { sources } from "./resolvers/entrySource";
import { Category, category, categories } from "./resolvers/category/index";
import { addPerson } from "./resolvers/person";
import { people, person, Person } from "./resolvers/person/index";
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
    entryItem,
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
    addBusiness,
    addNewEntry,
    addNewEntryRefund,
    addPerson,
    deleteEntry,
    deleteEntryRefund,
    updateEntry,
    updateEntryRefund,
  },
  Subscription: {
    // entryUpserted,
  },
};

export default resolvers;
