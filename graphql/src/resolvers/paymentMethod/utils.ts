import DocHistory from "../utils/DocHistory";

export const $addFields = {
  ...DocHistory.getPresentValues(["active", "name", "refId"]),
  id: { $toString: "$_id" }
} as const;
