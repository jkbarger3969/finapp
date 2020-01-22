import React, {useMemo} from 'react';
import {useSelector, shallowEqual} from "react-redux";
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';

import {ROW_ID} from "./Cells/cellsReduxIni";
import {Root} from "../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../redux/reducers/tableRows";
import {getIndexedCells} from "../../../redux/selectors/tableRows";


const Header = function(props) {

  const cellFormats = useSelector<Root,CellFormat[]>((state) => 
      getIndexedCells(state, ROW_ID), shallowEqual);

  const cells = useMemo(()=>cellFormats.map(({name, width, index}, i)=><Box
    key={`${name}_${i}`}
    minWidth={width}
    flexBasis={width}
    flexGrow={width}
    order={index}
    clone
  >
    <TableCell
      component='div'
      children={name}
    />
  </Box>),[cellFormats]);

  return <TableHead component='div'>
    <Box
      display="flex !important"
      flexDirection="row"
      justifyContent="flex-start"
      clone
    >
      <TableRow  component='div'>
        {cells}
      </TableRow>
    </Box>
  </TableHead>;

}

export default Header;