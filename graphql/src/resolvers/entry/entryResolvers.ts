import { ObjectId } from "mongodb";
import {
  EntryResolvers,
  Scalars,
  EntryItemResolvers,
  EntryRefundResolvers,
} from "../../graphTypes";
import { addTypename } from "../utils/queryUtils";

export const EntryItem: EntryItemResolvers = {
  id: ({ id }) => id.toString(),
  category: async ({ category, id }, _, { loaders }) => {
    if (!category?.[0]?.value) {
      console.warn(`EntryItem ${id} has no category`);
      return {
        _id: new ObjectId(),
        name: "Unknown Category",
        code: "UNKNOWN",
        externalId: "unknown",
        type: "Debit",
        inactive: true,
        donation: false,
        active: false,
        hidden: true,
      } as any;
    }
    const cat = await loaders.category.load(category[0].value.toString());
    if (!cat) {
      return {
        _id: new ObjectId(category[0].value.toString()),
        name: "Unknown Category",
        code: "UNKNOWN",
        externalId: category[0].value.toString(),
        type: "Debit",
        inactive: true,
        donation: false,
        active: false,
        hidden: true,
      } as any;
    }
    return cat;
  },
  deleted: ({ deleted }) => deleted?.[0]?.value ?? false,
  department: ({ department }, _, { loaders }) =>
    department?.[0]?.value ? loaders.department.load(department[0].value.toString()) : null,
  description: ({ description }) => (description ? description[0]?.value || null : null),
  // lastUpdate: Default works
  total: ({ total }) => total?.[0]?.value as any ?? 0,
  units: ({ units }) => units?.[0]?.value ?? 0,
};

export const EntryRefund: EntryRefundResolvers = {
  id: ({ id }) => id.toString(),
  date: ({ date }) => date?.[0]?.value ?? new Date(),
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
        date: dateOfRecord.date?.[0]?.value ?? new Date(),
        overrideFiscalYear: dateOfRecord.overrideFiscalYear?.[0]?.value ?? false,
      }
      : null,

  fiscalYear: async (
    { date, dateOfRecord },
    _,
    { loaders }
  ) => {
    const entryDate = date?.[0]?.value ?? new Date();
    const value = dateOfRecord?.overrideFiscalYear?.[0]?.value
      ? dateOfRecord.date?.[0]?.value ?? entryDate
      : entryDate;

    try {
      const years = await loaders.allFiscalYears.load("ALL");
      const match = years?.find(fy => value >= fy.begin && value < fy.end);
      if (match) return match;
    } catch (error) {
      console.error("Error loading fiscal years for refund:", error);
    }

    // Fallback
    const year = value.getFullYear();
    return {
      _id: new ObjectId(),
      name: `FY${year} (Fallback)`,
      begin: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
    } as any;
  },
  deleted: ({ deleted }) => deleted?.[0]?.value ?? false,
  description: ({ description }) => description?.[0]?.value || null,
  entry: ({ id }, _, { dataSources: { accountingDb } }) =>
    accountingDb.findOne({
      collection: "entries",
      filter: {
        "refunds.id": id,
      },
    }),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod?.[0]?.value ?? { currency: "USD" },
  reconciled: ({ reconciled }) => reconciled?.[0]?.value ?? false,
  total: ({ total }) => total?.[0]?.value as any ?? 0,
};

export const Entry: EntryResolvers = {
  id: ({ _id }) => _id.toString(),
  category: async ({ category, _id }, _, { loaders }) => {
    if (!category?.[0]?.value) {
      console.warn(`Entry ${_id} has no category`);
      return {
        _id: new ObjectId(),
        name: "Unknown Category",
        code: "UNKNOWN",
        externalId: "unknown",
        type: "Debit",
        inactive: true,
        donation: false,
        active: false,
        hidden: true,
      } as any;
    }
    const categoryId = category[0].value.toString();
    const cat = await loaders.category.load(categoryId);
    if (!cat) {
      console.warn(`Entry ${_id} references missing/hidden category: ${categoryId}`);
      return {
        _id: new ObjectId(categoryId),
        name: "Unknown Category",
        code: "UNKNOWN",
        externalId: categoryId,
        type: "Debit",
        inactive: true,
        donation: false,
        active: false,
        hidden: true,
      } as any;
    }
    return cat;
  },

  date: ({ date }) => date?.[0]?.value ?? new Date(),
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
        date: dateOfRecord.date?.[0]?.value ?? new Date(),
        overrideFiscalYear: dateOfRecord.overrideFiscalYear?.[0]?.value ?? false,
      }
      : null,
  deleted: ({ deleted }) => deleted?.[0]?.value ?? false,
  department: async ({ department, _id }, _, { loaders }) => {
    if (!department?.[0]?.value) {
      console.warn(`Entry ${_id} has no department`);
      return null;
    }
    return loaders.department.load(department[0].value.toString());
  },
  description: ({ description }) =>
    description ? description[0]?.value || null : null,
  fiscalYear: async (
    { date, dateOfRecord },
    _,
    { loaders }
  ) => {
    const entryDate = date?.[0]?.value ?? new Date();
    const value = dateOfRecord?.overrideFiscalYear?.[0]?.value
      ? dateOfRecord.date?.[0]?.value ?? entryDate
      : entryDate;

    try {
      const years = await loaders.allFiscalYears.load("ALL");
      if (!years || years.length === 0) {
        console.warn("No fiscal years found in DB.");
      }
      const match = years?.find(fy => value >= fy.begin && value < fy.end);
      if (match) return match;
    } catch (error) {
      console.error("Error loading fiscal years:", error);
    }

    // Fallback if no FY found (prevents GraphQL non-nullable error)
    const year = value.getFullYear();
    return {
      _id: new ObjectId(), // Dummy ID
      name: `FY${year} (Fallback)`,
      begin: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
    } as any;
  },
  items: ({ items }) => items ?? ([] as any),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod?.[0]?.value ?? { currency: "USD" },
  reconciled: ({ reconciled }) => reconciled?.[0]?.value ?? false,
  refunds: ({ refunds }) => refunds || [],
  source: async ({ source, _id }, _, { loaders }): Promise<any> => {
    if (!source?.[0]?.value) {
      console.warn(`Entry ${_id} has no source`);
      return { __typename: 'Business', id: 'unknown', name: 'Unknown Source' } as any;
    }

    const sourceValue = source[0].value;
    const type = sourceValue?.type;
    const id = sourceValue?.id;

    if (!type || !id) {
      console.warn(`Entry ${_id} has invalid source (type: ${type}, id: ${id})`);
      return { __typename: 'Business', id: id?.toString() || 'unknown', name: 'Unknown Source' } as any;
    }

    let result: any = null;
    switch (type) {
      case "Business":
        result = await loaders.business.load(id.toString());
        if (result) return addTypename(type, result);
        break;
      case "Department":
        result = await loaders.department.load(id.toString());
        if (result) return addTypename(type, result);
        break;
      case "Person":
        result = await loaders.person.load(id.toString());
        if (result) return addTypename(type, result);
        break;
    }

    console.warn(`Entry source ${type}:${id} not found for entry ${_id}`);
    return { __typename: 'Business', id: id.toString(), name: `Unknown ${type}` } as any;
  },
  total: ({ total }) => total?.[0]?.value as any ?? 0,
  lastEditedAt: (root) => root.lastUpdate,
  lastEditedBy: async (root, _, { loaders }) => {
    // Find the most recent change across all fields
    let latest: { date: Date; by: string } | null = null;
    const fields = ["category", "date", "department", "description", "paymentMethod", "reconciled", "total"];

    for (const key of fields) {
      const history = (root as any)[key] as any[];
      if (history && history.length > 0) {
        const first = history[0];
        if (!latest || first.createdOn > latest.date) {
          latest = { date: first.createdOn, by: first.createdBy.toString() };
        }
      }
    }

    if (latest) {
      const person = await loaders.person.load(latest.by);
      return person ? person.name.first + " " + person.name.last : latest.by;
    }
    return null;
  },
  editHistory: async (root, _, { loaders }) => {
    const historyMap = new Map<string, {
      id: string;
      editedAt: Date;
      editedByUserId: string;
      changes: Record<string, { old: any; new: any }>;
    }>();

    // Fields to track in history
    const fields = ["category", "date", "department", "description", "paymentMethod", "reconciled", "total"];

    for (const key of fields) {
      const history = (root as any)[key] as any[];
      if (!history || history.length === 0) continue;

      // Iterate backwards to calculate changes (oldest to newest)
      // Actually, we want to group by "transaction" (createdOn/By)

      for (let i = 0; i < history.length; i++) {
        const entry = history[i];
        const uniqueKey = `${entry.createdOn.getTime()}-${entry.createdBy.toString()}`;

        if (!historyMap.has(uniqueKey)) {
          historyMap.set(uniqueKey, {
            id: uniqueKey,
            editedAt: new Date(entry.createdOn),
            editedByUserId: entry.createdBy.toString(),
            changes: {}
          });
        }

        const group = historyMap.get(uniqueKey)!;
        const newValue = entry.value;
        // The "old" value is the next one in the array (i+1), or null if this is the first (creation)
        const oldValue = (i + 1 < history.length) ? history[i + 1].value : null;

        // Simple serialization for display
        const formatVal = (val: any) => {
          if (val && typeof val === 'object' && val.toString && Object.keys(val).length === 0) return val.toString();
          // Handle MongoDB ObjectIds
          if (val && val._bsontype === 'ObjectID') return val.toString();
          // Handle Rational objects
          if (val && typeof val.n === 'number' && typeof val.d === 'number') return `${val.n}/${val.d}`;
          return val;
        };

        // Only add if there is an actual change (or it's the initial value)
        group.changes[key] = {
          old: formatVal(oldValue),
          new: formatVal(newValue)
        };
      }
    }

    // Convert map to array and sort by date descending
    const result = Array.from(historyMap.values()).sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime());

    // Resolve user emails
    return Promise.all(result.map(async (item) => {
      const person = await loaders.person.load(item.editedByUserId);
      return {
        id: item.id,
        editedAt: item.editedAt,
        editedBy: person ? (person.email || `${person.name.first} ${person.name.last}`) : item.editedByUserId,
        changes: item.changes
      };
    }));
  }
};
