import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import numeral from 'numeral';
import Fraction from 'fraction.js';

import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';


export interface TotalProps {
  total:JournalEntryFragment['total'];
  textColor:string;
}

const Total = function(props:TotalProps) {

  const {total:{num:n, den:d}, textColor} = props;
  const faction = new Fraction({n, d});
  
  return <Box 
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    clone
  >
    <TableCell component='div'>{
      numeral(faction.toString()).format('$0,0.00')
    }</TableCell>
  </Box>;

}

export default Total;