import React from 'react';
import {useSelector} from "react-redux";
import TableCell from '@material-ui/core/TableCell';
import Box from "@material-ui/core/Box";

import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';
import {ROW_ID, SRC_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";

export interface SourceProps {
  source:JournalEntryFragment['source'];
  textColor:string;
}

const Source = function(props:SourceProps) {

  const {source, textColor} = props;
  
  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, SRC_ID) as CellFormat);

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
    minWidth={cellFormat.width}
    flexGrow={cellFormat.width}
    order={cellFormat.index > -1 ? cellFormat.index : undefined}
    clone
  >
    <TableCell component="div">{sourceName}</TableCell>
  </Box>;

}

export default Source;