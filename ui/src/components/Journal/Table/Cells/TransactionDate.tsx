import React from 'react';
import {useSelector} from "react-redux";
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import moment from 'moment';


import {ROW_ID, DATE_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";


export interface TransactionDateProps {
  entryDate:string;
  textColor:string;
}

const TransactionDate = function(props:TransactionDateProps) {

  const {entryDate, textColor} = props;

  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, DATE_ID) as CellFormat);

  const date = moment(entryDate);
  
  return <Box 
    className={textColor}
    // display="block"
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
    <TableCell component='div'>{date.format('MMM DD, YYYY')}</TableCell>
  </Box>;

}

export default TransactionDate;