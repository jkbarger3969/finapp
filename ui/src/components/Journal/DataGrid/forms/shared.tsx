import { GridProps } from "@material-ui/core";
import React, { useCallback } from "react";
import { OmitProperties } from "ts-essentials";

export const preventDefault = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: React.SyntheticEvent<any, Event>
): void => {
  if (event && !event.defaultPrevented) {
    event.preventDefault();
  }
};

export const stopPropagation = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: React.SyntheticEvent<any, Event>
): void => {
  if (event && !event.isPropagationStopped()) {
    event.stopPropagation();
  }
};

export const preventDefaultEnter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event?: React.KeyboardEvent<any>
): void => {
  if (event && event.key === "Enter") {
    preventDefault(event);
  }
};
const NULLISH = Symbol();

export const usePreventEnterOnNullish = function <T>(
  value?: T | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): React.KeyboardEventHandler<any> {
  return useCallback(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event?: React.KeyboardEvent<any>
    ) => {
      if ((value ?? NULLISH) === NULLISH) {
        preventDefaultEnter(event);
      }
    },
    [value]
  );
};

export const removeNullishProperties = <T extends Record<string, unknown>>(
  obj: T
): OmitProperties<T, undefined | null> =>
  Object.keys(obj).reduce((newObj, key) => {
    if ((obj[key] ?? NULLISH) !== NULLISH) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newObj as any)[key] = obj[key];
    }
    return newObj;
  }, {} as OmitProperties<T, undefined | null>);

export const inputGridContainerProps: GridProps = {
  item: true,
  lg: 4,
  sm: 6,
  xs: 12,
} as const;
