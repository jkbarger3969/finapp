import { FormikHelpers, useFormikContext } from "formik";
import { useState, useCallback, useMemo } from "react";

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

// export class FormikStatus {
//   private readonly _status_: string | Error;
//   private readonly _fatal_: boolean | null;

//   constructor(status: string);
//   constructor(status: Error, fatal?: boolean);
//   constructor(status: string | Error, fatal: boolean = false) {
//     this._status_ = status;
//     this._fatal_ = typeof status === "string" ? null : fatal;
//   }

//   get msg(): string {
//     return typeof this._status_ === "string"
//       ? this._status_
//       : this._status_.message;
//   }

//   get status() {
//     return this._status_;
//   }

//   get isError(): boolean {
//     return !(this._status_ === "string");
//   }

//   get fatal(): boolean | null {
//     return this._fatal_;
//   }

//   isSame(formikStatus: FormikStatus): boolean {
//     if (this._fatal_ !== formikStatus._fatal_) {
//       return false;
//     } else if (
//       typeof this._status_ === "string" ||
//       typeof formikStatus._status_ === "string"
//     ) {
//       return this._status_ === formikStatus._status_;
//     } else {
//       return (
//         Reflect.getPrototypeOf(this._status_) ===
//           Reflect.getPrototypeOf(formikStatus._status_) &&
//         this._status_.message === formikStatus._status_.message &&
//         this._status_.name === formikStatus._status_.name
//       );
//     }
//   }
// }

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
          Object.keys(args).some((key) => args[key] !== status[key])
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

// export const useFormikStatus = <Values = any>(
//   setFormikStatus: FormikHelpers<Values>["setStatus"]
// ): [FormikStatus | null, SetFormikStatus] => {
//   const [status, setStatus] = useState<FormikStatus | null>(null);

//   // Prevents render loop when component render method needs to set status
//   // by checking status equality.
//   const setStatusWrapper = useCallback(
//     (formikStatus: FormikStatus | null) => {
//       if (status) {
//         if (!formikStatus || !status.isSame(formikStatus)) {
//           setStatus(formikStatus);
//         }
//       } else if (formikStatus) {
//         setStatus(formikStatus);
//       }
//     },
//     [status, setStatus]
//   );

//   return [status, setStatusWrapper];
// };
