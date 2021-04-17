import { Resolvers } from "./graphTypes";
// import { Budget, budgets } from "./resolvers/budget";
import { alias, aliases, Alias, AliasTarget } from "./resolvers/alias";
import { budget, budgets, Budget, BudgetOwner } from "./resolvers/budget";
import { addBusiness } from "./resolvers/business";
import { business, businesses, Business } from "./resolvers/business/index";
// import { Department, departments, department } from "./resolvers/departments";
import {
  department,
  departments,
  Department,
  DepartmentAncestor,
} from "./resolvers/department";
import { entryAdded, entryUpdated, entryDelete } from "./resolvers/entry";
import {
  entry,
  entries,
  Entry,
  EntryItem,
  EntryRefund,
  EntrySource,
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
import { sources } from "./resolvers/entrySource";
import { Category, category, categories } from "./resolvers/category/index";
import {
  paymentMethod,
  paymentMethods,
  PaymentMethod,
} from "./resolvers/paymentMethod";
import paymentMethodAdd from "./resolvers/paymentMethod/paymentMethodAdd";
import paymentMethodUpdate from "./resolvers/paymentMethod/paymentMethodUpdate";
import { addPerson } from "./resolvers/person";
import { people, person, Person } from "./resolvers/person/index";
import { fiscalYear, fiscalYears, FiscalYear } from "./resolvers/fiscalYear";
import { User } from "./resolvers/user";

import { dateScalar, rationalScalar } from "./resolvers/scalars";

const resolvers: Resolvers = {
  Alias,
  AliasTarget,
  Date: dateScalar,
  Rational: rationalScalar,
  Budget,
  BudgetOwner,
  Business,
  Department,
  DepartmentAncestor,
  Entry,
  EntryRefund,
  EntryItem,
  EntrySource,
  FiscalYear,
  PaymentMethod,
  Person,
  Category,
  User,
  Query: {
    alias,
    aliases,
    budget,
    businesses,
    business,
    budgets,
    entry,
    entryRefund,
    entryItem,
    entries,
    sources,
    categories,
    category,
    departments,
    department,
    paymentMethods,
    paymentMethod,
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
    paymentMethodAdd,
    paymentMethodUpdate,
  },
  Subscription: {
    entryAdded,
    entryUpdated,
    entryUpserted,
  },
};

export default resolvers;
