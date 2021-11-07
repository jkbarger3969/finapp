import { DataSource } from "apollo-datasource";
import { MongoClient, Db, ClientSession, FilterQuery, OptionalId, UpdateQuery } from "mongodb";
import { Context } from "../../types";
import { FindOneOptions, CollectionSchemaMap } from "./types";
export declare type UpdateOne<TCollection extends keyof CollectionSchemaMap> = UpdateQuery<CollectionSchemaMap[TCollection]>;
export declare class AccountingDb extends DataSource<Context> {
    #private;
    constructor({ client }: {
        client: MongoClient;
    });
    get client(): MongoClient;
    get db(): Db;
    getCollection<TCollection extends keyof CollectionSchemaMap>(collection: TCollection): import("mongodb").Collection<CollectionSchemaMap[TCollection]>;
    /**
     * Handles the session, and nested calls to withTransaction,
     */
    withTransaction<TReturn = unknown>(cb: (arg: {
        session: ClientSession;
    }) => Promise<TReturn>): Promise<TReturn>;
    insertOne<TCollection extends keyof CollectionSchemaMap>({ collection, doc, }: {
        collection: TCollection;
        doc: OptionalId<CollectionSchemaMap[TCollection]>;
    }): Promise<import("mongodb").InsertOneWriteOpResult<import("mongodb").WithId<CollectionSchemaMap[TCollection]>>>;
    updateOne<TCollection extends keyof CollectionSchemaMap>({ collection, filter, update, }: {
        collection: TCollection;
        filter: FilterQuery<CollectionSchemaMap[TCollection]>;
        update: UpdateOne<TCollection>;
    }): Promise<import("mongodb").UpdateWriteOpResult>;
    find<TCollection extends keyof CollectionSchemaMap>({ collection, filter, options, }: {
        collection: TCollection;
        filter: FilterQuery<CollectionSchemaMap[TCollection]>;
        options?: FindOneOptions<TCollection>;
        skipCache?: boolean;
    }): Promise<CollectionSchemaMap[TCollection][]>;
    findOne<TCollection extends keyof CollectionSchemaMap>({ collection, filter, options, }: {
        collection: TCollection;
        filter: FilterQuery<CollectionSchemaMap[TCollection]>;
        options?: FindOneOptions<TCollection>;
        skipCache?: boolean;
    }): Promise<CollectionSchemaMap[TCollection]>;
}
