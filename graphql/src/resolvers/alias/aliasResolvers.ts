import { ObjectId } from "mongodb";
import { snakeCase } from "change-case";

import {
  AliasResolvers,
  AliasTargetResolvers,
  AliasType,
} from "../../graphTypes";
import { Context } from "../../types";
import { addTypename, NodeDbRecord } from "../utils/queryUtils";
import { AliasTargetTypes } from "./utils";

export interface AliasDbRecord {
  _id: ObjectId;
  target: NodeDbRecord<AliasTargetTypes>;
  name: string;
  type: string;
}

export const AliasTarget: AliasTargetResolvers = {
  // __typename added with addTypename
  __resolveType: ({ __typename }) => __typename,
} as any;

const AliasResolver: AliasResolvers<Context, AliasDbRecord> = {
  id: ({ _id }) => _id.toString(),
  target: ({ target: { type, id } }, _, { db }) => {
    switch (type) {
      case "Category":
        return addTypename(
          type,
          db.collection("categories").findOne({ _id: new ObjectId(id) })
        ) as any;
      case "Department":
        return addTypename(
          type,
          db.collection("departments").findOne({ _id: new ObjectId(id) })
        ) as any;
    }
  },
  type: ({ type }) => snakeCase(type).toUpperCase() as AliasType,
};

export const Alias = AliasResolver as unknown as AliasResolvers;
