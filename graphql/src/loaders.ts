import DataLoader from "dataloader";
import { Db, ObjectId } from "mongodb";
import {
    DepartmentDbRecord,
    CategoryDbRecord,
    FiscalYearDbRecord,
    BusinessDbRecord,
    PersonDbRecord,
} from "./dataSources/accountingDb/types";

export interface Loaders {
    department: DataLoader<string, DepartmentDbRecord | null>;
    category: DataLoader<string, CategoryDbRecord | null>;
    fiscalYear: DataLoader<string, FiscalYearDbRecord | null>;
    business: DataLoader<string, BusinessDbRecord | null>;
    person: DataLoader<string, PersonDbRecord | null>;
}

export const createLoaders = (db: Db): Loaders => {
    return {
        department: new DataLoader(async (ids) => {
            const objectIds = ids.map((id) => new ObjectId(id));
            const results = await db
                .collection<DepartmentDbRecord>("departments")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        }),
        category: new DataLoader(async (ids) => {
            const objectIds = ids.map((id) => new ObjectId(id));
            const results = await db
                .collection<CategoryDbRecord>("categories")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        }),
        fiscalYear: new DataLoader(async (ids) => {
            // Fiscal Year lookup by ID is rare in entries (usually by date), 
            // but useful if we resolve by ID.
            // For date-based lookup, DataLoader is harder (range queries).
            // Let's at least implement ID lookup.
            const objectIds = ids.map((id) => new ObjectId(id));
            const results = await db
                .collection<FiscalYearDbRecord>("fiscalYears")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        }),
        business: new DataLoader(async (ids) => {
            const objectIds = ids.map((id) => new ObjectId(id));
            const results = await db
                .collection<BusinessDbRecord>("businesses")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        }),
        person: new DataLoader(async (ids) => {
            const objectIds = ids.map((id) => new ObjectId(id));
            const results = await db
                .collection<PersonDbRecord>("people")
                .find({ _id: { $in: objectIds } })
                .toArray();
            const map = new Map(results.map((r) => [r._id.toString(), r]));
            return ids.map((id) => map.get(id) || null);
        }),
    };
};
