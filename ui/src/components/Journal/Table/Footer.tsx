import React from 'react';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';


import DateInput from '../../JournalEntryInputs/DateInput';
import TotalInput from '../../JournalEntryInputs/TotalInput';
import DepartmentInput from '../../JournalEntryInputs/DepartmentInput';
import TypeInput from '../../JournalEntryInputs/TypeInput';
import SourceInput from '../../JournalEntryInputs/SourceInput';
import PaymentMethodInput from '../../JournalEntryInputs/PaymentMethodInput';

import {} from '../../../apollo/graphTypes';
import useJournalEntryUpsert 
  from "../../JournalEntryInputs/useJournalEntryUpsert";

export interface FooterProps {
  entryUpsertId: string;
}

const Footer = function(props:FooterProps) {
  
  const {entryUpsertId} = props;

  const {upsert, error} = useJournalEntryUpsert(entryUpsertId);

  if(error) {
    return <Box width="100%" clone>
      <TableFooter component="div">
        <TableRow component="div">
          <TableCell component="div" colSpan={6}>{error.message}</TableCell>
        </TableRow>
      </TableFooter>
    </Box>;
  } if(!upsert || !!(upsert?.fields?.id)) {
    return null;
  }

  return <Box boxShadow={2} width="100%" pb={10} clone>
    <TableFooter component="div">
      <Box display="flex !important" clone>
        <TableRow component="div">
          <Box minWidth={185} clone>
            <Grid item container direction="column" xs={1}>
              <Box borderBottom="0px !important" pr="0px !important" clone>
                <TableCell component="div">
                  <DateInput entryUpsertId={entryUpsertId} autoFocus/>
                </TableCell>
              </Box>
            </Grid>
          </Box>
          <Grid item container direction="column" xs={3} >
            <Box borderBottom="0px !important" pr="0px !important" clone>
              <TableCell component="div">
                <DepartmentInput entryUpsertId={entryUpsertId} />
              </TableCell>
            </Box>
          </Grid>
          <Grid item container direction="column" xs={2} >
            <Box borderBottom="0px !important" pr="0px !important" clone>
              <TableCell component="div">
                <TypeInput entryUpsertId={entryUpsertId} />
              </TableCell>
            </Box>
          </Grid>
          <Grid item container direction="column" xs={3} >
            <Box borderBottom="0px !important" pr="0px !important" clone>
              <TableCell component="div">
                <SourceInput entryUpsertId={entryUpsertId} />
              </TableCell>
            </Box>
          </Grid>
          <Grid item container direction="column" xs={2} >
            <Box borderBottom="0px !important" pr="0px !important" clone>
              <TableCell component="div">
                <PaymentMethodInput entryUpsertId={entryUpsertId} />
              </TableCell>
            </Box>
          </Grid>
          <Grid item container direction="column" xs={1} >
            <Box borderBottom="0px !important" clone>
              <TableCell component="div">
                <TotalInput entryUpsertId={entryUpsertId} />
              </TableCell>
            </Box>
          </Grid>
        </TableRow>
      </Box>
    </TableFooter>
  </Box>;

}

export default Footer;