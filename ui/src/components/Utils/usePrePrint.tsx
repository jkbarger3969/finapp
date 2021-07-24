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
  options: {
    stringify?: (value: unknown) => string;
  } & (
    | {
        poll?: number;
      }
    | {
        delay?: number;
      }
  ) = {}
): JSX.Element {
  const toPrintRef = useRef<T>(toPrint);
  toPrintRef.current = toPrint;
  const preRef = useRef<HTMLPreElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { stringify } = options;

  useEffect(() => {
    if (
      "poll" in options &&
      options.poll !== undefined &&
      intervalRef.current === null
    ) {
      intervalRef.current = setInterval(() => {
        if (preRef.current) {
          preRef.current.innerHTML = (stringify || JSON.stringify)(
            toPrintRef.current
          );
        }
      }, options.poll);
    } else if (
      "delay" in options &&
      options.delay !== undefined &&
      timeoutRef.current === null
    ) {
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (preRef.current) {
          preRef.current.innerHTML = (stringify || JSON.stringify)(
            toPrintRef.current
          );
        }
      }, options.delay);
    }

    if (preRef.current) {
      preRef.current.innerHTML = (stringify || JSON.stringify)(
        toPrintRef.current
      );
    }
  });

  useEffect(
    () => () => {
      preRef.current = null;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return useMemo(() => <pre ref={preRef}></pre>, []);
};
