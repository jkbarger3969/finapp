import { DataSource, DataSourceConfig } from "apollo-datasource";
import {
  MongoClient,
  Db,
  ClientSession,
  Filter as FilterQuery,
  OptionalId,
  UpdateFilter as UpdateQuery,
  InsertOneResult,
} from "mongodb";

import { Context } from "../../types";
import { FindOneOptions, CollectionSchemaMap } from "./types";

export type UpdateOne<TCollection extends keyof CollectionSchemaMap> =
  UpdateQuery<CollectionSchemaMap[TCollection]>;

export class AccountingDb extends DataSource<Context> {
  readonly #client: MongoClient;
  readonly #db: Db;
  #session: ClientSession | null = null;
  #sessionRefCount: number = 0;
  constructor({ client }: { client: MongoClient }) {
    super();
    this.#client = client;
    this.#db = client.db("accounting");
  }
  get client(): MongoClient {
    return this.#client;
  }

  get db(): Db {
    return this.#db;
  }

  getCollection<TCollection extends keyof CollectionSchemaMap>(
    collection: TCollection
  ) {
    return this.#db.collection<CollectionSchemaMap[TCollection]>(collection);
  }

  /**
   * Handles the session, and nested calls to withTransaction.
   * 
   * NOTE: Transactions are disabled for local development.
   * MongoDB transactions require a replica set, which is complex to set up locally.
   * For production, configure MongoDB as a replica set and remove this bypass.
   */
  async withTransaction<TReturn = unknown>(
    cb: (arg: { session: ClientSession }) => Promise<TReturn>
  ): Promise<TReturn> {
    // Bypass transactions for development - just execute the callback
    // Pass null session (most MongoDB operations work without sessions)
    return await cb({ session: null as any });
  }

  insertOne<TCollection extends keyof CollectionSchemaMap>({
    collection,
    doc,
  }: {
    collection: TCollection;
    doc: OptionalId<CollectionSchemaMap[TCollection]>;
  }): Promise<InsertOneResult<CollectionSchemaMap[TCollection]>> {
    return this.#db
      .collection<CollectionSchemaMap[TCollection]>(collection)
      .insertOne(
        doc,
        this.#session && this.#session.inTransaction()
          ? {
            session: this.#session,
          }
          : undefined
      );
  }

  updateOne<TCollection extends keyof CollectionSchemaMap>({
    collection,
    filter,
    update,
  }: {
    collection: TCollection;
    filter: FilterQuery<CollectionSchemaMap[TCollection]>;
    update: UpdateOne<TCollection>;
  }) {
    return this.#db
      .collection<CollectionSchemaMap[TCollection]>(collection)
      .updateOne(
        filter,
        update,
        this.#session && this.#session.inTransaction()
          ? {
            session: this.#session,
          }
          : undefined
      );
  }

  find<TCollection extends keyof CollectionSchemaMap>({
    collection,
    filter,
    options,
  }: {
    collection: TCollection;
    filter: FilterQuery<CollectionSchemaMap[TCollection]>;
    options?: FindOneOptions<TCollection>;
    skipCache?: boolean;
  }) {
    return this.#db
      .collection<CollectionSchemaMap[TCollection]>(collection)
      .find(
        filter,
        this.#session && this.#session.inTransaction()
          ? {
            session: this.#session,
            ...options,
          }
          : options
      )
      .toArray();
  }

  findOne<TCollection extends keyof CollectionSchemaMap>({
    collection,
    filter,
    options,
  }: {
    collection: TCollection;
    filter: FilterQuery<CollectionSchemaMap[TCollection]>;
    options?: FindOneOptions<TCollection>;
    skipCache?: boolean;
  }) {
    return this.#db
      .collection<CollectionSchemaMap[TCollection]>(collection)
      .findOne(
        filter,
        this.#session && this.#session.inTransaction()
          ? {
            session: this.#session,
            ...options,
          }
          : options
      );
  }
}
