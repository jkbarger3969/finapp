import React, { useCallback } from 'react';
import {useSelector} from "react-redux";
import {useApolloClient} from "@apollo/react-hooks";
import {Add, Queue, Cancel} from "@material-ui/icons/";
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';


import DateInput from '../JournalEntryInputs/DateInput';
import TotalInput from '../JournalEntryInputs/TotalInput';
import DepartmentInput from '../JournalEntryInputs/DepartmentInput';
import TypeInput from '../JournalEntryInputs/TypeInput';
import SourceInput from '../JournalEntryInputs/SourceInput';
import PaymentMethodInput from '../JournalEntryInputs/PaymentMethodInput';
import DescriptionInput from '../JournalEntryInputs/DescriptionInput';
import ReconciledInput from '../JournalEntryInputs/ReconciledInput';
import {Root} from "../../redux/reducers/root";
import {getUpsertType, UpsertType
} from "../../redux/selectors/journalEntryUpsert";
import {useDebounceDispatch as useDispatch} from "../../redux/hooks";
import {cancel, submit} from "../../redux/actions/journalEntryUpsert";

export interface AddEntryProps {
  entryUpsertId: string;
}

const AddEntry = function(props:AddEntryProps) {

  const {entryUpsertId} = props;

  const client = useApolloClient();

  const dispatch = useDispatch();

  const onClickCancel = useCallback((event?) => {
    dispatch(cancel(entryUpsertId));
  },[dispatch, entryUpsertId]);

  const onClickSubmit = useCallback((event?) => {
    dispatch(submit(entryUpsertId, client));
  },[dispatch, entryUpsertId, client]);

  // const onClickSubmitAndNew = useCallback((event?) => {
  //   onClickSubmit();

  // },[dispatch, entryUpsertId, onClickSubmit]);

  const open = useSelector<Root, boolean>((state) =>
    getUpsertType(state, entryUpsertId) === UpsertType.Add);

  return <Dialog maxWidth="lg" open={open}>
    <form>
      <DialogTitle>Add Entry</DialogTitle>
        <Box
          justifyContent="center"
          display="flex"
          flexWrap="wrap"
          clone
        >
          <DialogContent dividers>
            <Box padding={2} minWidth={150}>
              <DateInput autoFocus entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={380}>
              <DepartmentInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={175}>
              <TypeInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={380}>
              <SourceInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={400}>
              <DescriptionInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={175}>
              <PaymentMethodInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={150}>
              <TotalInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2}  minWidth={120}>
              <FormControlLabel
                control={<ReconciledInput entryUpsertId={entryUpsertId} />}
                label="Reconcile"
              />                
            </Box>
          </DialogContent>
        </Box>
      <DialogActions>
        <Tooltip placement="top" title="Submit">
          <Button
            size="medium"
            color="secondary"
            variant="outlined"
            startIcon={<Add />}
            onClick={onClickSubmit}
          >Submit</Button>
        </Tooltip>
        <Tooltip placement="top" title="Submit and New">
          <Button
            size="medium"
            color="secondary"
            variant="outlined"
            startIcon={<Queue />}
          >Submit/New</Button>
        </Tooltip>
        <Tooltip placement="top" title="Cancel">
          <Button
            size="medium"
            color="default"
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onClickCancel}
          >Cancel</Button>
        </Tooltip>
      </DialogActions>
    </form>
  </Dialog>

}

export default AddEntry;