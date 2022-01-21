import { Dispatch, SetStateAction, useCallback, useState } from "react";

export type UseLocalStorageArg<T> = {
  defaultValue: T;
  cacheKey: string;
  serializer?: {
    serialize: (item: T) => string;
    deserialize: (item: string) => T;
  };
};

const useLocalStorage = <T>({
  defaultValue,
  cacheKey,
  serializer,
}: UseLocalStorageArg<T>): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    if (window.localStorage) {
      const cachedItemStr = window.localStorage.getItem(cacheKey);
      if (cachedItemStr) {
        const { item } = (serializer?.deserialize || JSON.parse)(
          cachedItemStr
        ) as {
          item: T;
        };

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
