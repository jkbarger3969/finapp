import React from "react";
import { useSelector } from "react-redux";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";

import { JournalEntry_1Fragment as JournalEntryFragment } from "../../../../apollo/graphTypes";
import { ROW_ID, PAY_METHOD_ID } from "./cellsReduxIni";
import { Root } from "../../../../redux/reducers/root";
import { TableCell as CellFormat } from "../../../../redux/reducers/tableRows";
import { getCell } from "../../../../redux/selectors/tableRows";
import { CHECK_ID } from "../../constants";

export interface PaymentMethodProps {
  paymentMethod: JournalEntryFragment["paymentMethod"];
  textColor: string;
}

const PaymentMethod = function(props: PaymentMethodProps) {
  const { paymentMethod, textColor } = props;

  const cellFormat = useSelector<Root, CellFormat>(
    state => getCell(state, ROW_ID, PAY_METHOD_ID) as CellFormat
  );

  let name = paymentMethod.name;
  if (paymentMethod.parent?.id === CHECK_ID) {
    name = `CK-${name}`;
  }

  return (
    <Box
      className={textColor}
      display="block"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      overflow="hidden"
      // width="100%"
      minWidth={cellFormat.width}
      flexBasis={cellFormat.width}
      flexGrow={cellFormat.width}
      order={cellFormat.index > -1 ? cellFormat.index : undefined}
      clone
    >
      <TableCell component="div">{name}</TableCell>
    </Box>
  );
};

export default PaymentMethod;
