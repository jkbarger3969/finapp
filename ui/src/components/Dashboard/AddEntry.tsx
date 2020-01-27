import React, { useCallback } from 'react';
import {useSelector} from "react-redux";
import {useApolloClient} from "@apollo/react-hooks";
import {Add, Queue, Cancel} from "@material-ui/icons/";
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';


import DateInput from '../JournalEntryInputs/DateInput';
import TotalInput from '../JournalEntryInputs/TotalInput';
import DepartmentInput from '../JournalEntryInputs/DepartmentInput';
import CategoryInput from '../JournalEntryInputs/CategoryInput';
import SourceInput from '../JournalEntryInputs/SourceInput';
import PaymentMethodInput from '../JournalEntryInputs/PaymentMethodInput';
import DescriptionInput from '../JournalEntryInputs/DescriptionInput';
import ReconciledInput from '../JournalEntryInputs/ReconciledInput';
import TypeToggle from '../JournalEntryInputs/TypeToggle';
import {Root} from "../../redux/reducers/root";
import {getUpsertType, UpsertType, getType
} from "../../redux/selectors/journalEntryUpsert";
import {useDebounceDispatch as useDispatch} from "../../redux/hooks";
import {cancel, submit} from "../../redux/actions/journalEntryUpsert";
import {JournalEntryType} from "../../apollo/graphTypes";

interface SelectorResult {
  open:boolean;
  typeIsSet:boolean;
}

export interface AddEntryProps {
  entryUpsertId:string;
  fromDept?:string;
}

const AddEntry = function(props:AddEntryProps) {

  const {entryUpsertId, fromDept} = props;

  const client = useApolloClient();

  const dispatch = useDispatch();

  const onClickCancel = useCallback((event?) => {
    dispatch(cancel(entryUpsertId));
  },[dispatch, entryUpsertId]);

  const onClickSubmit = useCallback((event?) => {
    dispatch(submit(entryUpsertId, client));
  },[dispatch, entryUpsertId, client]);


  const {open, typeIsSet} = useSelector<Root, SelectorResult>((state) => ({
    open:getUpsertType(state, entryUpsertId) === UpsertType.Add,
    typeIsSet:getType(state, entryUpsertId) !== null
  }));

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
            <Box padding={2}>
              <TypeToggle entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={150}>
              <DateInput autoFocus entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={380}>
              <DepartmentInput entryUpsertId={entryUpsertId} />
            </Box>
            <Box padding={2} minWidth={380}>
              <CategoryInput entryUpsertId={entryUpsertId} />
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
        <Button
          disabled={!typeIsSet}
          size="medium"
          color="secondary"
          variant="outlined"
          startIcon={<Add />}
          onClick={onClickSubmit}
        >Submit</Button>
        <Button
          disabled={!typeIsSet}
          size="medium"
          color="secondary"
          variant="outlined"
          startIcon={<Queue />}
        >Submit/New</Button>
        <Button
          size="medium"
          color="default"
          variant="outlined"
          startIcon={<Cancel />}
          onClick={onClickCancel}
        >Cancel</Button>
      </DialogActions>
    </form>
  </Dialog>

}

export default AddEntry;