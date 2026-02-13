import {
  EntryResolvers,
  Scalars,
  EntryItemResolvers,
  EntryRefundResolvers,
} from "../../graphTypes";
import { addTypename } from "../utils/queryUtils";

export const EntryItem: EntryItemResolvers = {
  id: ({ id }) => id.toString(),
  category: ({ category }, _, { loaders }) =>
    loaders.category.load(category[0].value.toString()),
  deleted: ({ deleted }) => deleted[0].value,
  department: ({ department }, _, { loaders }) =>
    department ? loaders.department.load(department[0].value.toString()) : null,
  description: ({ description }) => (description ? description[0].value : null),
  // lastUpdate: Default works
  total: ({ total }) => total[0].value as any,
  units: ({ units }) => units[0].value,
};

export const EntryRefund: EntryRefundResolvers = {
  id: ({ id }) => id.toString(),
  date: ({ date }) => date[0].value,
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
        date: dateOfRecord.date[0].value,
        overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
      }
      : null,

  fiscalYear: async (
    { date, dateOfRecord },
    _,
    { loaders }
  ) => {
    const value = dateOfRecord?.overrideFiscalYear[0].value
      ? dateOfRecord.date[0].value
      : date[0].value;

    const years = await loaders.allFiscalYears.load("ALL");
    return years.find(fy => value >= fy.begin && value < fy.end) || null;
  },
  deleted: ({ deleted }) => deleted[0].value,
  description: ({ description }) => (description ? description[0].value : null),
  entry: ({ id }, _, { dataSources: { accountingDb } }) =>
    accountingDb.findOne({
      collection: "entries",
      filter: {
        "refunds.id": id,
      },
    }),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
  reconciled: ({ reconciled }) => reconciled[0].value,
  total: ({ total }) => total[0].value as any,
};

export const Entry: EntryResolvers = {
  id: ({ _id }) => _id.toString(),
  category: ({ category }, _, { loaders }) =>
    loaders.category.load(category[0].value.toString()),

  date: ({ date }) => date[0].value,
  dateOfRecord: ({ dateOfRecord }) =>
    dateOfRecord
      ? {
        date: dateOfRecord.date[0].value,
        overrideFiscalYear: dateOfRecord.overrideFiscalYear[0].value,
      }
      : null,
  deleted: ({ deleted }) => deleted[0].value,
  department: ({ department }, _, { loaders }) =>
    loaders.department.load(department[0].value.toString()),
  description: ({ description }) =>
    description ? description[0]?.value || null : null,
  fiscalYear: async (
    { date, dateOfRecord },
    _,
    { loaders }
  ) => {
    const value = dateOfRecord?.overrideFiscalYear[0].value
      ? dateOfRecord.date[0].value
      : date[0].value;

    const years = await loaders.allFiscalYears.load("ALL");
    return years.find(fy => value >= fy.begin && value < fy.end) || null;
  },
  items: ({ items }) => items ?? ([] as any),
  // lastUpdate: Default works
  paymentMethod: ({ paymentMethod }) => paymentMethod[0].value,
  reconciled: ({ reconciled }) => reconciled[0].value,
  refunds: ({ refunds }) => refunds || [],
  source: async ({ source, _id }, _, { loaders }): Promise<any> => {
    if (!source?.[0]?.value) {
      console.error(`Entry ${_id} has no source`);
      return { __typename: 'Business', id: 'unknown', name: 'Unknown Source' } as any;
    }

    const { type, id } = source[0].value;

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

    console.error(`Entry source ${type}:${id} not found for entry ${_id}`);
    return { __typename: 'Business', id: id.toString(), name: `Unknown ${type}` } as any;
  },
  total: ({ total }) => total[0].value as any,
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
