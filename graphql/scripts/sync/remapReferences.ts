import { Document, ObjectId } from "mongodb";

export interface RefIdMaps {
  /** old _id (hex) -> new _id */
  categories: Map<string, ObjectId>;
  departments: Map<string, ObjectId>;
  accounts: Map<string, ObjectId>;
}

/** Converts the on-disk id map shape (collection -> old hex -> new hex) into
 * the `Map<string, ObjectId>` shape `remapEntryReferences` expects. */
export function toRefIdMaps(idMapFile: Record<string, Record<string, string>>): RefIdMaps {
  const toMap = (obj: Record<string, string> = {}) =>
    new Map(Object.entries(obj).map(([oldHex, newHex]) => [oldHex, new ObjectId(newHex)]));

  return {
    categories: toMap(idMapFile.categories),
    departments: toMap(idMapFile.departments),
    accounts: toMap(idMapFile.accounts),
  };
}

export interface RemapReport {
  /** references that point at a reference doc not found on the target - old id is left in place */
  unresolved: string[];
  /** references into collections intentionally not synced (users/businesses/people/paymentCards) */
  outOfScope: string[];
}

function remapHistoryRefs(
  historyArray: unknown,
  idMap: Map<string, ObjectId>,
  label: string,
  report: RemapReport
): unknown {
  if (!Array.isArray(historyArray)) return historyArray;
  return historyArray.map((h: any) => {
    if (!h || !(h.value instanceof ObjectId)) return h;
    const newId = idMap.get(h.value.toHexString());
    if (!newId) {
      report.unresolved.push(`${label}=${h.value.toHexString()}`);
      return h;
    }
    return { ...h, value: newId };
  });
}

function remapSourceHistory(
  historyArray: unknown,
  departments: Map<string, ObjectId>,
  report: RemapReport
): unknown {
  if (!Array.isArray(historyArray)) return historyArray;
  return historyArray.map((h: any) => {
    const source = h?.value;
    if (!source || typeof source !== "object" || !source.type) return h;
    if (source.type === "Department" && source.id instanceof ObjectId) {
      const newId = departments.get(source.id.toHexString());
      if (!newId) {
        report.unresolved.push(`source.Department=${source.id.toHexString()}`);
        return h;
      }
      return { ...h, value: { ...source, id: newId } };
    }
    report.outOfScope.push(`source.${source.type}`);
    return h;
  });
}

function remapPaymentMethodHistory(
  historyArray: unknown,
  accounts: Map<string, ObjectId>,
  report: RemapReport
): unknown {
  if (!Array.isArray(historyArray)) return historyArray;
  return historyArray.map((h: any) => {
    const pm = h?.value;
    if (!pm || typeof pm !== "object") return h;
    if (pm.type === "Check" && pm.check?.account instanceof ObjectId) {
      const newId = accounts.get(pm.check.account.toHexString());
      if (!newId) {
        report.unresolved.push(`paymentMethod.check.account=${pm.check.account.toHexString()}`);
        return h;
      }
      return { ...h, value: { ...pm, check: { ...pm.check, account: newId } } };
    }
    if (pm.type === "Card" && pm.card instanceof ObjectId) {
      report.outOfScope.push("paymentMethod.card");
    }
    return h;
  });
}

/**
 * Rewrites the reference fields on an already field-mapped entry doc (see
 * fieldMapping.ts) to point at the target server's `_id`s, using the id maps
 * built by `map-reference-data`. References into out-of-scope collections
 * (`users` via `createdBy`, `businesses`/`people` via `source`, `paymentCards`
 * via `paymentMethod.card`) are deliberately left pointing at the old-server
 * id rather than guessed - reported in `outOfScope` so the caller can log the
 * affected count without treating it as an error.
 */
export function remapEntryReferences(
  doc: Document,
  idMaps: RefIdMaps
): { doc: Document; report: RemapReport } {
  const report: RemapReport = { unresolved: [], outOfScope: [] };
  const result: Document = { ...doc };

  if (result.category) {
    result.category = remapHistoryRefs(result.category, idMaps.categories, "category", report);
  }
  if (result.department) {
    result.department = remapHistoryRefs(result.department, idMaps.departments, "department", report);
  }
  if (result.source) {
    result.source = remapSourceHistory(result.source, idMaps.departments, report);
  }
  if (result.paymentMethod) {
    result.paymentMethod = remapPaymentMethodHistory(result.paymentMethod, idMaps.accounts, report);
  }

  if (Array.isArray(result.items)) {
    result.items = result.items.map((item: any) => ({
      ...item,
      ...(item.category
        ? { category: remapHistoryRefs(item.category, idMaps.categories, "items[].category", report) }
        : {}),
      ...(item.department
        ? { department: remapHistoryRefs(item.department, idMaps.departments, "items[].department", report) }
        : {}),
    }));
  }

  if (Array.isArray(result.refunds)) {
    result.refunds = result.refunds.map((refund: any) => ({
      ...refund,
      ...(refund.paymentMethod
        ? { paymentMethod: remapPaymentMethodHistory(refund.paymentMethod, idMaps.accounts, report) }
        : {}),
    }));
  }

  // Root `createdBy` and every historized `createdBy` reference `users`,
  // which is out of scope per project decision - left untouched, reported
  // once per doc rather than once per historized field to avoid log noise.
  if (result.createdBy) {
    report.outOfScope.push("createdBy");
  }

  return { doc: result, report };
}
