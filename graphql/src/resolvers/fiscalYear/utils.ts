export const transmutationStage = {
  $addFields: {
    begin: { $toString: "$begin" },
    end: { $toString: "$end" },
  },
} as const;
