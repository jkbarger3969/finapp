import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import moment from 'moment';


export interface TransactionDateProps {
  entryDate:string;
  textColor:string;
}

const TransactionDate = function(props:TransactionDateProps) {

  const {entryDate, textColor} = props;

  const date = moment(entryDate);

  return <Box 
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    clone
  >
    <TableCell component='div'>{date.format('MMM DD, YYYY')}</TableCell>
  </Box>;

}

export default TransactionDate;