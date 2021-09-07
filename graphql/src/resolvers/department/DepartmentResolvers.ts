import { ObjectId } from "mongodb";

import {
  BusinessDbRecord,
  DepartmentDbRecord,
} from "../../dataSources/accountingDb/types";
import {
  DepartmentResolvers,
  DepartmentAncestorResolvers,
  Department as TDepartment,
} from "../../graphTypes";
import { Context } from "../../types";
import { addTypename } from "../utils/queryUtils";
import { whereDepartments } from "./departments";

const budgets: DepartmentResolvers["budgets"] = ({ _id }, _, { db }) => {
  return db
    .collection("budgets")
    .find({
      "owner.type": "Department",
      "owner.id": _id,
    })
    .toArray();
};

const business: DepartmentResolvers["business"] = async (
  { parent },
  _,
  { db }
) => {
  if (parent.type === "Business") {
    return db.collection("businesses").findOne({ _id: parent.id });
  }

  let ancestor = await db
    .collection<DepartmentDbRecord>("departments")
    .findOne({ _id: parent.id });

  while (ancestor.parent.type !== "Business") {
    ancestor = await db
      .collection<DepartmentDbRecord>("departments")
      .findOne({ _id: ancestor.parent.id });
  }

  return db.collection("businesses").findOne({ _id: ancestor.parent.id });
};

const parent: DepartmentResolvers["parent"] = ({ parent }, _, { db }) =>
  addTypename(
    parent.type,
    db
      .collection(parent.type === "Business" ? "businesses" : "departments")
      .findOne({ _id: parent.id })
  );

const children: DepartmentResolvers["children"] = ({ _id }, _, { db }) =>
  db
    .collection("departments")
    .find({
      "parent.type": "Department",
      "parent.id": _id,
    })
    .toArray();

const ancestors: Extract<DepartmentResolvers["ancestors"], Function> = async (
  ...args
) => {
  const [{ parent }, { root }, { db }] = args;

  if (root) {
    const [rootDepartments, ancestorsArr] = await Promise.all([
      db
        .collection("departments")
        .find<{ _id: ObjectId }>(await whereDepartments(root, db), {
          projection: {
            _id: true,
          },
        })
        .toArray()
        .then(
          (results) => new Set(results.map(({ _id }) => _id.toHexString()))
        ),
      ancestors(args[0], {}, args[2], args[3]) as unknown as Promise<
        (DepartmentDbRecord | BusinessDbRecord)[]
      >,
    ]);

    const results: unknown[] = [];

    for (const ancestor of ancestorsArr) {
      results.push(ancestor);
      if (rootDepartments.has(ancestor._id.toHexString())) {
        return results;
      }
    }

    return [];
  } else if (parent.type === "Business") {
    return await addTypename(
      "Business",
      db.collection("businesses").find({ _id: parent.id }).toArray()
    );
  }
  const results: unknown[] = [];

  let ancestor = await addTypename(
    "Department",
    db.collection<DepartmentDbRecord>("departments").findOne({ _id: parent.id })
  );

  results.push(ancestor);

  while (ancestor.parent.type !== "Business") {
    ancestor = await addTypename(
      "Department",
      db
        .collection<DepartmentDbRecord>("departments")
        .findOne({ _id: ancestor.parent.id })
    );
    results.push(ancestor);
  }

  const biz = await addTypename(
    "Business",
    db.collection("businesses").findOne({ _id: ancestor.parent.id })
  );

  results.push(biz);

  return results;
};

const descendants: DepartmentResolvers["descendants"] = async (
  { _id },
  _,
  { db }
) => {
  const descendants: DepartmentDbRecord[] = [];

  const query = await db
    .collection("departments")
    .find({ "parent.type": "Department", "parent.id": _id })
    .toArray();

  while (query.length) {
    descendants.push(...query);
    query.push(
      ...(await db
        .collection("departments")
        .find({
          "parent.type": "Department",
          "parent.id": {
            $in: query.splice(0).map(({ _id }) => _id),
          },
        })
        .toArray())
    );
  }

  return descendants;
};

const DepartmentAncestorResolver: DepartmentAncestorResolvers<
  Context,
  | (DepartmentDbRecord & { __typename: "Department" })
  | (BusinessDbRecord & { __typename: "Business" })
> = {
  // Using addTypename on all resolvers returning DepartmentAncestor
  __resolveType: ({ __typename }) => __typename,
};

export const DepartmentAncestor =
  DepartmentAncestorResolver as unknown as DepartmentAncestorResolvers;

const DepartmentResolver: DepartmentResolvers<Context, DepartmentDbRecord> = {
  id: ({ _id }) => _id.toString(),
  budgets,
  business,
  parent,
  children,
  ancestors,
  descendants,
  virtualRoot: ({ virtualRoot }) => !!virtualRoot,
  // aliases: ({ _id }, _, { db }) =>
  //   getAliases("Department", _id, db) as unknown as ReturnType<
  //     DepartmentResolvers["aliases"]
  //   >,
};

export const Department = DepartmentResolver as unknown as DepartmentResolvers;
