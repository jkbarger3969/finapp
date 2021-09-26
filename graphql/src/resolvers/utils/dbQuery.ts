import {
  Db,
  FilterQuery,
  FindOneOptions,
  CollectionAggregationOptions,
} from "mongodb";

interface CollectionTypeNames {
  addresses: "Address";
  budgets: "Budget";
  businesses: "Business";
  categories: "Category";
  departments: "Department";
  entries: "Entry";
  fiscalYears: "FiscalYear";
  paymentMethods: "PaymentMethod";
  people: "Person";
  users: "User";
}

const COLLECTION_TYPE_NAMES_MAP: Readonly<CollectionTypeNames> = {
  addresses: "Address",
  budgets: "Budget",
  businesses: "Business",
  categories: "Category",
  departments: "Department",
  entries: "Entry",
  fiscalYears: "FiscalYear",
  paymentMethods: "PaymentMethod",
  people: "Person",
  users: "User",
} as const;

/**
 * @returns Mongodb docs with the corresponding GQL __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
export const find = async <
  T = Record<string, unknown>,
  U extends keyof CollectionTypeNames = keyof CollectionTypeNames
>(
  db: Db,
  collection: U,
  filter: FilterQuery<T>,
  options?: FindOneOptions<T>
): Promise<(T & { __typename: CollectionTypeNames[U] })[]> => {
  return (
    await db
      .collection<T>(collection)
      .find(filter, options as unknown)
      .toArray()
  ).map<T & { __typename: CollectionTypeNames[U] }>(
    (doc: T & { __typename: CollectionTypeNames[U] }) => {
      doc.__typename = COLLECTION_TYPE_NAMES_MAP[collection];
      return doc;
    }
  );
};

/**
 * @returns Mongodb doc with the corresponding GQL __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
export const findOne = async <
  T = Record<string, unknown>,
  U extends keyof CollectionTypeNames = keyof CollectionTypeNames
>(
  db: Db,
  collection: U,
  filter: FilterQuery<T>,
  options?: FindOneOptions<T>
): Promise<T & { __typename: CollectionTypeNames[U] }> => {
  const doc = (await db
    .collection<T>(collection)
    .findOne(filter, options as unknown)) as T & {
    __typename: CollectionTypeNames[U];
  };

  doc.__typename = COLLECTION_TYPE_NAMES_MAP[collection];

  return doc;
};

/**
 * @returns Mongodb docs with the corresponding GQL Schema __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
export const aggregate = async <
  T = Record<string, unknown>,
  U extends keyof CollectionTypeNames = keyof CollectionTypeNames
>(
  db: Db,
  collection: U,
  pipeline: Record<string, unknown>[],
  options?: CollectionAggregationOptions
): Promise<(T & { __typename: CollectionTypeNames[U] })[]> => {
  return (
    await db
      .collection(collection)
      .aggregate<T & { __typename: CollectionTypeNames[U] }>(pipeline, options)
      .toArray()
  ).map((doc) => {
    doc.__typename = COLLECTION_TYPE_NAMES_MAP[collection];
    return doc;
  });
};
