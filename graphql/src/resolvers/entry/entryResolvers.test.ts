import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";

import { Entry } from "./entryResolvers";

const h = <T>(value: T) => ({ value, createdBy: new ObjectId(), createdOn: new Date() });

function nullLoaders() {
  return {
    business: { load: async () => null },
    department: { load: async () => null },
    person: { load: async () => null },
  } as any;
}

describe("Entry.source", () => {
  it("returns a fallback object with a real _id when the referenced Person doc doesn't exist", async () => {
    // Real crash this guards against: after syncing entries from another
    // server without also syncing `people`/`businesses` (out of scope),
    // `source` can point at an id with no matching document. The fallback
    // object's `id` resolver on Business/Person/Department does
    // `_id.toString()`, so a fallback missing `_id` throws "Cannot read
    // properties of undefined (reading 'toString')" - this broke the entire
    // Transactions list for any entry with a dangling source reference.
    const missingPersonId = new ObjectId();
    const entry = { source: [h({ type: "Person", id: missingPersonId })], _id: new ObjectId() };

    const result: any = await (Entry.source as any)(entry, {}, { loaders: nullLoaders() });

    expect(result._id).toBeDefined();
    expect(() => result._id.toString()).not.toThrow();
  });

  it("returns a fallback object with a real _id when the referenced Business doc doesn't exist", async () => {
    const missingBusinessId = new ObjectId();
    const entry = { source: [h({ type: "Business", id: missingBusinessId })], _id: new ObjectId() };

    const result: any = await (Entry.source as any)(entry, {}, { loaders: nullLoaders() });

    expect(result._id).toBeDefined();
    expect(() => result._id.toString()).not.toThrow();
  });

  it("returns a fallback object with a real _id when the entry has no source at all", async () => {
    const entry = { source: undefined, _id: new ObjectId() };

    const result: any = await (Entry.source as any)(entry, {}, { loaders: nullLoaders() });

    expect(result._id).toBeDefined();
    expect(() => result._id.toString()).not.toThrow();
  });

  it("returns a fallback object with a real _id when the source value is malformed (missing type/id)", async () => {
    const entry = { source: [h({})], _id: new ObjectId() };

    const result: any = await (Entry.source as any)(entry, {}, { loaders: nullLoaders() });

    expect(result._id).toBeDefined();
    expect(() => result._id.toString()).not.toThrow();
  });
});
