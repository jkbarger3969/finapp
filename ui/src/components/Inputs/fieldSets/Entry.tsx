import React, { Fragment, useMemo } from "react";
import { Control, UseControllerProps, useWatch } from "react-hook-form";

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

export type EntryProps = {
  date?: {
    date?: Omit<DateInputProps, "name" | "control">;
    dateOfRecord?: Omit<DateInputProps, "name" | "control">;
  } & Omit<DateInputProps, "name" | "label" | "control">;
  department: Omit<DepartmentInputProps, "namePrefix" | "control" | "multiple">;
  source?: Omit<EntityInputProps, "name" | "control" | "multiple">;
  category?: Omit<CategoryInputProps, "namePrefix" | "control" | "multiple">;
  paymentMethod: Omit<
    PaymentMethodInputProps,
    "namePrefix" | "control" | "multiple" | "entryType"
  >;
  total?: Omit<RationalInputProps, "name" | "control">;
  control?: Control;
  namePrefix?: string;
};

export const ENTRY_NAME = "entry";
type EntryFieldNames =
  | "date"
  | "dateOfRecord"
  | typeof DEPARTMENT_NAME
  | "source"
  | typeof CATEGORY_NAME
  | typeof PAYMENT_METHOD_NAME
  | "total";

export const entryNamePrefix = (namePrefix?: string): string =>
  namePrefix ? `${namePrefix}.${ENTRY_NAME}` : ENTRY_NAME;
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

export const Entry = (props: EntryProps): JSX.Element => {
  const {
    control,
    namePrefix,
    date: {
      date: dateProps = {},
      dateOfRecord: dateOfRecordProps = {},
      ...globalDateProps
    } = {},
    department: departmentProps,
    source: sourceProps = {},
    category: categoryProps = {},
    paymentMethod: paymentMethodProps,
    total: totalProps = {},
  } = props;

  const categoryValue = useWatch({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: categoryName(entryNamePrefix(namePrefix)) as any,
    defaultValue: null,
  }) as CategoryInputBaseProps<false, false, false>["value"] | null;

  const entryType = categoryValue?.valueOf().type ?? null;

  return (
    <Fragment>
      <DateInput
        {...globalDateProps}
        {...dateProps}
        control={control}
        name={entryName("date", namePrefix)}
        rules={useMemo<UseControllerProps["rules"]>(
          () => ({
            ...(globalDateProps.rules || {}),
            ...(dateProps.rules || {}),
          }),
          [dateProps.rules, globalDateProps.rules]
        )}
      />
      <DateInput
        {...globalDateProps}
        {...dateOfRecordProps}
        control={control}
        name={entryName("dateOfRecord", namePrefix)}
        rules={useMemo<UseControllerProps["rules"]>(
          () => ({
            ...(globalDateProps.rules || {}),
            ...(dateOfRecordProps.rules || {}),
          }),
          [dateOfRecordProps.rules, globalDateProps.rules]
        )}
      />
      <DepartmentInput<false>
        {...departmentProps}
        control={control}
        namePrefix={entryNamePrefix(namePrefix)}
        multiple={false}
      />
      <EntityInput<false>
        {...sourceProps}
        control={control}
        name={entryName("source", namePrefix)}
        multiple={false}
      />
      <CategoryInput<false>
        {...categoryProps}
        control={control}
        namePrefix={entryNamePrefix(namePrefix)}
        multiple={false}
      />
      <PaymentMethodInput<false>
        {...paymentMethodProps}
        entryType={entryType}
        control={control}
        namePrefix={entryNamePrefix(namePrefix)}
        multiple={false}
      />
      <RationalInput {...totalProps} name={entryName("total", namePrefix)} />
    </Fragment>
  );
};
