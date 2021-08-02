import React, { useEffect, useMemo, useRef } from "react";

export const getCircularReplacer = (
  replacer?: (key: string, value: unknown) => unknown
): ((key: string, value: unknown) => unknown) => {
  const seen = new WeakSet();
  return (key: string, value: unknown): unknown => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return replacer ? replacer(key, value) : value;
  };
};

export const usePrePrint = function <T>(
  toPrint: T,
  {
    stringify,
  }: {
    stringify?: (value: unknown) => string;
  } = {}
): JSX.Element {
  return useMemo(
    () => (
      <pre>
        {stringify ? stringify(toPrint) : JSON.stringify(toPrint, null, 2)}
      </pre>
    ),
    [stringify, toPrint]
  );
};
