import React, { useCallback, useMemo } from "react";
import Fraction from "fraction.js";
import { defaultInput, TreeSelectValue } from "mui-tree-select";
import { isEqual } from "date-fns";

import { DateInput, DateInputProps } from "../Date";
import {
  DepartmentInput,
  DepartmentInputProps,
  DEPARTMENT_NAME,
} from "../Department";
import { EntityInput, EntityInputProps } from "../Entity";
import {
  CategoryInputOpt,
  CategoryInput,
  CategoryInputProps,
  CATEGORY_NAME,
} from "../Category";
import {
  PaymentMethodInput,
  PaymentMethodInputProps,
  PAYMENT_METHOD_NAME,
} from "../PaymentMethod";
import { RationalInput, RationalInputProps } from "../RationalInput";
import { BoolInput, BoolInputProps } from "../BoolInput";
import {
  NamePrefixProvider,
  prefixName,
  useField,
  UseFieldOptions,
  useNamePrefix,
  useWatcher,
} from "../../../useKISSForm/form";

export type EntryInputProps<
  AllowNewSource extends boolean | undefined = undefined
> = {
  date?: Omit<DateInputProps, "name" | "shouldUnregister" | "form">;
  dateOfRecord?: Omit<DateInputProps, "name" | "shouldUnregister" | "form">;

  department: Omit<
    DepartmentInputProps,
    "multiple" | "shouldUnregister" | "form"
  >;
  source?: Omit<
    EntityInputProps<false, undefined, AllowNewSource>,
    | "name"
    | "multiple"
    | "allowNewBusiness"
    | "allowNewPerson"
    | "shouldUnregister"
    | "form"
  > & {
    allowNewSource?: AllowNewSource;
  };
  category?: Omit<CategoryInputProps, "multiple" | "shouldUnregister" | "form">;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "multiple" | "entryType" | "shouldUnregister" | "form"
  >;
  total?: Omit<RationalInputProps, "name" | "shouldUnregister" | "form">;
  reconciled?:
    | Partial<
        Omit<BoolInputProps<"checkbox">, "name" | "shouldUnregister" | "form">
      >
    | Partial<
        Omit<BoolInputProps<"switch">, "name" | "shouldUnregister" | "form">
      >;
};

export type EntryProps<
  AllowNewSource extends boolean | undefined = undefined
> = {
  showLabels?: boolean;
  required?: boolean;
} & EntryInputProps<AllowNewSource> &
  Pick<UseFieldOptions, "form" | "shouldUnregister">;

const TOTAL_NAME = "total";
const SOURCE_NAME = "source";
const RECONCILED_NAME = "reconciled";
export const ENTRY_NAME = "entry";
type EntryFieldNames =
  | "date"
  | "dateOfRecord"
  | typeof DEPARTMENT_NAME
  | "source"
  | typeof CATEGORY_NAME
  | typeof PAYMENT_METHOD_NAME
  | "total"
  | "reconciled";

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
    form,
    shouldUnregister,
    required,
    showLabels,
    date: { onChange: onChangeDateProp, ...dateProps } = {} as DateInputProps,
    dateOfRecord: dateOfRecordProps = {},
    department: departmentProps,
    source: { allowNewSource, ...sourceProps } = {},
    category: categoryProps = {},
    paymentMethod: paymentMethodProps,
    total: totalProps = {},
    reconciled: reconciledProps = {},
  } = props;

  const namePrefix = useNamePrefix(ENTRY_NAME);

  const categoryValue = useWatcher<
    TreeSelectValue<CategoryInputOpt, CategoryInputOpt, false, true, false>
  >({
    name: prefixName(CATEGORY_NAME, ENTRY_NAME),
    form,
  });

  // Handle conditions where date of record should take the value of
  // date.
  const dateOfRecordName = prefixName("dateOfRecord", ENTRY_NAME);
  const {
    props: { value: dateOfRecordValue },
    state: { isDirty: dateOfRecordIsDirty },
    setValue: dateOfRecordSetValue,
  } = useField<Date>({
    name: dateOfRecordName,
    defaultValue: dateOfRecordProps?.defaultValue,
    shouldUnregister,
    form,
  });

  const dateValue = useWatcher<Date>({
    name: prefixName("date", ENTRY_NAME),
    form,
  });

  const handleDateChange = useCallback<NonNullable<DateInputProps["onChange"]>>(
    (...args) => {
      // date of record should mirror date
      if (
        !dateOfRecordIsDirty &&
        (!dateOfRecordValue ||
          isEqual(
            dateOfRecordValue || 0,
            dateValue.value || dateValue.defaultValue || 0
          ))
      ) {
        dateOfRecordSetValue(args[0] ?? undefined);
      }

      if (onChangeDateProp) {
        onChangeDateProp(...args);
      }
    },
    [
      dateOfRecordIsDirty,
      dateOfRecordSetValue,
      dateOfRecordValue,
      dateValue.defaultValue,
      dateValue.value,
      onChangeDateProp,
    ]
  );

  const entryType =
    (categoryValue.value?.valueOf() ?? categoryValue.defaultValue?.valueOf())
      ?.type ?? null;

  return {
    dateInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
        <DateInput
          label={showLabels && "Date"}
          {...dateProps}
          onChange={handleDateChange}
          name="date"
        />
      </NamePrefixProvider>
    ),
    dateInputName: prefixName("date", namePrefix),
    dateOfRecordInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
        <DateInput
          label={showLabels && "Date of Record"}
          {...dateOfRecordProps}
          name="dateOfRecord"
        />
      </NamePrefixProvider>
    ),
    dateOfRecordInputName: prefixName(" dateOfRecord", namePrefix),
    departmentInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
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
          multiple={false}
        />
      </NamePrefixProvider>
    ),
    departmentInputName: prefixName(DEPARTMENT_NAME, namePrefix),
    sourceInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
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
          multiple={false}
          name={SOURCE_NAME}
        />
      </NamePrefixProvider>
    ),
    sourceInputName: prefixName(SOURCE_NAME, namePrefix),
    categoryInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
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
          multiple={false}
        />
      </NamePrefixProvider>
    ),
    categoryInputName: prefixName(CATEGORY_NAME, namePrefix),
    paymentMethodInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
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
          entryType={entryType}
          multiple={false}
        />
      </NamePrefixProvider>
    ),
    paymentMethodInputName: prefixName(PAYMENT_METHOD_NAME, namePrefix),
    totalInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
        <RationalInput
          label={showLabels && "Total"}
          {...totalProps}
          inputProps={useMemo<NonNullable<RationalInputProps["inputProps"]>>(
            () => ({
              min: "0.01",
            }),
            []
          )}
          /* rules={useMemo(
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
          )} */
          name={TOTAL_NAME}
        />
      </NamePrefixProvider>
    ),
    totalInputName: prefixName(TOTAL_NAME, namePrefix),
    reconciledInput: (
      <NamePrefixProvider namePrefix={ENTRY_NAME}>
        <BoolInput
          label={showLabels && "Reconciled"}
          {...reconciledProps}
          name={RECONCILED_NAME}
        />
      </NamePrefixProvider>
    ),
    reconciledInputName: prefixName(RECONCILED_NAME, namePrefix),
  };
};
