db.entries.aggregate([
  { $sort: { _id: 1 } },
  {
    $group: {
      _id: null,
      ids: { $addToSet: "$_id" },
    },
  },
  {
    $addFields: {
      end: { $indexOfArray: ["$ids", ObjectId("5e34a5eb73a5923d83b8e5dc")] },
    },
  },
  {
    $addFields: {
      start: { $sum: [1, "$end"] },
    },
  },
  {
    $project: {
      received: {
        $slice: ["$ids", 0, "$end"],
      },
      remaining: {
        $slice: ["$ids", "$start", 50],
      },
    },
  },
  { $unwind: "$received" },
  {
    $lookup: {
      from: "entries",
      localField: "received",
      foreignField: "_id",
      as: "received",
    },
  },
  {
    $group: {
      _id: null,
      remaining: { $first: "$remaining" },
      received: { $addToSet: { $arrayElemAt: ["$received", 0] } },
    },
  },
  { $unwind: "$remaining" },
  {
    $lookup: {
      from: "entries",
      localField: "remaining",
      foreignField: "_id",
      as: "remaining",
    },
  },
  {
    $group: {
      _id: null,
      received: { $first: "$received" },
      remaining: { $addToSet: { $arrayElemAt: ["$remaining", 0] } },
    },
  },
  {
    $addFields: {
      docs: {
        $concatArrays: [
          {
            $filter: {
              input: "$received",
              as: "item",
              cond: {
                $gt: [
                  "$$item.lastUpdate",
                  new Date("2020-01-31T15:30:11.067-07:00"),
                ],
              },
            },
          },
          "$remaining",
        ],
      },
    },
  },
  { $unwind: "$docs" },
  { $replaceRoot: { newRoot: "$docs" } },
]);
