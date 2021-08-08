import React, { useCallback, useMemo } from "react";
import { defaultInput, TreeSelectValue } from "mui-tree-select";
import Fraction from "fraction.js";

import { DateInput, DateInputProps, DateFieldDef } from "../Date";
import {
  DepartmentInput,
  DepartmentInputProps,
  DepartmentFieldDef,
  DEPARTMENT_NAME,
} from "../Department";
import { EntityInput, EntityInputProps, EntityFieldDef } from "../Entity";
import {
  CategoryInputOpt,
  CategoryInput,
  CategoryInputProps,
  CategoryFieldDef,
  CATEGORY_NAME,
} from "../Category";
import {
  PaymentMethodInput,
  PaymentMethodInputProps,
  PaymentMethodFieldDef,
  PAYMENT_METHOD_NAME,
} from "../PaymentMethod";
import {
  RationalInput,
  RationalInputProps,
  RationalFieldDef,
} from "../RationalInput";
import { BoolInput, BoolInputProps, BoolFieldDef } from "../BoolInput";
import {
  NamePrefixProvider,
  prefixName,
  UseFieldOptions,
  useNamePrefix,
  useValidators,
  useWatcher,
  UseValidatorOptions,
  useDefaultValues,
  FieldValue,
  Validator,
} from "../../../useKISSForm/form";
import { requiredValidator } from "../shared";

export type EntryInputProps<
  AllowNewSource extends boolean | undefined = undefined
> = {
  date?: Omit<DateInputProps, "name" | "form">;
  dateOfRecord?: Omit<DateInputProps, "name" | "form">;

  department: Omit<DepartmentInputProps, "multiple" | "form">;
  source?: Omit<
    EntityInputProps<false, undefined, AllowNewSource>,
    "name" | "multiple" | "allowNewBusiness" | "allowNewPerson" | "form"
  > & {
    allowNewSource?: AllowNewSource;
  };
  category?: Omit<CategoryInputProps, "multiple" | "form">;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "multiple" | "entryType" | "form"
  >;
  total?: Omit<RationalInputProps, "name" | "form">;
  reconciled?:
    | Partial<Omit<BoolInputProps<"checkbox">, "name" | "form">>
    | Partial<Omit<BoolInputProps<"switch">, "name" | "form">>;
};

const gtZero: Validator<Fraction> = (value) => {
  if (value && value.compare(0) <= 0) {
    return new RangeError("Must be greater than zero.");
  }
};

export type EntryProps<AllowNewSource extends boolean | undefined = undefined> =
  {
    showLabels?: boolean;
    insertNamePrefix?: string;
    required?: boolean;
  } & EntryInputProps<AllowNewSource> &
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Pick<UseFieldOptions<any, string, any>, "form">;

export const DATE_NAME = "date";
export const DATE_OF_RECORD_NAME = "dateOfRecord";
export const SOURCE_NAME = "source";
export const TOTAL_NAME = "total";
export const RECONCILED_NAME = "reconciled";

export type EntryFieldDef = {
  entry: DateFieldDef<typeof DATE_NAME> &
    DateFieldDef<typeof DATE_OF_RECORD_NAME> &
    DepartmentFieldDef<false, false> &
    EntityFieldDef<typeof SOURCE_NAME, false, true> &
    CategoryFieldDef<false, false> &
    PaymentMethodFieldDef<false, false> &
    RationalFieldDef<typeof TOTAL_NAME> &
    BoolFieldDef<typeof RECONCILED_NAME>;
};
export const ENTRY_NAME: keyof EntryFieldDef = "entry";

export type EntryFieldNames =
  | typeof DATE_NAME
  | typeof DATE_OF_RECORD_NAME
  | typeof DEPARTMENT_NAME
  | typeof SOURCE_NAME
  | typeof CATEGORY_NAME
  | typeof PAYMENT_METHOD_NAME
  | typeof TOTAL_NAME
  | typeof RECONCILED_NAME;

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
    required,
    showLabels,
    insertNamePrefix,
    date: dateProps = {} as DateInputProps,
    dateOfRecord: dateOfRecordProps = {},
    department: departmentProps,
    source: { allowNewSource, ...sourceProps } = {},
    category: categoryProps = {},
    paymentMethod: paymentMethodProps,
    total: totalProps = {},
    reconciled: reconciledProps = {},
  } = props;

  const entryName = insertNamePrefix
    ? prefixName(ENTRY_NAME, insertNamePrefix)
    : ENTRY_NAME;

  const fullName = useNamePrefix(entryName);

  const categoryValue = useWatcher<
    TreeSelectValue<CategoryInputOpt, CategoryInputOpt, false, true, false>
  >({
    name: prefixName(CATEGORY_NAME, ENTRY_NAME),
    form,
  });

  useValidators<EntryFieldDef>(
    useMemo<UseValidatorOptions<EntryFieldDef>>(() => {
      if (required) {
        return {
          validators: {
            entry: {
              date: requiredValidator,
              department: requiredValidator,
              source: requiredValidator,
              category: requiredValidator,
              paymentMethod: requiredValidator,
              total: [requiredValidator, gtZero],
            },
          },
          form,
        };
      } else {
        return {
          validators: {
            entry: {
              total: gtZero,
            },
          },
          form,
        };
      }
    }, [form, required])
  );

  // Handle conditions where date of record should take the value of
  // date.
  const { value: dateValue } = useWatcher<Date>({
    name: prefixName(DATE_NAME, ENTRY_NAME),
    form,
  });
  useDefaultValues(
    useMemo(
      () => ({
        defaultValues: {
          [prefixName(DATE_OF_RECORD_NAME, ENTRY_NAME)]: new FieldValue(
            dateValue
          ),
        },
        form,
      }),
      [dateValue, form]
    )
  );

  const entryType =
    (categoryValue.value?.valueOf() ?? categoryValue.defaultValue?.valueOf())
      ?.type ?? null;

  return {
    dateInput: (
      <NamePrefixProvider namePrefix={entryName}>
        <DateInput
          label={showLabels && "Date"}
          {...dateProps}
          name={DATE_NAME}
        />
      </NamePrefixProvider>
    ),
    dateInputName: prefixName(DATE_NAME, fullName),
    dateOfRecordInput: (
      <NamePrefixProvider namePrefix={entryName}>
        <DateInput
          label={showLabels && "Date of Record"}
          {...dateOfRecordProps}
          name={DATE_OF_RECORD_NAME}
        />
      </NamePrefixProvider>
    ),
    dateOfRecordInputName: prefixName(DATE_OF_RECORD_NAME, fullName),
    departmentInput: (
      <NamePrefixProvider namePrefix={entryName}>
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
    departmentInputName: prefixName(DEPARTMENT_NAME, fullName),
    sourceInput: (
      <NamePrefixProvider namePrefix={entryName}>
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
    sourceInputName: prefixName(SOURCE_NAME, fullName),
    categoryInput: (
      <NamePrefixProvider namePrefix={entryName}>
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
    categoryInputName: prefixName(CATEGORY_NAME, fullName),
    paymentMethodInput: (
      <NamePrefixProvider namePrefix={entryName}>
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
    paymentMethodInputName: prefixName(PAYMENT_METHOD_NAME, fullName),
    totalInput: (
      <NamePrefixProvider namePrefix={entryName}>
        <RationalInput
          label={showLabels && "Total"}
          decimals={2}
          {...totalProps}
          name={TOTAL_NAME}
        />
      </NamePrefixProvider>
    ),
    totalInputName: prefixName(TOTAL_NAME, fullName),
    reconciledInput: (
      <NamePrefixProvider namePrefix={entryName}>
        <BoolInput
          label={showLabels && "Reconciled"}
          {...reconciledProps}
          name={RECONCILED_NAME}
        />
      </NamePrefixProvider>
    ),
    reconciledInputName: prefixName(RECONCILED_NAME, fullName),
  };
};
