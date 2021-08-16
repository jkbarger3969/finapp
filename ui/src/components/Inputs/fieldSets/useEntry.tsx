import React, { useMemo } from "react";
import { TreeSelectValue } from "mui-tree-select";
import { gql, useQuery } from "@apollo/client";

import { DateInput, DateInputProps, DateFieldDef } from "../Date";
import {
  DepartmentInput,
  DepartmentInputProps,
  DepartmentFieldDef,
  DEPARTMENT_NAME,
  DEPARTMENT_DEFAULT_VALUE_FRAGMENT,
  useDepartmentDefaultValue,
} from "../Department";
import {
  EntityInput,
  EntityInputProps,
  EntityFieldDef,
  useEntityDefaultValue,
  ENTITY_INPUT_DEFAULT_VALUE_FRAGMENT,
} from "../Entity";
import {
  CategoryInputOpt,
  CategoryInput,
  CategoryInputProps,
  CategoryFieldDef,
  CATEGORY_NAME,
  CATEGORY_DEFAULT_VALUE_FRAGMENT,
  useCategoryDefaultValue,
} from "../Category";
import {
  PaymentMethodInput,
  PaymentMethodInputProps,
  PaymentMethodFieldDef,
  PAY_METHOD_DEFAULT_VALUE_FRAGMENT,
  PAYMENT_METHOD_NAME,
  usePaymentMethodDefaultValue,
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
  useLoading,
} from "../../../useKISSForm/form";
import {
  requiredValidator,
  gtZero,
  useRenderInputWithError,
  useRenderInputWithLabel,
} from "../shared";
import {
  UpdateEntryDefaultValuesQuery as UpdateEntryDefaultValues,
  UpdateEntryDefaultValuesQueryVariables as UpdateEntryDefaultValuesVars,
} from "../../../apollo/graphTypes";
import { deserializeDate, deserializeRational } from "../../../apollo/scalars";

const UPDATE_ENTRY_DEFAULT_VALUES = gql`
  query UpdateEntryDefaultValues($id: ID!) {
    entry(id: $id) {
      __typename
      id
      date
      dateOfRecord {
        date
      }
      category {
        ...CategoryInputDefaultValue
      }
      description
      department {
        ...DepartmentInputDefaultValue
      }
      source {
        ...EntityInputDefaultValue
      }
      paymentMethod {
        ...PayMethodDefaultValue
      }
      reconciled
      total
    }
  }
  ${DEPARTMENT_DEFAULT_VALUE_FRAGMENT}
  ${CATEGORY_DEFAULT_VALUE_FRAGMENT}
  ${ENTITY_INPUT_DEFAULT_VALUE_FRAGMENT}
  ${PAY_METHOD_DEFAULT_VALUE_FRAGMENT}
`;

export type EntryInputProps<
  AllowNewSource extends boolean | undefined = undefined
> = {
  date?: Omit<DateInputProps, "name" | "form">;
  dateOfRecord?: Omit<DateInputProps, "name" | "form">;

  department: Omit<DepartmentInputProps<false>, "multiple" | "form">;
  source?: Omit<
    EntityInputProps<false, undefined, AllowNewSource>,
    "name" | "multiple" | "allowNewBusiness" | "allowNewPerson" | "form"
  > & {
    allowNewSource?: AllowNewSource;
  };
  category?: Omit<
    CategoryInputProps<false>,
    "multiple" | "form" | "defaultValue"
  >;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "multiple" | "entryType" | "form" | "isRefund"
  >;
  total?: Omit<RationalInputProps, "name" | "form">;
  reconciled?:
    | Partial<Omit<BoolInputProps<"checkbox">, "name" | "form">>
    | Partial<Omit<BoolInputProps<"switch">, "name" | "form">>;
};

export type EntryProps<AllowNewSource extends boolean | undefined = undefined> =
  {
    showLabels?: boolean;
    insertNamePrefix?: string;
    required?: boolean;
    updateEntryId?: string;
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
    updateEntryId,
    form,
    required,
    showLabels,
    insertNamePrefix,
    date: dateProps,
    dateOfRecord: dateOfRecordProps,
    department: departmentProps,
    source: { allowNewSource, ...sourceProps } = {},
    category: categoryProps,
    paymentMethod: paymentMethodProps,
    total: totalProps,
    reconciled: reconciledProps,
  } = props;

  const { loading, error, data } = useQuery<
    UpdateEntryDefaultValues,
    UpdateEntryDefaultValuesVars
  >(UPDATE_ENTRY_DEFAULT_VALUES, {
    skip: !updateEntryId,
    variables: {
      id: updateEntryId as string,
    },
  });

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

  const dateDefaultValue = useMemo(
    () => (data?.entry?.date ? deserializeDate(data.entry.date) : undefined),
    [data?.entry?.date]
  );

  const dateOfRecordDefaultValue = useMemo(
    () =>
      data?.entry?.dateOfRecord?.date
        ? deserializeDate(data.entry.dateOfRecord.date)
        : undefined,
    [data?.entry?.dateOfRecord?.date]
  );

  const deptRenderInput = useRenderInputWithError(
    error,
    useRenderInputWithLabel(
      showLabels ? "Department" : undefined,
      categoryProps?.renderInput
    )
  );
  const deptDefaultValue = useDepartmentDefaultValue(data?.entry?.department);

  const categoryRenderInput = useRenderInputWithError(
    error,
    useRenderInputWithLabel(
      showLabels ? "Category" : undefined,
      categoryProps?.renderInput
    )
  );
  const categoryDefaultValue = useCategoryDefaultValue(data?.entry?.category);

  const srcRenderInput = useRenderInputWithError(
    error,
    useRenderInputWithLabel(
      showLabels ? "Source" : undefined,
      sourceProps?.renderInput
    )
  );
  const srcDefaultValue = useEntityDefaultValue(data?.entry?.source);

  const payMethodRenderInput = useRenderInputWithError(
    error,
    useRenderInputWithLabel(
      showLabels ? "Payment Method" : undefined,
      paymentMethodProps?.renderInput
    )
  );
  const payMethodDefaultValue = usePaymentMethodDefaultValue(
    data?.entry?.paymentMethod
  );

  const totalDefaultValue = useMemo(
    () =>
      data?.entry?.total ? deserializeRational(data.entry.total) : undefined,
    [data?.entry?.total]
  );

  useLoading({
    loading,
    name: useMemo(
      () => [
        prefixName(DATE_NAME, entryName),
        prefixName(DATE_OF_RECORD_NAME, entryName),
        prefixName(DEPARTMENT_NAME, entryName),
        prefixName(SOURCE_NAME, entryName),
        prefixName(CATEGORY_NAME, entryName),
        prefixName(PAYMENT_METHOD_NAME, entryName),
        prefixName(TOTAL_NAME, entryName),
        prefixName(RECONCILED_NAME, entryName),
      ],
      [entryName]
    ),
    form,
  });

  return {
    dateInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <DateInput
            label={showLabels && "Date"}
            defaultValue={dateDefaultValue}
            {...dateProps}
            disabled={loading || dateProps?.disabled}
            name={DATE_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [dateDefaultValue, dateProps, entryName, form, loading, showLabels]
    ),
    dateInputName: prefixName(DATE_NAME, fullName),
    dateOfRecordInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <DateInput
            label={showLabels && "Date of Record"}
            defaultValue={dateOfRecordDefaultValue}
            {...dateOfRecordProps}
            disabled={loading || dateOfRecordProps?.disabled}
            name={DATE_OF_RECORD_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        dateOfRecordDefaultValue,
        dateOfRecordProps,
        entryName,
        form,
        loading,
        showLabels,
      ]
    ),
    dateOfRecordInputName: prefixName(DATE_OF_RECORD_NAME, fullName),
    departmentInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <DepartmentInput<false>
            defaultValue={deptDefaultValue}
            {...departmentProps}
            disabled={loading || departmentProps.loading}
            renderInput={deptRenderInput}
            multiple={false}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        departmentProps,
        deptDefaultValue,
        deptRenderInput,
        entryName,
        form,
        loading,
      ]
    ),
    departmentInputName: prefixName(DEPARTMENT_NAME, fullName),
    sourceInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <EntityInput<false, undefined, AllowNewSource>
            allowNewBusiness={allowNewSource}
            allowNewPerson={allowNewSource}
            defaultValue={srcDefaultValue}
            {...sourceProps}
            disabled={loading || sourceProps.disabled}
            renderInput={srcRenderInput}
            multiple={false}
            name={SOURCE_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        allowNewSource,
        entryName,
        form,
        loading,
        sourceProps,
        srcDefaultValue,
        srcRenderInput,
      ]
    ),
    sourceInputName: prefixName(SOURCE_NAME, fullName),
    categoryInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <CategoryInput
            defaultValue={categoryDefaultValue}
            {...categoryProps}
            disabled={loading || categoryProps?.disabled}
            renderInput={categoryRenderInput}
            multiple={false}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        categoryDefaultValue,
        categoryProps,
        categoryRenderInput,
        entryName,
        form,
        loading,
      ]
    ),
    categoryInputName: prefixName(CATEGORY_NAME, fullName),
    paymentMethodInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <PaymentMethodInput<false>
            defaultValue={payMethodDefaultValue}
            {...paymentMethodProps}
            disabled={loading || paymentMethodProps.disabled}
            isRefund={false}
            renderInput={payMethodRenderInput}
            entryType={entryType}
            multiple={false}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        entryName,
        entryType,
        form,
        loading,
        payMethodDefaultValue,
        payMethodRenderInput,
        paymentMethodProps,
      ]
    ),
    paymentMethodInputName: prefixName(PAYMENT_METHOD_NAME, fullName),
    totalInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <RationalInput
            label={showLabels && "Total"}
            decimals={2}
            defaultValue={totalDefaultValue}
            {...totalProps}
            disabled={loading || totalProps?.disabled}
            name={TOTAL_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [entryName, form, loading, showLabels, totalDefaultValue, totalProps]
    ),
    totalInputName: prefixName(TOTAL_NAME, fullName),
    reconciledInput: useMemo(
      () => (
        <NamePrefixProvider namePrefix={entryName}>
          <BoolInput
            label={showLabels && "Reconciled"}
            defaultValue={!data?.entry?.reconciled}
            {...reconciledProps}
            disabled={loading || reconciledProps?.disabled}
            name={RECONCILED_NAME}
            form={form}
          />
        </NamePrefixProvider>
      ),
      [
        data?.entry?.reconciled,
        entryName,
        form,
        loading,
        reconciledProps,
        showLabels,
      ]
    ),
    reconciledInputName: prefixName(RECONCILED_NAME, fullName),
  };
};
