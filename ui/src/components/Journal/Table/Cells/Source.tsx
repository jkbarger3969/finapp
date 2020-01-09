import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import Box from "@material-ui/core/Box";

import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';

export interface SourceProps {
  source:JournalEntryFragment['source'];
  textColor:string;
}

const Source = function(props:SourceProps) {

  const {source, textColor} = props;

  let sourceName = '';
  switch(source.__typename) {
    case "Person":
      sourceName = `${source.name.first} ${source.name.last}`;
      break;
    case "Business":
        sourceName = source.bizName;
        break;
    case "Department":
      sourceName = source.deptName;
      break;
  }

  return<Box 
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    clone
  >
    <TableCell component="div">{sourceName}</TableCell>
  </Box>;

}

export default Source;