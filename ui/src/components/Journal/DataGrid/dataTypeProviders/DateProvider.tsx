import React, { useCallback, useMemo } from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";
import { availableRangeFilterOperations } from "../filters";

export type DateProviderProps = Omit<
  DataTypeProviderProps,
  "availableFilterOperations" | "formatterComponent"
> & {
  defaultFormat?: {
    locales?: string | string[];
    options?: Intl.DateTimeFormatOptions;
  };
  format?: Record<
    string,
    {
      locales?: string | string[];
      options?: Intl.DateTimeFormatOptions;
    }
  >;
};

const DEFAULT_FORMAT = Symbol();

export const DateProvider = (props: DateProviderProps): JSX.Element => {
  const { defaultFormat, format, ...rest } = props;

  const formatterMap = useMemo<
    Map<string | typeof DEFAULT_FORMAT, Intl.DateTimeFormat>
  >(() => {
    const formatterMap = new Map<
      string | typeof DEFAULT_FORMAT,
      Intl.DateTimeFormat
    >();

    if (format) {
      for (const key of Object.keys(format)) {
        const { locales, options } = format[key];

        formatterMap.set(key, new Intl.DateTimeFormat(locales, options));
      }
    }

    if (defaultFormat) {
      formatterMap.set(
        DEFAULT_FORMAT,
        new Intl.DateTimeFormat(defaultFormat.locales, defaultFormat.options)
      );
    }

    return formatterMap;
  }, [format, defaultFormat]);

  const formatterComponent = useCallback(
    ({ value, column }: DataTypeProvider.ValueFormatterProps) => {
      const numberFormat = formatterMap.has(column.name)
        ? formatterMap.get(column.name)
        : formatterMap.get(DEFAULT_FORMAT);

      const valueFormatted = useMemo(() => {
        return numberFormat
          ? numberFormat.format(value as Date)
          : (value as Date).toLocaleDateString();
      }, [numberFormat, value]);

      return <span>{valueFormatted}</span>;
    },
    [formatterMap]
  );

  return (
    <DataTypeProvider
      {...rest}
      availableFilterOperations={availableRangeFilterOperations as string[]}
      formatterComponent={formatterComponent}
    />
  );
};
