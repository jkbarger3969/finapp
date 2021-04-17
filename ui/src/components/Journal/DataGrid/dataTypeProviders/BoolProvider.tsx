import React from "react";
import {
  DataTypeProvider,
  DataTypeProviderProps,
} from "@devexpress/dx-react-grid";
import { Done as DoneIcon } from "@material-ui/icons";
import { Box } from "@material-ui/core";

const BoolFormatter: NonNullable<
  DataTypeProviderProps["formatterComponent"]
> = ({ value }: DataTypeProvider.ValueFormatterProps) =>
  (value as boolean) ? (
    <Box width="100%" display="flex" justifyContent="center">
      <DoneIcon fontSize="small" />
    </Box>
  ) : null;

export type BoolProviderProps = Omit<
  DataTypeProviderProps,
  "formatterComponent"
>;

export const BoolProvider = (props: BoolProviderProps): JSX.Element => (
  <DataTypeProvider {...props} formatterComponent={BoolFormatter} />
);
