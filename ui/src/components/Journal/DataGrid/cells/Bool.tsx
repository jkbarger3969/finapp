import React, { useCallback } from "react";
import { Done as DoneIcon } from "@material-ui/icons";
import { Table, TableFilterRow } from "@devexpress/dx-react-grid-material-ui";
import { TextField, TextFieldProps } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";

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
      ...params.InputProps,
      margin: "dense",
    },
  } as TextFieldProps;

  return <TextField {...props} />;
};

export type BoolFilterProps = TableFilterRow.CellProps & {
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

  const onChange = useCallback<NonNullable<Props["onChange"]>>(
    (_, value) => {
      if (value === true) {
        props.onFilter({
          columnName,
          value: value.toString(),
        });
      } else if (value === false) {
        props.onFilter({
          columnName,
          value: value.toString(),
        });
      } else {
        props.onFilter(null);
      }
    },
    [columnName, props.onFilter]
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
    <TableFilterRow.Cell {...rest}>
      <Autocomplete
        fullWidth
        getOptionLabel={getOptionLabel}
        renderInput={renderInput}
        size="small"
        onChange={onChange}
        options={filterOptions}
      />
    </TableFilterRow.Cell>
  );
};
