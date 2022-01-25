import React, { useCallback, useMemo } from "react";
import { Done as DoneIcon } from "@material-ui/icons";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

import {
  inlinePadding,
  inlineInputProps,
  inlineAutoCompleteProps,
} from "./shared";
import { TableFilterCellProps } from "../plugins";
import { AvailableFilterOperations } from "../filters/rangeFilterUtils";

// Data Cell
const boolCellStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

export const BoolCell = (props: Table.DataCellProps): JSX.Element => {
  const { value, ...rest } = props;
  return (
    <Table.Cell {...(rest as Table.DataCellProps)}>
      <div style={boolCellStyle}>{value && <DoneIcon fontSize="small" />}</div>
    </Table.Cell>
  );
};

// Filter Cell
const renderInput: AutocompleteProps<
  boolean,
  false,
  false,
  false
>["renderInput"] = (params) => {
  const props = {
    ...params,
    InputProps: {
      ...inlineInputProps,
      ...params.InputProps,
    },
  } as TextFieldProps;

  return <TextField {...props} />;
};

export type BoolFilterProps = TableFilterCellProps<
  boolean,
  Extract<AvailableFilterOperations, "equal">
> & {
  boolLabels?: {
    trueLabel: string;
    falseLabel: string;
  };
};

const filterOptions = [true, false];

export const BoolFilter = (props: BoolFilterProps): JSX.Element => {
  const { boolLabels, ...rest } = props;

  const columnName = props.column.name;

  type Props = AutocompleteProps<boolean, false, false, false>;

  const { onFilter, filter } = props;

  const value = useMemo(() => {
    if (filter && "operation" in filter) {
      return filter.value ?? null;
    }
    return null;
  }, [filter]);

  const handleChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value === null) {
        onFilter(null);
      } else {
        onFilter({
          columnName,
          operation: "equal",
          value: value,
        });
      }
    },
    [columnName, onFilter]
  );

  const getOptionLabel = useCallback<NonNullable<Props["getOptionLabel"]>>(
    (option) => {
      if (boolLabels) {
        return option ? boolLabels.trueLabel : boolLabels.falseLabel;
      } else {
        return option ? "True" : "False";
      }
    },
    [boolLabels]
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <TableFilterRow.Cell {...(rest as any)} style={inlinePadding}>
      <Autocomplete
        getOptionLabel={getOptionLabel}
        renderInput={renderInput}
        onChange={handleChange}
        options={filterOptions}
        value={value}
        {...inlineAutoCompleteProps}
      />
    </TableFilterRow.Cell>
  );
};
