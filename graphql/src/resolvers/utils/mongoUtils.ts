import { ObjectId, Collection } from "mongodb";

export const mergeObjects = <T extends string>(fields: Iterable<T>) => {
  const $group: object = { _id: null, __ids: { $addToSet: "$_id" } };
  const $project: object = {
    _id: {
      $reduce: {
        input: "$__ids",
        initialValue: null,
        in: { $ifNull: ["$$this", "$$value"] },
      },
    },
  };

  for (const field of fields) {
    $group[field as string] = { $addToSet: `$${field}` };
    $project[field as string] = {
      $reduce: {
        input: `$${field}`,
        initialValue: null,
        in: { $ifNull: ["$$this", "$$value"] },
      },
    };
  }

  return [{ $group }, { $project }] as const;
};

export const getUniqueId = async (idField: string, collection: Collection) => {
  const id = new ObjectId();

  const [{ count } = { count: 0 }] = await collection
    .aggregate([{ $match: { [idField]: id } }, { $count: "count" }])
    .toArray();

  return count === 0 ? id : getUniqueId(idField, collection);
};

export const addId = { $addFields: { id: { $toString: "$_id" } } } as const;
