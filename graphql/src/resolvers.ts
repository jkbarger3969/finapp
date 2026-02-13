import { Resolvers } from "./graphTypes";
import {
  account,
  accounts,
  accountCard,
  accountCards,
  createAccountCard,
  updateAccountCard,
  deleteAccountCard,
  AccountInterface,
  AccountWithCardsInterface,
  AccountCard,
  AccountCheck,
  AccountChecking,
  AccountCreditCard,
} from "./resolvers/account";
import { budget, budgets, Budget, BudgetOwner, upsertBudget, deleteBudget } from "./resolvers/budget";
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
  PaymentCard,
  PaymentCheckInterface,
  PaymentMethodInterface,
  PaymentMethodCard,
} from "./resolvers/paymentMethod";
import { sources } from "./resolvers/entrySource";
import { Category, category, categories } from "./resolvers/category/index";
import { people, person, Person } from "./resolvers/person";
import { fiscalYear, fiscalYears, FiscalYear, createFiscalYear, archiveFiscalYear, restoreFiscalYear, exportFiscalYear, deleteFiscalYear } from "./resolvers/fiscalYear";
import { User } from "./resolvers/user";
import { attachmentResolvers } from "./resolvers/attachment";
import { authResolvers } from "./resolvers/auth/authResolvers";

import { dateScalar, rationalScalar, jsonScalar } from "./resolvers/scalars";
import { Alias } from "./resolvers/alias";

const initialResolvers: Resolvers = {
  AccountInterface,
  AccountWithCardsInterface,
  AccountCard,
  AccountCheck,
  AccountChecking,
  AccountCreditCard,
  Alias,
  Date: dateScalar,
  Rational: rationalScalar,
  JSON: jsonScalar,
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
  PaymentCard,
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
    exportFiscalYear,
  },
  Mutation: {
    addNewEntry,
    addNewEntryRefund,
    deleteEntry,
    deleteEntryRefund,
    updateEntry,
    updateEntryRefund,
    reconcileEntries,
    createAccountCard: createAccountCard as any,
    updateAccountCard: updateAccountCard as any,
    deleteAccountCard: deleteAccountCard as any,
    upsertBudget,
    deleteBudget,
    createFiscalYear,
    archiveFiscalYear,
    restoreFiscalYear,
    deleteFiscalYear,
  },
  Subscription: {
    // entryUpserted,
  },
};

const resolvers = {
  ...initialResolvers,
  Upload: attachmentResolvers.Upload,
  AuthUser: authResolvers.AuthUser,
  UserPermission: authResolvers.UserPermission,
  AuditLogEntry: authResolvers.AuditLogEntry,
  Entry: {
    ...initialResolvers.Entry,
    ...attachmentResolvers.Entry,
  },
  Query: {
    ...initialResolvers.Query,
    ...authResolvers.Query,
  },
  Mutation: {
    ...initialResolvers.Mutation,
    ...attachmentResolvers.Mutation,
    ...authResolvers.Mutation,
  },
};

export default resolvers;
