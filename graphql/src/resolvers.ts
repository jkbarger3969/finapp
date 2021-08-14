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
import { entryAdded, entryUpdated, entryDelete } from "./resolvers/entry";
import {
  entry,
  entries,
  entryRefunds,
  Entry,
  EntryItem,
  EntryRefund,
} from "./resolvers/entry/index";
import entryAdd from "./resolvers/entry/entryAdd";
import entryUpdate from "./resolvers/entry/entryUpdate";
import entryRefund from "./resolvers/entry/entryRefund";
import entryAddRefund from "./resolvers/entry/entryAddRefund";
import entryUpdateRefund from "./resolvers/entry/entryUpdateRefund";
import entryDeleteRefund from "./resolvers/entry/entryDeleteRefund";
import entryAddItem from "./resolvers/entry/entryAddItem";
import entryUpdateItem from "./resolvers/entry/entryUpdateItem";
import entryDeleteItem from "./resolvers/entry/entryDeleteItem";
import entryItem from "./resolvers/entry/entryItem";
import entryUpserted from "./resolvers/entry/entryUpserted";
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
    entryAdd,
    entryUpdate,
    entryDelete,
    entryAddRefund,
    entryUpdateRefund,
    entryDeleteRefund,
    entryAddItem,
    entryUpdateItem,
    entryDeleteItem,
    addPerson,
    addBusiness,
  },
  Subscription: {
    entryAdded,
    entryUpdated,
    entryUpserted,
  },
};

export default resolvers;
