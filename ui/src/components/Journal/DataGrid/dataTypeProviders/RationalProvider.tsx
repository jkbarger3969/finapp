import React, { useCallback, useMemo } from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";
import Fraction from "fraction.js";

export type RationalProviderProps = Omit<
  DataTypeProviderProps,
  "formatterComponent"
> & {
  format?: Record<
    string,
    {
      locales?: string | string[];
      options?: Intl.NumberFormatOptions;
    }
  >;
};

export const RationalProvider = (props: RationalProviderProps): JSX.Element => {
  const { format, ...rest } = props;

  const formatterMap = useMemo<Map<string, Intl.NumberFormat>>(() => {
    const formatterMap = new Map<string, Intl.NumberFormat>();

    if (format) {
      for (const key of Object.keys(format)) {
        const { locales, options } = format[key];
        formatterMap.set(key, new Intl.NumberFormat(locales, options));
      }
    }

    return formatterMap;
  }, [format]);

  const formatterComponent = useCallback(
    ({ value, column }: DataTypeProvider.ValueFormatterProps) => {
      const numberFormat = formatterMap.get(column.name);

      const valueFormatted = useMemo(() => {
        return numberFormat
          ? numberFormat.format((value as Fraction).valueOf())
          : (value as Fraction).valueOf().toLocaleString();
      }, [
        numberFormat,
        (value as Fraction).s,
        (value as Fraction).n,
        (value as Fraction).d,
      ]);

      return <span>{valueFormatted}</span>;
    },
    [formatterMap]
  );

  return <DataTypeProvider {...rest} formatterComponent={formatterComponent} />;
};
