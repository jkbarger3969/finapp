import { useFormikContext } from "formik";
import { useCallback } from "react";

export type TransmutationValue<TinputValue, Tvalue> = {
  inputValue: TinputValue;
  value: Tvalue;
};

export const createValueTransmutator = <
  TinputValue,
  Tvalue,
  Trest extends any[]
>(
  transMutator: (inputValue: TinputValue, ...rest: Trest) => Tvalue
) => (inputValue: TinputValue, ...rest: Trest) =>
  ({
    inputValue,
    value: transMutator(inputValue, ...rest),
  } as TransmutationValue<TinputValue, Tvalue>);

export enum FormikStatusType {
  NOTIFICATION,
  ERROR,
  FATAL_ERROR,
}

export interface FormikStatus {
  msg: string;
  type: FormikStatusType;
}

export const useFormikStatus = <Values = any>() => {
  const { setStatus: setStatusNative, status } = useFormikContext<Values>();

  const setStatus = useCallback(
    (args: FormikStatus | null) => {
      if (status) {
        if (
          !args ||
          Object.keys(args).some(
            (key) => (args as Record<string, any>)[key] !== status[key]
          )
        ) {
          setStatusNative(args);
        }
      } else if (args) {
        setStatusNative(args);
      }
    },
    [setStatusNative, status]
  );

  return [status ?? null, setStatus] as [FormikStatus | null, typeof setStatus];
};
