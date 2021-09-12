import React, { forwardRef, useMemo } from "react";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";
import { FieldValue, IsEqualFn, useIsEqual } from "../../useKISSForm/form";

export type DescriptionInputProps = Partial<
  Omit<
    TextFieldControlledProps<string>,
    "type" | "validator" | "select" | "SelectProps"
  >
>;

const descriptionIsEqual: IsEqualFn<string> = (a, b) => a?.trim() === b?.trim();

export const DESCRIPTION_NAME = "description";
export type DescriptionFieldDef<
  TName extends string = typeof DESCRIPTION_NAME
> = {
  [key in TName]: FieldValue<string>;
};
export const DescriptionInput = forwardRef(function DescriptionInput(
  props: DescriptionInputProps,
  ref: TextFieldControlledProps["ref"]
): JSX.Element {
  const { name = DESCRIPTION_NAME, ...rest } = props;

  useIsEqual<DescriptionFieldDef<typeof name>>({
    isEqual: useMemo(
      () => ({
        [name]: descriptionIsEqual,
      }),
      [name]
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: props.form as any,
  });

  return <TextFieldControlled {...rest} name={name} ref={ref} type="text" />;
});
