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
