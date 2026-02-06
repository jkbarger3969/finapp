import { Db, Filter, FindOptions, AggregateOptions } from "mongodb";
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
/**
 * @returns Mongodb docs with the corresponding GQL __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
export declare const find: <T = Record<string, unknown>, U extends keyof CollectionTypeNames = keyof CollectionTypeNames>(db: Db, collection: U, filter: Filter<T>, options?: FindOptions<T>) => Promise<(T & {
    __typename: CollectionTypeNames[U];
})[]>;
/**
 * @returns Mongodb doc with the corresponding GQL __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
export declare const findOne: <T = Record<string, unknown>, U extends keyof CollectionTypeNames = keyof CollectionTypeNames>(db: Db, collection: U, filter: Filter<T>, options?: FindOptions<T>) => Promise<T & {
    __typename: CollectionTypeNames[U];
}>;
/**
 * @returns Mongodb docs with the corresponding GQL Schema __typename based on a
 * mongodb collection to GQL Schema type mapping.
 * */
export declare const aggregate: <T = Record<string, unknown>, U extends keyof CollectionTypeNames = keyof CollectionTypeNames>(db: Db, collection: U, pipeline: Record<string, unknown>[], options?: AggregateOptions) => Promise<(T & {
    __typename: CollectionTypeNames[U];
})[]>;
export {};
