import React from 'react';
import {useSelector} from "react-redux";
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import {capitalCase} from 'change-case';


import {JournalEntry_1Fragment as JournalEntryFragment
} from '../../../../apollo/graphTypes';
import {ROW_ID, CATEGORY_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";

export interface CategoryProps {
  category:JournalEntryFragment['category'];
  textColor:string;
}

const Category = function(props:CategoryProps) {

  const {category, textColor} = props;
  
  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, CATEGORY_ID) as CellFormat);
  
  return <Box
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
    <TableCell component='div'>{capitalCase(category.name)}</TableCell>
  </Box>;

}

export default Category;