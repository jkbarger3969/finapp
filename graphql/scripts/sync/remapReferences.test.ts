import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";

import { RefIdMaps, remapEntryReferences, toRefIdMaps } from "./remapReferences";

const h = <T>(value: T, createdBy = new ObjectId()) => ({
  value,
  createdBy,
  createdOn: new Date(),
});

function emptyMaps(): RefIdMaps {
  return { categories: new Map(), departments: new Map(), accounts: new Map() };
}

describe("remapEntryReferences", () => {
  it("remaps category and department history values using the id maps", () => {
    const oldCat = new ObjectId();
    const newCat = new ObjectId();
    const oldDept = new ObjectId();
    const newDept = new ObjectId();
    const maps = emptyMaps();
    maps.categories.set(oldCat.toHexString(), newCat);
    maps.departments.set(oldDept.toHexString(), newDept);

    const doc = { category: [h(oldCat)], department: [h(oldDept)] };

    const { doc: result, report } = remapEntryReferences(doc, maps);

    expect(result.category[0].value).toEqual(newCat);
    expect(result.department[0].value).toEqual(newDept);
    expect(report.unresolved).toHaveLength(0);
  });

  it("leaves the original id and reports it as unresolved when there is no map entry", () => {
    const oldCat = new ObjectId();
    const doc = { category: [h(oldCat)] };

    const { doc: result, report } = remapEntryReferences(doc, emptyMaps());

    expect(result.category[0].value).toEqual(oldCat);
    expect(report.unresolved).toEqual([`category=${oldCat.toHexString()}`]);
  });

  it("remaps a Department source but leaves a Business/Person source as out-of-scope", () => {
    const oldDept = new ObjectId();
    const newDept = new ObjectId();
    const maps = emptyMaps();
    maps.departments.set(oldDept.toHexString(), newDept);

    const businessId = new ObjectId();
    const doc = {
      source: [h({ type: "Department", id: oldDept }), h({ type: "Business", id: businessId })],
    };

    const { doc: result, report } = remapEntryReferences(doc, maps);

    expect(result.source[0].value).toEqual({ type: "Department", id: newDept });
    expect(result.source[1].value).toEqual({ type: "Business", id: businessId });
    expect(report.outOfScope).toContain("source.Business");
  });

  it("remaps a Check payment method's account but leaves a Card's card reference out-of-scope", () => {
    const oldAccount = new ObjectId();
    const newAccount = new ObjectId();
    const maps = emptyMaps();
    maps.accounts.set(oldAccount.toHexString(), newAccount);

    const cardId = new ObjectId();
    const doc = {
      paymentMethod: [
        h({ type: "Check", currency: "USD", check: { account: oldAccount, checkNumber: "123" } }),
      ],
    };
    const { doc: result, report } = remapEntryReferences(doc, maps);
    expect(result.paymentMethod[0].value.check.account).toEqual(newAccount);

    const cardDoc = { paymentMethod: [h({ type: "Card", currency: "USD", card: cardId })] };
    const { doc: cardResult, report: cardReport } = remapEntryReferences(cardDoc, emptyMaps());
    expect(cardResult.paymentMethod[0].value.card).toEqual(cardId);
    expect(cardReport.outOfScope).toContain("paymentMethod.card");
  });

  it("remaps category/department inside embedded items", () => {
    const oldCat = new ObjectId();
    const newCat = new ObjectId();
    const maps = emptyMaps();
    maps.categories.set(oldCat.toHexString(), newCat);

    const doc = {
      items: [{ id: new ObjectId(), category: [h(oldCat)], total: [h({ s: 1, n: 5, d: 1 })] }],
    };

    const { doc: result } = remapEntryReferences(doc, maps);
    expect(result.items[0].category[0].value).toEqual(newCat);
  });

  it("reports createdBy as out-of-scope without modifying it", () => {
    const createdBy = new ObjectId();
    const doc = { createdBy };

    const { doc: result, report } = remapEntryReferences(doc, emptyMaps());

    expect(result.createdBy).toBe(createdBy);
    expect(report.outOfScope).toContain("createdBy");
  });

  it("does not mutate the input document", () => {
    const oldCat = new ObjectId();
    const newCat = new ObjectId();
    const maps = emptyMaps();
    maps.categories.set(oldCat.toHexString(), newCat);
    const doc = { category: [h(oldCat)] };

    remapEntryReferences(doc, maps);

    expect(doc.category[0].value).toEqual(oldCat);
  });
});

describe("toRefIdMaps", () => {
  it("converts the on-disk hex-string shape into ObjectId maps", () => {
    const oldId = new ObjectId();
    const newId = new ObjectId();

    const maps = toRefIdMaps({
      categories: { [oldId.toHexString()]: newId.toHexString() },
    });

    expect(maps.categories.get(oldId.toHexString())).toEqual(newId);
    expect(maps.departments.size).toBe(0);
    expect(maps.accounts.size).toBe(0);
  });
});
