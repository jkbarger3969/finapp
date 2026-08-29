import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";

import { REFERENCE_KEY_FNS, buildIdMap, byField, byFieldsInOrder, normalizeKey } from "./idMap";

describe("normalizeKey", () => {
  it("trims and lowercases strings", () => {
    expect(normalizeKey("  Maintenance  ")).toBe("maintenance");
  });

  it("returns undefined for empty/non-string values", () => {
    expect(normalizeKey("")).toBeUndefined();
    expect(normalizeKey("   ")).toBeUndefined();
    expect(normalizeKey(undefined)).toBeUndefined();
    expect(normalizeKey(42)).toBeUndefined();
  });
});

describe("byFieldsInOrder", () => {
  it("falls back to the next field when the first produces no key", () => {
    const keyFn = byFieldsInOrder(byField("code"), byField("name"));
    expect(keyFn({ _id: new ObjectId(), code: "", name: "Repairs" })).toBe("repairs");
    expect(keyFn({ _id: new ObjectId(), code: "REP", name: "Repairs" })).toBe("rep");
  });
});

describe("buildIdMap", () => {
  it("matches old and new docs sharing a unique business key", () => {
    const oldId = new ObjectId();
    const newId = new ObjectId();
    const oldDocs = [{ _id: oldId, code: "MAINT", name: "Maintenance" }];
    const newDocs = [{ _id: newId, code: "MAINT", name: "Maintenance" }];

    const { matched, unmatched, ambiguous } = buildIdMap(oldDocs, newDocs, byField("code"));

    expect(matched.get(oldId.toHexString())).toEqual(newId);
    expect(unmatched).toHaveLength(0);
    expect(ambiguous).toHaveLength(0);
  });

  it("reports docs with no match on the target as unmatched", () => {
    const oldId = new ObjectId();
    const oldDocs = [{ _id: oldId, code: "IT" }];
    const newDocs = [{ _id: new ObjectId(), code: "HR" }];

    const { matched, unmatched } = buildIdMap(oldDocs, newDocs, byField("code"));

    expect(matched.size).toBe(0);
    expect(unmatched).toEqual(oldDocs);
  });

  it("flags a business key that matches more than one target doc as ambiguous", () => {
    const oldId = new ObjectId();
    const dupA = new ObjectId();
    const dupB = new ObjectId();
    const oldDocs = [{ _id: oldId, name: "IT" }];
    const newDocs = [
      { _id: dupA, name: "IT" },
      { _id: dupB, name: "IT" },
    ];

    const { matched, ambiguous } = buildIdMap(oldDocs, newDocs, byField("name"));

    expect(matched.size).toBe(0);
    expect(ambiguous).toEqual([{ key: "it", oldIds: [oldId], newIds: [dupA, dupB] }]);
  });

  it("treats a doc with no usable key as unmatched rather than crashing", () => {
    const oldId = new ObjectId();
    const oldDocs = [{ _id: oldId }];
    const newDocs = [{ _id: new ObjectId(), code: "X" }];

    const { unmatched } = buildIdMap(oldDocs, newDocs, byField("code"));
    expect(unmatched).toEqual(oldDocs);
  });

  it("a manual override always wins, even over an unambiguous auto-match", () => {
    const oldId = new ObjectId();
    const autoMatchId = new ObjectId();
    const overrideId = new ObjectId();
    const oldDocs = [{ _id: oldId, code: "IT" }];
    const newDocs = [{ _id: autoMatchId, code: "IT" }];

    const { matched, unmatched, ambiguous } = buildIdMap(oldDocs, newDocs, byField("code"), {
      [oldId.toHexString()]: overrideId.toHexString(),
    });

    expect(matched.get(oldId.toHexString())).toEqual(overrideId);
    expect(unmatched).toHaveLength(0);
    expect(ambiguous).toHaveLength(0);
  });

  it("an override resolves what would otherwise be ambiguous or unmatched", () => {
    const oldId = new ObjectId();
    const overrideId = new ObjectId();
    const oldDocs = [{ _id: oldId, code: "IT" }];
    const newDocs: any[] = [];

    const { matched, unmatched } = buildIdMap(oldDocs, newDocs, byField("code"), {
      [oldId.toHexString()]: overrideId.toHexString(),
    });

    expect(matched.get(oldId.toHexString())).toEqual(overrideId);
    expect(unmatched).toHaveLength(0);
  });
});

describe("REFERENCE_KEY_FNS", () => {
  it("defines a key function for every collection in scope", () => {
    expect(Object.keys(REFERENCE_KEY_FNS).sort()).toEqual(
      ["accounts", "categories", "departments", "fiscalYears"].sort()
    );
  });
});
