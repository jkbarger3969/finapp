import React from "react";
import TableRow from "@material-ui/core/TableRow";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import { TableCell } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles";
import {red, green} from "@material-ui/core/colors"

import {randUUID} from "../../../utils/uuid";
// import {JournalEntry_1Fragment as JournalEntryFragment
// } from "../../../apollo/graphTypes";
import TransactionDate from "./Cells/TransactionDate";
import Department from "./Cells/Department";
import Type from "./Cells/Type";
import Source from "./Cells/Source";
import PaymentMethod from "./Cells/PaymentMethod";
import Total from "./Cells/Total";

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

  const {journalEntry = null, style} = props;

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

  let textColor:string = '';
  const {ancestors} = journalEntry.type;
  switch(ancestors.length === 0 ? 
    journalEntry.type.type : ancestors[ancestors.length - 1].type) 
  {
    case "income":
    case "reimbursement":
      textColor = classes.positive;
      break;
    case "expense":
    case "refund":
      textColor = classes.negative;
      break;
  }

  return <Box style={style} display="flex !important" clone>
    <TableRow component="div">
      <Box minWidth={185} clone>
        <Grid item container direction="column" xs={1} >
          <TransactionDate
            textColor={textColor}
            entryDate={journalEntry.date}
          />
        </Grid>
      </Box>
      <Grid item container direction="column" xs={3} >
        <Department textColor={textColor} department={journalEntry.department} />
      </Grid>
      <Grid item container direction="column" xs={2} >
        <Type textColor={textColor} type={journalEntry.type}/>
      </Grid>
      <Grid item container direction="column" xs={3} >
        <Source textColor={textColor} source={journalEntry.source}/>
      </Grid>
      <Grid item container direction="column" xs={2} >
        <PaymentMethod 
          textColor={textColor}
          paymentMethod={journalEntry.paymentMethod}
        />
      </Grid>
      <Grid item container direction="column" xs={1} >
        <Total textColor={textColor} total={journalEntry.total} />
      </Grid>
    </TableRow>
  </Box>;

}

export default Entry;