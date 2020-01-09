import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import Box from "@material-ui/core/Box";
import {capitalCase} from 'change-case';

import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';

export interface PaymentMethodProps {
  paymentMethod:JournalEntryFragment['paymentMethod'];
  textColor:string;
}

const PaymentMethod = function(props:PaymentMethodProps) {

  const {paymentMethod, textColor} = props;
  
  return <Box
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    clone
  >
     <TableCell component='div'>{capitalCase(paymentMethod.method)}</TableCell>
  </Box>;
  
}

export default PaymentMethod;