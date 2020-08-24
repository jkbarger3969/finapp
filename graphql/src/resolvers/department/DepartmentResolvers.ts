import { ObjectId, Db } from "mongodb";

import {
  Department,
  DepartmentResolvers as TDepartmentResolvers,
  BudgetOwnerType,
  DepartmentAncestor,
  DepartmentAncestorType,
  DepartmentAncestorInput,
  Business,
} from "../../graphTypes";
import { nodeDocResolver } from "../utils/nodeResolver";
import { Context } from "../../types";
import { Returns as DeptReturns } from "./department";
import { Returns as BizReturns } from "../business/business";
import budgetsQuery from "../budget/budgets";
import departmentsQuery from "./departments";
import { GraphQLResolveInfo } from "graphql/type";

const bizNode = new ObjectId("5dc476becf96e166daa9fd0b");

const budgets: TDepartmentResolvers["budgets"] = (doc, args, context, info) => {
  return budgetsQuery(
    doc,
    {
      where: {
        owner: {
          eq: {
            id: doc.id,
            type: BudgetOwnerType.Department,
          },
        },
      },
    },
    context,
    info
  );
};

const ancestors: TDepartmentResolvers["ancestors"] = async (
  doc,
  args,
  context,
  info
) => {
  const ancestors: unknown[] = [];

  let parent = await nodeDocResolver<BizReturns | DeptReturns>(
    //Actual doc is NOT the fully resolved DepartmentAncestor.
    ((doc as unknown) as DeptReturns).parent,
    context
  );
  ancestors.push(parent);
  while (parent.__typename !== "Business") {
    parent = await nodeDocResolver<BizReturns | DeptReturns>(
      (parent as DeptReturns).parent,
      context
    );
    ancestors.push(parent);
  }

  return ancestors as DepartmentAncestor[];
};

const business: TDepartmentResolvers["business"] = async (
  doc,
  args,
  context,
  info
) => {
  let { parent } = (doc as unknown) as DeptReturns;

  while (!bizNode.equals(parent.node)) {
    ({ parent } = await context.db
      .collection("department")
      .find<DeptReturns>(
        {
          _id: parent.id,
        },
        { projection: { parent: 1 } }
      )
      .next());
  }

  return (nodeDocResolver(parent, context) as unknown) as Business;
};

const parent: TDepartmentResolvers["parent"] = (doc, args, context, info) =>
  nodeDocResolver(((doc as unknown) as DeptReturns).parent, context);

export const getDeptDescendants = async (
  fromParent: DepartmentAncestorInput,
  context: Context,
  info: GraphQLResolveInfo
) => {
  const descendantsArr: unknown[] = [];

  const promises: Promise<void>[] = (
    await departmentsQuery(
      {},
      {
        where: {
          parent: {
            eq: fromParent,
          },
        },
      },
      context,
      info
    )
  ).map(async (descendant) => {
    descendant = await descendant;
    descendantsArr.push(
      descendant,
      ...(await getDeptDescendants(
        { id: descendant.id, type: DepartmentAncestorType.Department },
        context,
        info
      ))
    );
  });

  await Promise.all(promises);
  return descendantsArr as Department[];
};

const descendants: TDepartmentResolvers["descendants"] = (
  doc,
  args,
  context,
  info
) => {
  return getDeptDescendants(
    {
      id: ((doc as unknown) as DeptReturns).id,
      type: DepartmentAncestorType.Department,
    },
    context,
    info
  );
};

const DepartmentResolvers: TDepartmentResolvers = {
  budgets,
  business,
  ancestors,
  parent,
  descendants,
};

export default DepartmentResolvers;
