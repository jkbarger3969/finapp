import { DataSource } from "apollo-datasource";
import { MongoClient, Db, ClientSession, Filter as FilterQuery, OptionalId, UpdateFilter as UpdateQuery } from "mongodb";
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
     * Handles the session, and nested calls to withTransaction.
     *
     * NOTE: Transactions are disabled for local development.
     * MongoDB transactions require a replica set, which is complex to set up locally.
     * For production, configure MongoDB as a replica set and remove this bypass.
     */
    withTransaction<TReturn = unknown>(cb: (arg: {
        session: ClientSession;
    }) => Promise<TReturn>): Promise<TReturn>;
    insertOne<TCollection extends keyof CollectionSchemaMap>({ collection, doc, }: {
        collection: TCollection;
        doc: OptionalId<CollectionSchemaMap[TCollection]>;
    }): Promise<import("mongodb").InsertOneResult<CollectionSchemaMap[TCollection]>>;
    updateOne<TCollection extends keyof CollectionSchemaMap>({ collection, filter, update, }: {
        collection: TCollection;
        filter: FilterQuery<CollectionSchemaMap[TCollection]>;
        update: UpdateOne<TCollection>;
    }): Promise<import("mongodb").UpdateResult>;
    find<TCollection extends keyof CollectionSchemaMap>({ collection, filter, options, }: {
        collection: TCollection;
        filter: FilterQuery<CollectionSchemaMap[TCollection]>;
        options?: FindOneOptions<TCollection>;
        skipCache?: boolean;
    }): Promise<import("mongodb").WithId<CollectionSchemaMap[TCollection]>[]>;
    findOne<TCollection extends keyof CollectionSchemaMap>({ collection, filter, options, }: {
        collection: TCollection;
        filter: FilterQuery<CollectionSchemaMap[TCollection]>;
        options?: FindOneOptions<TCollection>;
        skipCache?: boolean;
    }): Promise<import("mongodb").WithId<CollectionSchemaMap[TCollection]>>;
}
