import React, {useMemo} from 'react';
import {useSelector} from "react-redux";
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
// import Grid from '@material-ui/core/Grid';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles';

import {ROW_ID} from "./Cells/cellsReduxIni";
import {Root} from "../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../redux/reducers/tableRows";
import {getIndexedCells} from "../../../redux/selectors/tableRows";

const styles = makeStyles((theme:Theme)=>createStyles({
  tableHead:{
    display:'block'
  },
  tableRow:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'flex-start'
  },
  tableCell:{
    display:'block'
  }
}));

const Header = function(props) {

  const classes = styles();

  const cellFormats = 
    useSelector<Root,CellFormat[]>((state) => getIndexedCells(state, ROW_ID));

  const cells = useMemo(()=>{

    const cells:JSX.Element[] = [];

    for(const {name, width} of cellFormats) {

      cells.push(<Box display="block">
        <TableCell
          style={{minWidth:width}}
          component='div'
          children={name}
        />
      </Box>);

    }

    return cells;

  },[cellFormats]);

  return <TableHead className={classes.tableHead} component='div'>
    <TableRow className={classes.tableRow} component='div'>
      {cells}
      {/* <Box minWidth={185} clone>
        <Grid item xs={1}>
          <TableCell className={classes.tableCell} component='div'>Date</TableCell>
        </Grid>
      </Box>
      <Grid item xs={3}>
        <TableCell className={classes.tableCell} component='div'>Department</TableCell>
      </Grid>
      <Grid item xs={2}>
        <TableCell className={classes.tableCell} component='div'>Type</TableCell>
      </Grid>
      <Grid item xs={3}>
        <TableCell className={classes.tableCell} component='div'>Source</TableCell>
      </Grid>
      <Grid item xs={2}>
        <TableCell className={classes.tableCell} component='div'>Payment Method</TableCell>
      </Grid>
      <Grid item xs={1}>
        <TableCell className={classes.tableCell} component='div'>Total</TableCell>
      </Grid> */}
    </TableRow>
  </TableHead>;

}

export default Header;