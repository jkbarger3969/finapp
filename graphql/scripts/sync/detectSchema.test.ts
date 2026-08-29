import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";

import { censusDocuments, diffAgainstKnownFields } from "./detectSchema";

describe("censusDocuments", () => {
  it("counts field presence and types across sampled docs", () => {
    const docs = [
      { _id: new ObjectId(), category: [{ value: new ObjectId() }], Amount: "125.00" },
      { _id: new ObjectId(), category: [{ value: new ObjectId() }] },
    ];

    const census = censusDocuments(docs);

    expect(census["_id"].count).toBe(2);
    expect(census["Amount"].count).toBe(1);
    expect(census["category[].value"].count).toBe(2);
    expect(census["category[].value"].types.has("ObjectId")).toBe(true);
  });

  it("does not throw on an empty document list", () => {
    expect(() => censusDocuments([])).not.toThrow();
  });
});

describe("diffAgainstKnownFields", () => {
  it("flags fields present in the census that aren't in the known-shape list", () => {
    const docs = [{ _id: new ObjectId(), Amount: "125.00", category: [{ value: new ObjectId() }] }];
    const census = censusDocuments(docs);

    const unexpected = diffAgainstKnownFields(census, ["_id", "category", "category[].value"]);

    expect(unexpected).toEqual(["Amount"]);
  });
});
