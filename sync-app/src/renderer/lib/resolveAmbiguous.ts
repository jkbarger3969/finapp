import { AmbiguousItem, IdMapFile } from "../../shared/ipcTypes";

export interface AmbiguousSelection {
  collection: string;
  oldId: string;
  chosenId: string;
}

export function keyFor(item: { collection: string; oldId: string }): string {
  return `${item.collection}:${item.oldId}`;
}

/** Turns the user's dropdown picks into the overrides shape mapReferenceData
 * expects - this is the GUI's replacement for hand-editing idMapOverrides.json. */
export function buildOverridesFromSelections(selections: AmbiguousSelection[]): IdMapFile {
  const overrides: IdMapFile = {};
  for (const { collection, oldId, chosenId } of selections) {
    if (!chosenId) continue;
    overrides[collection] = overrides[collection] ?? {};
    overrides[collection][oldId] = chosenId;
  }
  return overrides;
}

export function allAmbiguousResolved(items: AmbiguousItem[], selections: Record<string, string>): boolean {
  return items.every((item) => Boolean(selections[keyFor(item)]));
}
