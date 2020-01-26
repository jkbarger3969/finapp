import React, {useCallback} from "react";
import {useSelector, useDispatch} from "react-redux";
import TableRow from "@material-ui/core/TableRow";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import { TableCell } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles";
import {red, green} from "@material-ui/core/colors"

import {randUUID} from "../../../utils/uuid";
import TransactionDate from "./Cells/TransactionDate";
import Department from "./Cells/Department";
// import Type from "./Cells/Type";
import Category from "./Cells/Category";
import Source from "./Cells/Source";
import PaymentMethod from "./Cells/PaymentMethod";
import Description from "./Cells/Description";
import Total from "./Cells/Total";
import Reconciled from "./Cells/Reconciled";
import {JournalEntryType} from "../../../apollo/graphTypes"


const styles = makeStyles((theme:Theme)=>createStyles({
  positive:{
    color:green[900]
  },
  negative:{
    color:red[900]
  }
}));

type JournalEntryFragment = any;

export interface EntryProps {
  journalEntry?:JournalEntryFragment | null;
  style:React.CSSProperties
}

export const EntrySkeleton = function() {

  const skeleton = <Skeleton variant="rect" height={48} />;

  return <TableRow key={randUUID()}>
    <TableCell children={skeleton} />
    <TableCell children={skeleton} />
    <TableCell children={skeleton} />
    <TableCell children={skeleton} />
    <TableCell children={skeleton} />
    <TableCell children={skeleton} />
  </TableRow>;

}

const Entry = function(props:EntryProps) {

  const classes = styles();

  // const 
  
  const {journalEntry = null, style} = props;

  const onDoubleClick = useCallback((event) => {
    if(journalEntry) {
      console.log(journalEntry.id);
    }
  },[journalEntry]);

  if(journalEntry === null) {
    
    const skeleton = <Skeleton variant="rect" height={20} />;
    
    return <Box style={style} display="flex !important" clone>
      <TableRow component="div">
        <Grid item container direction="column" xs={1} >
          <TableCell component="div" children={skeleton} />
        </Grid>
        <Grid item container direction="column" xs={3} >
          <TableCell component="div" children={skeleton} />
        </Grid>
        <Grid item container direction="column" xs={2} >
          <TableCell component="div" children={skeleton} />
        </Grid>
        <Grid item container direction="column" xs={3} >
          <TableCell component="div" children={skeleton} />
        </Grid>
        <Grid item container direction="column" xs={2} >
          <TableCell component="div" children={skeleton} />
        </Grid>
        <Grid item container direction="column" xs={1} >
          <TableCell component="div" children={skeleton} />
        </Grid>
      </TableRow>
    </Box>; 
  
  }

  const textColor = 
    journalEntry.category.type === JournalEntryType.Credit ?
      classes.positive : classes.negative;

  return <Box style={style} display="flex !important" clone>
    <TableRow onDoubleClick={onDoubleClick} component="div" hover>
      <TransactionDate
        textColor={textColor}
        entryDate={journalEntry.date}
      />
      <Department textColor={textColor} department={journalEntry.department} />
      <Category textColor={textColor} category={journalEntry.category}/>
      <Source textColor={textColor} source={journalEntry.source}/>
      <PaymentMethod 
        textColor={textColor}
        paymentMethod={journalEntry.paymentMethod}
      />
      <Description
        textColor={textColor}
        description={journalEntry.description}
      />
      <Total textColor={textColor} total={journalEntry.total} />
      <Reconciled textColor={textColor} reconciled={journalEntry.reconciled}/>
    </TableRow>
  </Box>;

}

export default Entry;