import { useEffect, useRef } from "react";
import {
  useFormContext,
  useController as useControllerDefault,
  FieldValues,
  FieldPath,
  UseControllerProps,
  UseControllerReturn,
  set,
} from "react-hook-form";
import unset from "lodash.unset";
import has from "lodash.has";

export const useController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: UseControllerProps<TFieldValues, TName>
): UseControllerReturn<TFieldValues, TName> => {
  const methods = useFormContext<TFieldValues>();
  const {
    name,
    defaultValue,
    control: { defaultValuesRef } = methods.control,
  } = props;

  const localDefaultValue = useRef({
    setByLocal: false,
    name,
    defaultValue,
    defaultValuesRef,
  });

  useEffect(() => {
    const { name, defaultValue, defaultValuesRef } = localDefaultValue.current;

    if (defaultValue !== undefined && !has(defaultValuesRef.current, name)) {
      set(defaultValuesRef.current, name, defaultValue);
      localDefaultValue.current.setByLocal = true;
    }

    const { setByLocal } = localDefaultValue.current;

    return () => {
      if (setByLocal) {
        unset(defaultValuesRef.current, name);
      }
    };
  }, []);

  return useControllerDefault<TFieldValues, TName>(props);
};
