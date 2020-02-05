import React, { useCallback } from "react";
import {useSelector} from "react-redux";
import {useApolloClient, useMutation} from "@apollo/react-hooks";
import {Add, Cancel, Delete} from "@material-ui/icons/";
import { useTheme } from '@material-ui/core/styles';
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import gql from "graphql-tag";


import DateInput from "../../JournalEntryInputs/DateInput";
import TotalInput from "../../JournalEntryInputs/TotalInput";
import DepartmentInput from "../../JournalEntryInputs/DepartmentInput";
import CategoryInput from "../../JournalEntryInputs/CategoryInput";
import SourceInput from "../../JournalEntryInputs/SourceInput";
import PaymentMethodInput from "../../JournalEntryInputs/PaymentMethodInput";
import DescriptionInput from "../../JournalEntryInputs/DescriptionInput";
import ReconciledInput from "../../JournalEntryInputs/ReconciledInput";
import TypeToggle from "../../JournalEntryInputs/TypeToggle";
import {Root} from "../../../redux/reducers/root";
import {getUpsertType, UpsertType, getType, getUpdateId
} from "../../../redux/selectors/journalEntryUpsert";
import {useDebounceDispatch as useDispatch} from "../../../redux/hooks";
import {cancel, submit, setSubmitStatus, clear
} from "../../../redux/actions/journalEntryUpsert";
import {SubmitStatus} from "../../../redux/reducers/journalEntryUpserts";

interface SelectorResult {
  open:boolean;
  typeIsSet:boolean;
}

export interface UpdateEntryProps {
  entryUpsertId:string;
  fromDept?:string;
}

const DELETE_ENTRY = gql`
  mutation DeleteEntry_1($id:ID!) {
    journalEntryDelete(id:$id) {
      __typename
      id
      deleted
    }
  }
`;

const UpdateEntry = function(props:UpdateEntryProps) {

  const {entryUpsertId, fromDept} = props;

  const theme = useTheme();

  const client = useApolloClient();

  const dispatch = useDispatch();

  const entryId = useSelector((state:Root)=>getUpdateId(state, entryUpsertId));

  const [deleteEntry] = useMutation(DELETE_ENTRY);

  const onClickCancel = useCallback((event?) => {
    dispatch(cancel(entryUpsertId));
  },[dispatch, entryUpsertId]);

  const onClickUpdate = useCallback((event?) => {
    dispatch(submit(entryUpsertId, client));
  },[dispatch, entryUpsertId, client]);

  const onClickDelete = useCallback((event?) => {

    deleteEntry({variables:{id:entryId}}).then(() => {
      dispatch(setSubmitStatus(entryUpsertId, SubmitStatus.Submitted));
      dispatch(clear(entryUpsertId));
    }).catch((error) => {
      dispatch(setSubmitStatus(entryUpsertId, SubmitStatus.NotSubmitted));
    });

    dispatch(setSubmitStatus(entryUpsertId, SubmitStatus.Submitting));

  },[deleteEntry, entryId, dispatch, entryUpsertId]);


  const {open, typeIsSet} = useSelector<Root, SelectorResult>((state) => ({
    open:getUpsertType(state, entryUpsertId) === UpsertType.Update,
    typeIsSet:getType(state, entryUpsertId) !== null
  }));

  return <Dialog maxWidth="lg" open={open}>
    <form>
      <DialogTitle>Update Entry</DialogTitle>
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
        <Box width="100%" display="flex" justifyContent="space-between">
            <Button
              size="medium"
              color="default"
              variant="outlined"
              startIcon={<Delete />}
              onClick={onClickDelete}
            >Delete</Button>
          <div>
            <Button
              disabled={!typeIsSet}
              size="medium"
              color="secondary"
              variant="outlined"
              startIcon={<Add />}
              onClick={onClickUpdate}
            >Update</Button>
            <Box ml={`${theme.spacing(1)}px !important`} clone>
              <Button
                size="medium"
                color="default"
                variant="outlined"
                startIcon={<Cancel />}
                onClick={onClickCancel}
              >Cancel</Button>
            </Box>
          </div>
        </Box>
      </DialogActions>
    </form>
  </Dialog>

}

export default UpdateEntry;