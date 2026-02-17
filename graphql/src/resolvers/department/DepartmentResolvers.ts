import { ObjectId } from "mongodb";

import {
  BusinessDbRecord,
  DepartmentDbRecord,
} from "../../dataSources/accountingDb/types";
import {
  DepartmentResolvers,
  DepartmentAncestorResolvers,
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
    .toArray() as any;
};

const business: DepartmentResolvers["business"] = async (
  { parent },
  _,
  { dataSources: { accountingDb } }
) => {
  if (!parent || !parent.type || !parent.id) {
    console.warn("Department has invalid parent:", parent);
    return null;
  }
  
  if (parent.type === "Business") {
    return accountingDb.findOne({
      collection: "businesses",
      filter: { _id: parent.id },
    });
  }

  let ancestor = await accountingDb.findOne({
    collection: "departments",
    filter: { _id: parent.id },
  });

  while (ancestor?.parent?.type !== "Business") {
    if (!ancestor?.parent?.id) {
      console.warn("Department ancestor chain broken:", ancestor);
      return null;
    }
    ancestor = await accountingDb.findOne({
      collection: "departments",
      filter: { _id: ancestor.parent.id },
    });
  }

  return accountingDb.findOne({
    collection: "businesses",
    filter: { _id: ancestor.parent.id },
  });
};

const parent: DepartmentResolvers["parent"] = (
  { parent },
  _,
  { dataSources: { accountingDb } }
) => {
  if (!parent || !parent.type || !parent.id) {
    console.warn("Department has invalid parent reference:", parent);
    return null;
  }
  
  return addTypename(
    parent.type,
    accountingDb.findOne({
      collection: parent.type === "Business" ? "businesses" : "departments",
      filter: {
        _id: parent.id,
      },
    })
  );
};

const children: DepartmentResolvers["children"] = (
  { _id },
  _,
  { dataSources: { accountingDb } }
) =>
  accountingDb.find({
    collection: "departments",
    filter: {
      "parent.type": "Department",
      "parent.id": _id,
    },
  });

const ancestors: Extract<DepartmentResolvers["ancestors"], Function> = async (
  ...args
) => {
  const [
    { parent },
    { root },
    {
      dataSources: { accountingDb },
    },
  ] = args;

  // Safety check for parent
  if (!parent || !parent.type || !parent.id) {
    console.warn("Department ancestors: invalid parent:", parent);
    return [];
  }

  if (root) {
    const [rootDepartments, ancestorsArr] = await Promise.all([
      accountingDb
        .find({
          collection: "departments",
          filter: await whereDepartments(root, accountingDb.db),
          options: {
            projection: {
              _id: true,
            },
          },
        })
        .then(
          (results) => new Set(results.map(({ _id }) => _id.toHexString()))
        ),
      ancestors(args[0], {}, args[2], args[3]),
    ]);

    const results: (DepartmentDbRecord | BusinessDbRecord)[] = [];

    for await (const ancestor of ancestorsArr) {
      results.push(ancestor);
      if (rootDepartments.has(ancestor._id.toHexString())) {
        return results;
      }
    }

    return [];
  } else if (parent.type === "Business") {
    return await addTypename(
      "Business",
      accountingDb.find({
        collection: "businesses",
        filter: { _id: parent.id },
      })
    );
  }
  const results: (DepartmentDbRecord | BusinessDbRecord)[] = [];

  let ancestor = await addTypename(
    "Department",
    accountingDb.findOne({
      collection: "departments",
      filter: { _id: parent.id },
    })
  );

  if (!ancestor) {
    console.warn("Department ancestors: ancestor not found for parent.id:", parent.id);
    return results;
  }

  results.push(ancestor);

  while (ancestor?.parent?.type !== "Business") {
    if (!ancestor?.parent?.id) {
      console.warn("Department ancestors: ancestor chain broken:", ancestor);
      break;
    }
    ancestor = await addTypename(
      "Department",
      accountingDb.findOne({
        collection: "departments",
        filter: { _id: ancestor.parent.id },
      })
    );
    if (!ancestor) break;
    results.push(ancestor);
  }

  if (ancestor?.parent?.id) {
    const biz = await addTypename(
      "Business",
      accountingDb.findOne({
        collection: "businesses",
        filter: { _id: ancestor.parent.id },
      })
    );

    if (biz) {
      results.push(biz);
    }
  }

  return results;
};

const descendants: DepartmentResolvers["descendants"] = async (
  { _id },
  _,
  { dataSources: { accountingDb } }
) => {
  const descendants: DepartmentDbRecord[] = [];

  const query = await accountingDb.find({
    collection: "departments",
    filter: { "parent.type": "Department", "parent.id": _id },
  });

  while (query.length) {
    descendants.push(...query);
    query.push(
      ...(await accountingDb.find({
        collection: "departments",
        filter: {
          "parent.type": "Department",
          "parent.id": {
            $in: query.splice(0).map(({ _id }) => _id),
          },
        },
      }))
    );
  }

  return descendants;
};

const disable: DepartmentResolvers["disable"] = (
  { disable },
  _,
  { dataSources: { accountingDb } }
) => {
  return disable
    ? accountingDb.find({
      collection: "fiscalYears",
      filter: {
        _id: { $in: disable },
      },
    })
    : [];
};

const DepartmentAncestorResolver: DepartmentAncestorResolvers<
  Context,
  DepartmentDbRecord | BusinessDbRecord
> = {
  __resolveType: (obj) => {
    if ("parent" in obj) {
      return "Department";
    }
    return "Business";
  },
};

export const DepartmentAncestor =
  DepartmentAncestorResolver as unknown as DepartmentAncestorResolvers;

const DepartmentResolver: DepartmentResolvers<Context, DepartmentDbRecord> = {
  __isTypeOf: (obj) => "parent" in obj,
  id: ({ _id }) => _id.toString(),
  budgets,
  business,
  parent,
  disable,
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
