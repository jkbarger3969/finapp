import { Dispatch, useCallback, useState } from "react";

const useLocalStorage = <T>(
  defaultValue: T,
  cacheKey: string,
  cacheUpdater?: (cachedValue: T, defaultValue: T, lastUpdate: Date) => T
): [T, Dispatch<T>] => {
  const [state, setState] = useState<T>(() => {
    if (window.localStorage) {
      const cachedItemStr = window.localStorage.getItem(cacheKey);
      if (cachedItemStr) {
        const { item, date } = JSON.parse(cachedItemStr) as {
          item: T;
          date: string;
        };

        if (cacheUpdater) {
          const updateValue = cacheUpdater(item, defaultValue, new Date(date));

          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({
              item: updateValue,
              date: new Date().toISOString(),
            })
          );
          return updateValue;
        }

        return item;
      } else {
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  });

  return [
    state,
    useCallback<Dispatch<T>>(
      (item: T) => {
        if (window.localStorage) {
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({
              item,
              date: new Date().toISOString(),
            })
          );
        }
        setState(item);
      },
      [cacheKey, setState]
    ),
  ];
};

export default useLocalStorage;
