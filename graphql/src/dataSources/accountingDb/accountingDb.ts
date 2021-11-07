import { DataSource, DataSourceConfig } from "apollo-datasource";
import {
  MongoClient,
  Db,
  ClientSession,
  FilterQuery,
  OptionalId,
  UpdateQuery,
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
   * Handles the session, and nested calls to withTransaction,
   */
  async withTransaction<TReturn = unknown>(
    cb: (arg: { session: ClientSession }) => Promise<TReturn>
  ): Promise<TReturn> {
    const cleanUp = () => {
      if (--this.#sessionRefCount === 0) {
        this.#session.endSession();
        this.#session = null;
      }
    };

    let result: TReturn;

    try {
      if (this.#sessionRefCount++ === 0) {
        this.#session = this.#client.startSession();

        await this.#session.withTransaction(() =>
          this.withTransaction(cb).then((value) => {
            result = value;
          })
        );
      } else {
        result = await cb({ session: this.#session });
      }
      cleanUp();
      return result;
    } catch (e) {
      cleanUp();
      throw e;
    }
  }

  insertOne<TCollection extends keyof CollectionSchemaMap>({
    collection,
    doc,
  }: {
    collection: TCollection;
    doc: OptionalId<CollectionSchemaMap[TCollection]>;
  }) {
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
