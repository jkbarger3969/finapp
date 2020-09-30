import { useFormikContext } from "formik";
import { useCallback } from "react";

export type TransmutationValue<TinputValue, Tvalue> = {
  inputValue: TinputValue;
  value: Tvalue;
};

export const createValueTransmutator = <
  TinputValue,
  Tvalue,
  Trest extends unknown[]
>(
  transMutator: (inputValue: TinputValue, ...rest: Trest) => Tvalue
) => (
  inputValue: TinputValue,
  ...rest: Trest
): TransmutationValue<TinputValue, Tvalue> =>
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

export const useFormikStatus = <Values = unknown>(): [
  FormikStatus | null,
  typeof setStatus
] => {
  const { setStatus: setStatusNative, status } = useFormikContext<Values>();

  const setStatus = useCallback(
    (args: FormikStatus | null) => {
      if (status) {
        if (
          !args ||
          Object.keys(args).some(
            (key) => args[key as keyof FormikStatus] !== status[key]
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
