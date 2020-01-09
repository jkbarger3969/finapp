import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import {capitalCase} from 'change-case';


import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';

export interface TypeProps {
  type:JournalEntryFragment['type'];
  textColor:string;
}

const Type = function(props:TypeProps) {

  const {type, textColor} = props;
  
  return <Box
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    clone
  >
    <TableCell component='div'>{capitalCase(type.type)}</TableCell>
  </Box>;

}

export default Type;