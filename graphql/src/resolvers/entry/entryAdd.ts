import { ObjectId } from "mongodb";
import * as moment from "moment";

import { MutationResolvers, EntryType, SourceType } from "../../graphTypes";
import DocHistory from "../utils/DocHistory";
import { getSrcCollectionAndNode, stages } from "./utils";
import { JOURNAL_ENTRY_ADDED, JOURNAL_ENTRY_UPSERTED } from "./pubSubs";
import { addBusiness } from "../business";
import { addPerson } from "../person";
import { generatorInit } from "../../utils/iterableFns";
import { isValid } from "date-fns";

const entryAdd: MutationResolvers["entryAdd"] = (obj, args, context, info) =>
  new Promise(async (resolve, reject) => {
    const { client, db, nodeMap, user, pubSub } = context;

    const session = context.ephemeral?.session || client.startSession();

    const resolver = generatorInit<never[], unknown>(function* () {
      try {
        // generatorInit calls 1st next. On 2nd next capture update doc
        const newEntry = yield;
        yield; // Pause
        // on 3rd next resolve with the update doc and run pubSubs
        resolve(newEntry);
        pubSub
          .publish(JOURNAL_ENTRY_ADDED, { entryAdded: newEntry })
          .catch((error) => console.error(error));
        pubSub
          .publish(JOURNAL_ENTRY_UPSERTED, { entryUpserted: newEntry })
          .catch((error) => console.error(error));
      } catch (error) {
        // on throw reject with error.
        reject(error);
      }
    });

    try {
      await session.withTransaction(async () => {
        const {
          fields: {
            date: dateString,
            dateOfRecord,
            department: departmentId,
            type,
            category: categoryId,
            source,
            total,
          },
          businessAdd,
          personAdd,
        } = args;

        // "businessAdd" and "personAdd" are mutually exclusive, gql has
        // no concept of this.
        if (businessAdd && personAdd) {
          throw new Error(
            `"businessAdd" and "personAdd" are mutually exclusive source creation arguments.`
          );
        }

        if (total.s < 0 || total.n === 0) {
          throw new Error("Entry total must be greater than 0.");
        }

        const date = moment(dateString, moment.ISO_8601);
        if (!date.isValid()) {
          throw new Error(
            `Date "${dateString}" not a valid ISO 8601 date string.`
          );
        }

        const reconciled = args.fields.reconciled ?? false;

        const description = (args.fields.description ?? "").trim();

        const docHistory = new DocHistory(user.id);

        //Start building insert doc
        const docBuilder = docHistory
          .newHistoricalDoc(true)
          .addField("date", date.toDate())
          .addField("total", total)
          .addField("type", type === EntryType.Credit ? "credit" : "debit")
          .addField("deleted", false)
          .addField("reconciled", reconciled);
        if (description) {
          docBuilder.addField("description", description);
        }

        if (dateOfRecord) {
          const date = new Date(dateOfRecord.date);
          if (!isValid(date)) {
            throw new Error(
              `Date of record "${dateOfRecord.date}" not a valid ISO 8601 date string.`
            );
          }

          docBuilder.addNonHistoricalFieldValue(
            "dateOfRecord",
            docHistory
              .newHistoricalDoc(false)
              .addField("date", date)
              .addField("overrideFiscalYear", dateOfRecord.overrideFiscalYear)
              .doc()
          );
        }

        // Async validation and new documents
        await Promise.allSettled([
          // Department
          (async () => {
            if (departmentId) {
              const { collection, id: node } = nodeMap.typename.get(
                "Department"
              );
              const id = new ObjectId(departmentId);

              if (
                0 ===
                (await db
                  .collection(collection)
                  .countDocuments({ _id: id }, { session }))
              ) {
                throw new Error(
                  `Department with id "${departmentId}" does not exist.`
                );
              }

              docBuilder.addField("department", {
                node: new ObjectId(node),
                id,
              });
            }
          })(),
          // Category
          (async () => {
            if (categoryId) {
              const { collection, id: node } = nodeMap.typename.get("Category");

              const id = new ObjectId(categoryId);

              const result = await db
                .collection(collection)
                .findOne<{ type: "credit" | "debit" }>(
                  { _id: id },
                  {
                    projection: {
                      type: true,
                    },
                  }
                );

              if (!result) {
                throw new Error(
                  `Category with id "${categoryId}" does not exist.`
                );
              }
              const catType =
                result.type === "credit" ? EntryType.Credit : EntryType.Debit;

              // Category must match transaction type.
              if (catType !== type) {
                throw new Error(
                  `Category with id "${categoryId}" and type "${catType}" is incompatible with entry type "${type}".`
                );
              }

              docBuilder.addField("category", { node: new ObjectId(node), id });
            }
          })(),
          // Source
          (async () => {
            if (businessAdd) {
              const { id } = await addBusiness(
                obj,
                { fields: businessAdd },
                { ...context, ephemeral: { session } },
                info
              );

              const { node } = getSrcCollectionAndNode(
                db,
                SourceType.Business,
                nodeMap
              );

              docBuilder.addField("source", {
                node,
                id: new ObjectId(id),
              });
            } else if (personAdd) {
              const { id } = await addPerson(
                obj,
                { fields: personAdd },
                { ...context, ephemeral: { session } },
                info
              );

              const { node } = getSrcCollectionAndNode(
                db,
                SourceType.Person,
                nodeMap
              );

              docBuilder.addField("source", {
                node,
                id: new ObjectId(id),
              });
            } else if (source) {
              const { id: sourceId, sourceType } = source;

              const { collection, node } = getSrcCollectionAndNode(
                db,
                sourceType,
                nodeMap
              );

              const id = new ObjectId(sourceId);

              if (
                0 ===
                (await collection.countDocuments({ _id: id }, { session }))
              ) {
                throw new Error(
                  `Source type "${sourceType}" with id "${sourceId}" does not exist.`
                );
              }

              docBuilder.addField("source", {
                node,
                id,
              });
            }
          })(),
          // Payment Method
          (async () => {})(),
        ]).then((results) => {
          const errorMsgs = results.reduce((errorMsgs, result) => {
            if (result.status === "rejected") {
              errorMsgs.push(
                result.reason instanceof Error
                  ? result.reason.message
                  : `${result.reason}`
              );
            }
            return errorMsgs;
          }, []);

          if (errorMsgs.length > 0) {
            return Promise.reject(new Error(errorMsgs.join("\n")));
          }
        });

        const { insertedId, insertedCount } = await db
          .collection("journalEntries")
          .insertOne(docBuilder.doc(), { session });

        if (insertedCount === 0) {
          throw new Error(
            `Failed to add journal entry: ${JSON.stringify(args, null, 2)}`
          );
        }

        const [newEntry] = await db
          .collection("journalEntries")
          .aggregate(
            [
              { $match: { _id: insertedId } },
              stages.entryAddFields,
              stages.entryTransmutations,
            ],
            { session }
          )
          .toArray();

        resolver.next(newEntry);
      });
    } catch (e) {
      resolver.throw(e);
    } finally {
      resolver.next();
      session.endSession();
    }
  });

export default entryAdd;
