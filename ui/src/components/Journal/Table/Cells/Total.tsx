import React from 'react';
import {useSelector} from "react-redux";
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import numeral from 'numeral';
import Fraction from 'fraction.js';

import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';
import {ROW_ID, TOTAL_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";


export interface TotalProps {
  total:JournalEntryFragment['total'];
  textColor:string;
}

const Total = function(props:TotalProps) {

  const {total:{num:n, den:d}, textColor} = props;
  const faction = new Fraction({n, d});
  
  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, TOTAL_ID) as CellFormat);
  
  return <Box 
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    minWidth={cellFormat.width}
    flexGrow={cellFormat.width}
    order={cellFormat.index > -1 ? cellFormat.index : undefined}
    clone
  >
    <TableCell component='div'>{
      numeral(faction.toString()).format('$0,0.00')
    }</TableCell>
  </Box>;

}

export default Total;