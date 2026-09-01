import { describe, expect, it } from "vitest";

import { allAmbiguousResolved, buildOverridesFromSelections, keyFor } from "./resolveAmbiguous";
import { AmbiguousItem } from "../../shared/ipcTypes";

const item = (overrides: Partial<AmbiguousItem> = {}): AmbiguousItem => ({
  collection: "departments",
  key: "it",
  oldId: "old1",
  candidates: [
    { id: "new1", label: "IT" },
    { id: "new2", label: "IT (duplicate)" },
  ],
  ...overrides,
});

describe("keyFor", () => {
  it("combines collection and oldId into a stable key", () => {
    expect(keyFor({ collection: "departments", oldId: "old1" })).toBe("departments:old1");
  });
});

describe("buildOverridesFromSelections", () => {
  it("builds a nested overrides object from flat selections", () => {
    const overrides = buildOverridesFromSelections([
      { collection: "departments", oldId: "old1", chosenId: "new1" },
      { collection: "categories", oldId: "old2", chosenId: "new9" },
    ]);

    expect(overrides).toEqual({
      departments: { old1: "new1" },
      categories: { old2: "new9" },
    });
  });

  it("skips selections that haven't been made yet", () => {
    const overrides = buildOverridesFromSelections([
      { collection: "departments", oldId: "old1", chosenId: "" },
    ]);

    expect(overrides).toEqual({});
  });

  it("groups multiple selections in the same collection together", () => {
    const overrides = buildOverridesFromSelections([
      { collection: "departments", oldId: "old1", chosenId: "new1" },
      { collection: "departments", oldId: "old2", chosenId: "new2" },
    ]);

    expect(overrides).toEqual({
      departments: { old1: "new1", old2: "new2" },
    });
  });
});

describe("allAmbiguousResolved", () => {
  it("is false until every ambiguous item has a selection", () => {
    const items = [item(), item({ oldId: "old2" })];
    expect(allAmbiguousResolved(items, { "departments:old1": "new1" })).toBe(false);
    expect(
      allAmbiguousResolved(items, { "departments:old1": "new1", "departments:old2": "new2" })
    ).toBe(true);
  });

  it("is true for an empty list", () => {
    expect(allAmbiguousResolved([], {})).toBe(true);
  });
});
