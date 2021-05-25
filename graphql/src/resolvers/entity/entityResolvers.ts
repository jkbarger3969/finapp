import { Db } from "mongodb";
import { EntityResolvers, Entity as EntityType } from "../../graphTypes";
import { Context } from "../../types";
import { addTypename, NodeDbRecord } from "../utils/queryUtils";

export type EntityTypename = "Person" | "Business" | "Department";

export type EntityDbRecord = NodeDbRecord<EntityTypename>;

export const getEntity = (node: EntityDbRecord, db: Db) => {
  const { type, id } = node;

  switch (type) {
    case "Business":
      return addTypename(
        type,
        db.collection("businesses").findOne({ _id: id })
      );
    case "Department":
      return addTypename(
        type,
        db.collection("departments").findOne({ _id: id })
      );
    case "Person":
      return addTypename(type, db.collection("people").findOne({ _id: id }));
  }
};

export const getEntities = (nodes: EntityDbRecord[], db: Db) =>
  Promise.all(nodes.map((node) => getEntity(node, db)));

const EntityResolver: EntityResolvers<Context, EntityType> = {
  __resolveType: ({ __typename }) => __typename,
};
export const Entity = (EntityResolver as unknown) as EntityResolvers;
