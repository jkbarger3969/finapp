import React from "react";
import {useSelector} from "react-redux";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";

import {JournalEntry_1Fragment as JournalEntryFragment
} from "../../../../apollo/graphTypes";
import {ROW_ID, DSCRPT_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";


export interface DescriptionProps {
  description:JournalEntryFragment["description"];
  textColor:string
}

const Description = function(props:DescriptionProps) {

  const {description, textColor} = props;
  
  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, DSCRPT_ID) as CellFormat);

 
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
    <TableCell component="div">{description}</TableCell>
  </Box>

}

export default Description;