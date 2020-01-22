import React from "react";
import {useSelector} from "react-redux";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DoneIcon from '@material-ui/icons/Done';

import {JournalEntry_1Fragment as JournalEntryFragment
} from "../../../../apollo/graphTypes";
import {ROW_ID, RECONCILED_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";


export interface ReconciledProps {
  reconciled:JournalEntryFragment["reconciled"];
  textColor:string
}

const Reconciled = function(props:ReconciledProps) {

  const {reconciled, textColor} = props;
  
  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, RECONCILED_ID) as CellFormat);
  
  return <Box
    className={textColor}
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    // width="100%"
    minWidth={cellFormat.width}
    flexBasis={cellFormat.width}
    flexGrow={cellFormat.width}
    order={cellFormat.index > -1 ? cellFormat.index : undefined}
    display="flex !important"
    justifyContent="center"
    alignItems="center"
    clone
  >
    <TableCell component="div">
      {reconciled ? <DoneIcon /> : null}
    </TableCell>
  </Box>;

}

export default Reconciled;