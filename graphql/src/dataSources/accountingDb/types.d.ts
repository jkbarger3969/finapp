import { FindOneOptions as MongoFindOneOptions, ObjectId } from "mongodb";
import {
  AccountType,
  Currency,
  EntityType,
  EntryType,
  PaymentCardType,
} from "../../graphTypes";
import { HistoricalDoc } from "../../resolvers/utils/DocHistory";
import { NodeDbRecord } from "../../resolvers/utils/queryUtils";
import { Rational } from "../../utils/mongoRational";

export type FindOneOptions<TCollection extends keyof CollectionSchemaMap> =
  Pick<MongoFindOneOptions<CollectionSchemaMap[TCollection]>, "projection">;

type PascalCase<T extends string> = T extends `${infer U}_${infer V}`
  ? `${Capitalize<Lowercase<U>>}${PascalCase<V>}`
  : Capitalize<Lowercase<T>>;

// Db Records
export type EntryTypeDbRecord = PascalCase<EntryType>;

export type EntryItemDbRecord = HistoricalDoc<
  true,
  {
    category?: ObjectId;
    date: Date;
    deleted: boolean;
    department?: ObjectId;
    description?: string;
    total: Rational;
    units: number;
  },
  {},
  false
>;

export type EntryRefundDbRecord = HistoricalDoc<
  true,
  {
    date: Date;
    deleted: boolean;
    description?: string;
    paymentMethod: PaymentMethodDBRecord;
    reconciled: boolean;
    total: Rational;
  },
  { id: ObjectId },
  false
>;

export type EntityTypeDbRecord = PascalCase<EntityType>;

export type EntityDbRecord = NodeDbRecord<EntityTypeDbRecord>;

export type EntryDbRecord = HistoricalDoc<
  true,
  {
    category: ObjectId;
    date: Date;

    deleted: boolean;
    department: ObjectId;
    description?: string;
    // items?: EntryItemDbRecord[];
    paymentMethod: PaymentMethodDBRecord;
    reconciled: boolean;
    // refunds?: EntryRefundDbRecord[];
    source: EntityDbRecord;
    total: Rational;
  },
  {
    dateOfRecord?: HistoricalDoc<
      false,
      {
        date: Date;
        overrideFiscalYear: boolean;
      }
    >;
    items?: EntryItemDbRecord[];
    refunds?: EntryRefundDbRecord[];
  }
>;

export interface CategoryDbRecord {
  _id: ObjectId;
  name: string;
  code: string;
  externalId: string;
  type: EntryTypeDbRecord;
  inactive: boolean;
  donation: boolean;
  parent?: ObjectId | null;
}

export type PaymentCardTypeDbRecord = PascalCase<PaymentCardType>;

export interface PaymentMethodCardDBRecord {
  currency: Currency;
  card:
    | ObjectId
    | {
        trailingDigits: string;
        type: PaymentCardTypeDbRecord;
      };
  type: "Card";
}

export interface PaymentMethodCheckDBRecord {
  currency: Currency;
  check: {
    account?: ObjectId;
    checkNumber: string;
  };
  type: "Check";
}

export interface PaymentMethodTypeOnlyDBRecord {
  currency: Currency;
  type: "Unknown" | "Online" | "Cash" | "Combination";
}

export type PaymentMethodDBRecord =
  | PaymentMethodCheckDBRecord
  | PaymentMethodCardDBRecord
  | PaymentMethodTypeOnlyDBRecord;

export interface PaymentCardsDbRecord {
  _id: ObjectId;
  account: ObjectId;
  active: boolean;
  authorizedUsers: EntityDbRecord[];
  trailingDigits: string;
  type: PaymentCardTypeDbRecord;
  currency: Currency;
}

export type AccountTypeDBRecord = PascalCase<AccountType>;

export interface AccountDBRecord {
  _id: ObjectId;
  name: string;
  accountType: AccountTypeDBRecord;
  active: boolean;
  currencyType: Currency;
  owner: EntityDbRecord;
  cards: ObjectId[];
  type: Currency;
}

export interface BusinessDbRecord {
  _id: ObjectId;
  name: string;
  vendor?: {
    approved: boolean;
    vendorId: string | ObjectId;
  };
  budget?: {
    id: ObjectId;
    node: ObjectId;
  };
}

export interface DepartmentDbRecord {
  _id: ObjectId;
  code: string;
  name: string;
  parent: {
    type: "Business" | "Department";
    id: ObjectId;
  };
  virtualRoot?: boolean;
}

export interface PersonDbRecord {
  _id: ObjectId;
  name: {
    first: string;
    last: string;
  };
  email?: string;
  phone?: string;
}

export type CollectionSchemaMap = {
  accounts: AccountDBRecord;
  businesses: BusinessDbRecord;
  categories: CategoryDbRecord;
  departments: DepartmentDbRecord;
  entries: EntryDbRecord;
  paymentCards: PaymentCardsDbRecord;
  people: PersonDbRecord;
};
