import React from "react";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";
import {capitalCase} from "change-case";

import {JournalEntry_1Fragment as JournalEntryFragment
} from "../../../../apollo/graphTypes";
export interface DepartmentProps {
  department:JournalEntryFragment["department"];
  textColor:string
}

const Department = function(props:DepartmentProps) {

  const {department, textColor} = props;
  
  return <Box
    className={textColor}
    display="block"
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    width="100%"
    clone
  >
    <TableCell component="div">{capitalCase(department.name)}</TableCell>
  </Box>;

}

export default Department;