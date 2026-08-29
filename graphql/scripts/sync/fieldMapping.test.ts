import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";

import {
  coerceLegacyDateStrings,
  transformEntry,
  unwrapLegacyNodeIdRefs,
} from "./fieldMapping";

describe("coerceLegacyDateStrings", () => {
  it("converts a legacy string date history value into a real Date", () => {
    const doc = {
      date: [{ value: "2019-07-15", createdBy: new ObjectId(), createdOn: new Date() }],
    };

    const { doc: result, warnings } = coerceLegacyDateStrings(doc);

    expect(result.date[0].value).toBeInstanceOf(Date);
    expect(result.date[0].value.toISOString().slice(0, 10)).toBe("2019-07-15");
    expect(warnings).toHaveLength(1);
  });

  it("leaves an already-real Date untouched and produces no warning", () => {
    const realDate = new Date("2024-01-01");
    const doc = {
      date: [{ value: realDate, createdBy: new ObjectId(), createdOn: new Date() }],
    };

    const { doc: result, warnings } = coerceLegacyDateStrings(doc);

    expect(result.date[0].value).toBe(realDate);
    expect(warnings).toHaveLength(0);
  });

  it("handles a missing dateOfRecord without throwing", () => {
    const doc = { date: [{ value: new Date(), createdBy: new ObjectId(), createdOn: new Date() }] };
    expect(() => coerceLegacyDateStrings(doc)).not.toThrow();
  });

  it("coerces nested dateOfRecord.date history values", () => {
    const doc = {
      dateOfRecord: {
        date: [{ value: "2020-03-01", createdBy: new ObjectId(), createdOn: new Date() }],
      },
    };

    const { doc: result } = coerceLegacyDateStrings(doc);
    expect(result.dateOfRecord.date[0].value).toBeInstanceOf(Date);
  });

  it("leaves an unparseable date string as-is and warns nothing extra", () => {
    const doc = {
      date: [{ value: "not-a-date", createdBy: new ObjectId(), createdOn: new Date() }],
    };

    const { doc: result, warnings } = coerceLegacyDateStrings(doc);
    expect(result.date[0].value).toBe("not-a-date");
    expect(warnings).toHaveLength(0);
  });
});

describe("unwrapLegacyNodeIdRefs", () => {
  it("replaces a {node,id} ref anywhere in the doc with the configured id key", () => {
    const nodeId = new ObjectId();
    const idId = new ObjectId();
    const doc = {
      createdBy: { node: nodeId, id: idId },
      category: [{ value: { node: nodeId, id: idId }, createdBy: idId, createdOn: new Date() }],
    };

    const { doc: result, warnings } = unwrapLegacyNodeIdRefs(doc, { idKey: "id" });

    expect(result.createdBy).toBe(idId);
    expect(result.category[0].value).toBe(idId);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("can be configured to prefer the `node` key instead", () => {
    const nodeId = new ObjectId();
    const idId = new ObjectId();
    const doc = { createdBy: { node: nodeId, id: idId } };

    const { doc: result } = unwrapLegacyNodeIdRefs(doc, { idKey: "node" });

    expect(result.createdBy).toBe(nodeId);
  });

  it("does not touch plain ObjectId or Date values", () => {
    const id = new ObjectId();
    const date = new Date();
    const doc = { createdBy: id, lastUpdate: date };

    const { doc: result } = unwrapLegacyNodeIdRefs(doc);

    expect(result.createdBy).toBe(id);
    expect(result.lastUpdate).toBe(date);
  });

  it("does not touch an object that merely has an `id` key among others", () => {
    const doc = { source: { type: "Department", id: new ObjectId() } };
    const { doc: result } = unwrapLegacyNodeIdRefs(doc);
    expect(result.source).toEqual(doc.source);
  });
});

describe("transformEntry pipeline", () => {
  it("always applies date coercion, and only unwraps node/id refs when opted in", () => {
    const nodeId = new ObjectId();
    const idId = new ObjectId();
    const doc = {
      date: [{ value: "2019-07-15", createdBy: idId, createdOn: new Date() }],
      createdBy: { node: nodeId, id: idId },
    };

    const withoutOptIn = transformEntry(doc);
    expect(withoutOptIn.doc.date[0].value).toBeInstanceOf(Date);
    expect(withoutOptIn.doc.createdBy).toEqual({ node: nodeId, id: idId });

    const withOptIn = transformEntry(doc, { unwrapLegacyNodeIdRefs: { idKey: "id" } });
    expect(withOptIn.doc.createdBy).toBe(idId);
  });

  it("runs custom transforms last, in order", () => {
    const doc = { flag: 0 };
    const result = transformEntry(doc, {
      customTransforms: [
        (d) => ({ doc: { ...d, flag: (d.flag as number) + 1 }, warnings: [] }),
        (d) => ({ doc: { ...d, flag: (d.flag as number) * 10 }, warnings: [] }),
      ],
    });

    expect(result.doc.flag).toBe(10);
  });

  it("preserves unknown/legacy fields verbatim (schema tolerance)", () => {
    const doc = {
      _id: new ObjectId(),
      Amount: "125.00",
      Vendor: "Some Vendor",
      type: "expense",
    };

    const { doc: result } = transformEntry(doc);
    expect(result.Amount).toBe("125.00");
    expect(result.Vendor).toBe("Some Vendor");
    expect(result.type).toBe("expense");
  });
});
