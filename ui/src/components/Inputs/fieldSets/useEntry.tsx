import React, { useCallback, useMemo } from "react";
import {
  UseControllerProps,
  useWatch,
  useFormContext,
  get,
  UseFormReturn,
} from "react-hook-form";
import Fraction from "fraction.js";
import { defaultInput } from "mui-tree-select";

import { DateInput, DateInputProps } from "../Date";
import {
  DepartmentInput,
  DepartmentInputProps,
  DEPARTMENT_NAME,
  departmentName,
} from "../Department";
import { EntityInput, EntityInputProps } from "../Entity";
import {
  CategoryInput,
  CategoryInputProps,
  categoryName,
  CategoryInputBaseProps,
  CATEGORY_NAME,
} from "../Category";
import {
  PaymentMethodInput,
  PaymentMethodInputProps,
  paymentMethodName,
  PAYMENT_METHOD_NAME,
} from "../PaymentMethod";
import { RationalInput, RationalInputProps } from "../RationalInput";
import { BoolInput, BoolInputProps } from "../BoolInput";

export type EntryInputProps<
  AllowNewSource extends boolean | undefined = undefined
> = {
  date?: Omit<DateInputProps, "name" | "control">;
  dateOfRecord?: Omit<DateInputProps, "name" | "control">;

  department: Omit<DepartmentInputProps, "namePrefix" | "control" | "multiple">;
  source?: Omit<
    EntityInputProps<false, undefined, AllowNewSource>,
    "name" | "control" | "multiple" | "allowNewBusiness" | "allowNewPerson"
  > & {
    allowNewSource?: AllowNewSource;
  };
  category?: Omit<CategoryInputProps, "namePrefix" | "control" | "multiple">;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "namePrefix" | "control" | "multiple" | "entryType"
  >;
  total?: Omit<RationalInputProps, "name" | "control">;
  reconciled?:
    | Partial<Omit<BoolInputProps<"checkbox">, "name" | "control">>
    | Partial<Omit<BoolInputProps<"switch">, "name" | "control">>;
};

export type EntryProps<
  AllowNewSource extends boolean | undefined = undefined
> = {
  showLabels?: boolean;
  required?: boolean;
  namePrefix?: string;
  methods?: UseFormReturn;
} & EntryInputProps<AllowNewSource>;

export const ENTRY_NAME_PREFIX = "entry";
type EntryFieldNames =
  | "date"
  | "dateOfRecord"
  | typeof DEPARTMENT_NAME
  | "source"
  | typeof CATEGORY_NAME
  | typeof PAYMENT_METHOD_NAME
  | "total"
  | "reconciled";

export const entryNamePrefix = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${ENTRY_NAME_PREFIX}` : ENTRY_NAME_PREFIX;
export const entryName = (
  fieldName: EntryFieldNames,
  namePrefix?: string
): string => {
  switch (fieldName) {
    case DEPARTMENT_NAME:
      return departmentName(entryNamePrefix(namePrefix));
    case CATEGORY_NAME:
      return categoryName(entryNamePrefix(namePrefix));
    case PAYMENT_METHOD_NAME:
      return paymentMethodName(entryNamePrefix(namePrefix));
    default:
      return `${entryNamePrefix(namePrefix)}.${fieldName}`;
  }
};

const addRequired = (
  required: boolean | undefined,
  rules?: UseControllerProps["rules"],
  message = "Required"
): UseControllerProps["rules"] => ({
  required: message,
  ...(rules || {}),
});

export const useEntry = <
  AllowNewSource extends boolean | undefined = undefined
>(
  props: EntryProps<AllowNewSource>
): {
  [Name in keyof EntryInputProps as `${Name}Input`]-?: JSX.Element;
} &
  {
    [Name in keyof EntryInputProps as `${Name}InputName`]-?: string;
  } => {
  const {
    required,
    showLabels,
    namePrefix,
    date: { onChange: onChangeDateProp, ...dateProps } = {} as DateInputProps,
    dateOfRecord: dateOfRecordProps = {},
    department: departmentProps,
    source: { allowNewSource, ...sourceProps } = {},
    category: categoryProps = {},
    paymentMethod: paymentMethodProps,
    total: totalProps = {},
    reconciled: reconciledProps = {},
    methods,
  } = props;

  const contextMethods = useFormContext();

  const {
    control,
    setValue,
    formState: { dirtyFields },
  } = methods || contextMethods;

  const categoryValue = useWatch({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: categoryName(entryNamePrefix(namePrefix)) as any,
    defaultValue: null,
  }) as CategoryInputBaseProps<false, false, false>["value"] | null;

  // Handle conditions where date of record should take the value of
  // date.
  const { defaultValuesRef } = control;
  const dateOfRecordName = entryName("dateOfRecord", namePrefix);
  const dateOfRecordValue = useWatch({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: dateOfRecordName as any,
    defaultValue: null,
  }) as Date | null;

  const handleDateChange = useCallback<NonNullable<DateInputProps["onChange"]>>(
    (...args) => {
      // date of record should mirror date
      if (
        get(defaultValuesRef.current, dateOfRecordName, null) === null &&
        (dateOfRecordValue === null ||
          !get(dirtyFields || {}, dateOfRecordName, false))
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(dateOfRecordName as any, args[0], {
          shouldDirty: false,
        });
      }

      if (onChangeDateProp) {
        onChangeDateProp(...args);
      }
    },
    [
      dateOfRecordName,
      dateOfRecordValue,
      defaultValuesRef,
      dirtyFields,
      onChangeDateProp,
      setValue,
    ]
  );

  const entryType = categoryValue?.valueOf().type ?? null;

  return {
    dateInput: (
      <DateInput
        label={showLabels && "Date"}
        {...dateProps}
        onChange={handleDateChange}
        control={control}
        name={entryName("date", namePrefix)}
        rules={useMemo<UseControllerProps["rules"]>(
          () => addRequired(required, dateProps.rules || {}),
          [dateProps.rules, required]
        )}
      />
    ),
    dateInputName: entryName("date", namePrefix),
    dateOfRecordInput: (
      <DateInput
        label={showLabels && "Date of Record"}
        {...dateOfRecordProps}
        control={control}
        name={dateOfRecordName}
        rules={useMemo<UseControllerProps["rules"]>(
          () => dateOfRecordProps.rules || {},
          [dateOfRecordProps.rules]
        )}
      />
    ),
    dateOfRecordInputName: entryName("date", namePrefix),
    departmentInput: (
      <DepartmentInput<false>
        {...departmentProps}
        renderInput={useCallback<
          NonNullable<DepartmentInputProps["renderInput"]>
        >(
          (params) =>
            (departmentProps.renderInput || defaultInput)({
              label: showLabels ? "Department" : undefined,
              ...params,
            }),
          [departmentProps.renderInput, showLabels]
        )}
        rules={useMemo(() => addRequired(required, departmentProps.rules), [
          departmentProps.rules,
          required,
        ])}
        control={control}
        namePrefix={entryNamePrefix(namePrefix)}
        multiple={false}
      />
    ),
    departmentInputName: departmentName(entryNamePrefix(namePrefix)),
    sourceInput: (
      <EntityInput<false, undefined, AllowNewSource>
        allowNewBusiness={allowNewSource}
        allowNewPerson={allowNewSource}
        {...sourceProps}
        renderInput={useCallback<
          NonNullable<DepartmentInputProps["renderInput"]>
        >(
          (params) =>
            (sourceProps.renderInput || defaultInput)({
              label: showLabels ? "Source" : undefined,
              ...params,
            }),
          [sourceProps.renderInput, showLabels]
        )}
        rules={useMemo(() => addRequired(required, sourceProps.rules), [
          sourceProps.rules,
          required,
        ])}
        control={control}
        name={entryName("source", namePrefix)}
        multiple={false}
      />
    ),
    sourceInputName: entryName("source", namePrefix),
    categoryInput: (
      <CategoryInput
        {...categoryProps}
        renderInput={useCallback<
          NonNullable<DepartmentInputProps["renderInput"]>
        >(
          (params) =>
            (categoryProps.renderInput || defaultInput)({
              label: showLabels ? "Category" : undefined,
              ...params,
            }),
          [categoryProps.renderInput, showLabels]
        )}
        rules={useMemo(() => addRequired(required, categoryProps.rules), [
          categoryProps.rules,
          required,
        ])}
        control={control}
        namePrefix={entryNamePrefix(namePrefix)}
        multiple={false}
      />
    ),
    categoryInputName: categoryName(entryNamePrefix(namePrefix)),
    paymentMethodInput: (
      <PaymentMethodInput<false>
        {...paymentMethodProps}
        renderInput={useCallback<
          NonNullable<DepartmentInputProps["renderInput"]>
        >(
          (params) =>
            (paymentMethodProps.renderInput || defaultInput)({
              label: showLabels ? "Payment Method" : undefined,
              ...params,
            }),
          [paymentMethodProps.renderInput, showLabels]
        )}
        rules={useMemo(() => addRequired(required, paymentMethodProps.rules), [
          paymentMethodProps.rules,
          required,
        ])}
        entryType={entryType}
        control={control}
        namePrefix={entryNamePrefix(namePrefix)}
        multiple={false}
      />
    ),
    paymentMethodInputName: paymentMethodName(entryNamePrefix(namePrefix)),
    totalInput: (
      <RationalInput
        label={showLabels && "Total"}
        {...totalProps}
        inputProps={useMemo<NonNullable<RationalInputProps["inputProps"]>>(
          () => ({
            min: "0.01",
          }),
          []
        )}
        rules={useMemo(
          () =>
            addRequired(required, {
              ...(totalProps.rules || {}),
              validate: {
                greaterThanZero: (value: Fraction | null) => {
                  if (value instanceof Fraction && value.compare(0) <= 0) {
                    return "Must Be Greater Than 0";
                  }
                },
                ...(typeof totalProps.rules?.validate === "function"
                  ? {
                      validate: totalProps.rules?.validate,
                    }
                  : {
                      ...(totalProps.rules?.validate || {}),
                    }),
              },
            }),
          [totalProps.rules, required]
        )}
        name={entryName("total", namePrefix)}
      />
    ),
    totalInputName: entryName("total", namePrefix),
    reconciledInput: (
      <BoolInput
        label={showLabels && "Reconciled"}
        {...reconciledProps}
        control={control}
        name={entryName("reconciled", namePrefix)}
      />
    ),
    reconciledInputName: entryName("reconciled", namePrefix),
  };
};
