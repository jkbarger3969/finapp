import React, { forwardRef } from "react";

import { TextFieldControlled, TextFieldControlledProps } from "./shared";
import { FieldValue } from "../../useKISSForm/form";

export type DescriptionInputProps = Partial<
  Omit<
    TextFieldControlledProps<string>,
    "type" | "validator" | "select" | "SelectProps"
  >
>;

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

  return <TextFieldControlled {...rest} name={name} ref={ref} type="text" />;
});
