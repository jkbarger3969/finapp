import { Dispatch, SetStateAction, useCallback, useState } from "react";

const useLocalStorage = <T>({
  defaultValue,
  cacheKey,
  serializer,
  cacheUpdater,
}: {
  defaultValue: T;
  cacheKey: string;
  serializer?: {
    serialize: (item: T) => string;
    deserialize: (item: string) => T;
  };
  cacheUpdater?: (cachedValue: T, defaultValue: T, lastUpdate: Date) => T;
}): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (window.localStorage) {
      const cachedItemStr = window.localStorage.getItem(cacheKey);
      if (cachedItemStr) {
        const { item, date } = (serializer?.deserialize || JSON.parse)(
          cachedItemStr
        ) as {
          item: T;
          date: string;
        };

        if (cacheUpdater) {
          const updateValue = cacheUpdater(item, defaultValue, new Date(date));

          window.localStorage.setItem(
            cacheKey,
            (serializer?.serialize || JSON.stringify)({
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
    useCallback<Dispatch<SetStateAction<T>>>(
      (item: SetStateAction<T>) => {
        setState((prevState) => {
          const nextState =
            typeof item === "function"
              ? (item as (prevState: T) => T)(prevState)
              : item;
          if (window.localStorage) {
            window.localStorage.setItem(
              cacheKey,
              (serializer?.serialize || JSON.stringify)({
                item: nextState,
                date: new Date().toISOString(),
              })
            );
          }
          return nextState;
        });
      },
      [cacheKey, serializer?.serialize]
    ),
  ];
};

export default useLocalStorage;
