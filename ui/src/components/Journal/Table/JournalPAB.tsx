import React, { ReactElement, useMemo, useCallback } from "react";
import {useSelector} from "react-redux";
import {useApolloClient} from "@apollo/react-hooks";
import Fab from "@material-ui/core/Fab";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import {Add, ExpandLess, Cancel, Publish} from "@material-ui/icons/";
import { useTheme } from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';
import SpeedDial, { SpeedDialProps } from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import store from "../../../redux/store";
import {createPAB, openPAB, closePAB} from "../../../redux/actions/journal";
import {Root} from "../../../redux/reducers/root";
import {create, cancel, submit
} from "../../../redux/actions/journalEntryUpsert";
import {getUpsertType, getSubmitStatus, UpsertType
} from "../../../redux/selectors/journalEntryUpsert";
import {isPABOpen} from "../../../redux/selectors/journal";
import {SubmitStatus
} from "../../../redux/reducers/journalEntryUpserts";
import {uuid, namespace} from "../../../utils/uuid";
import {useDebounceDispatch as useDispatch} from "../../../redux/hooks";

// Create PAB state
const JOURNAL_PAB_ID = uuid("Journal_PAB", namespace);
store.dispatch(createPAB(JOURNAL_PAB_ID));

interface SelectorResult {
  upsertType:UpsertType | null;
  submitStatus:SubmitStatus | null;
  isOpen:boolean;
}

export interface JournalPABProps {
  entryUpsertId: string;
}

const JournalPAB = function(props) {

  const {entryUpsertId} = props;

  const client = useApolloClient();

  const theme = useTheme();

  const dispatch = useDispatch();

  const onOpen = 
    useCallback((event?) => dispatch(openPAB(JOURNAL_PAB_ID)),[dispatch]);

  const onClose = 
    useCallback((event?) => dispatch(closePAB(JOURNAL_PAB_ID)),[dispatch]);
    
  const {upsertType, submitStatus, isOpen
  } = useSelector<Root, SelectorResult>((state) => ({
    upsertType:getUpsertType(state, entryUpsertId),
    submitStatus:getSubmitStatus(state, entryUpsertId),
    isOpen:isPABOpen(state, JOURNAL_PAB_ID)
  }));

  if(submitStatus === SubmitStatus.Submitting) {
    
    return <Box
      position="fixed !important"
      bottom={theme.spacing(2)}
      right={theme.spacing(2)}
      clone
    >
      <Fab
        disabled={true}
        size="large"
        color="secondary"
        aria-label="submitting"
        children={<CircularProgress color="secondary" />}
      />
    </Box>;
  
  } else if(submitStatus === SubmitStatus.NotSubmitted && upsertType !== null) {

    const isAdd = upsertType === UpsertType.Add;
    // return <Tooltip title={isAdd ? "Submit" : "Update"} placement="left">
      return <Box
        position="fixed !important"
        bottom={theme.spacing(2)}
        right={theme.spacing(2)}
        clone
      >
        <SpeedDial
          ariaLabel={`cancel or ${isAdd ? "submit" : "update"}`}
          FabProps={{
            size:"large",
            color:"secondary",
          }}
          icon={isOpen ? <Publish /> : <ExpandLess />}
          onOpen={onOpen}
          onClose={onClose}
          open={isOpen}
          onClick={(event) => 
            isOpen ? dispatch(submit(entryUpsertId, client)) : onOpen()}
        >
          <SpeedDialAction
            icon={<Cancel />}
            tooltipTitle="Cancel"
            onClick={()=> {
              onClose();
              dispatch(cancel(entryUpsertId));
            }}
          />
        </SpeedDial>
      </Box>;
    {/* </Tooltip>; */}

    /* return <Tooltip title={isAdd ? "Submit" : "Update"} placement="top">
      <Box
        position="fixed !important"
        bottom={theme.spacing(2)}
        right={theme.spacing(2)}
        clone
      >
        <Fab 
          size="large"
          color="secondary"
          aria-label={isAdd ? "submit" : "update"}
          children={<Publish />}
          onClick={() => dispatch(submit(entryUpsertId, client)) }
        />
      </Box>
    </Tooltip>; */

  }  else {
    
    // return <Tooltip title="New" placement="top">
      return <Box
        position="fixed !important"
        bottom={theme.spacing(2)}
        right={theme.spacing(2)}
        clone
      >
        <Fab 
          size="large"
          color="secondary"
          aria-label="add entry"
          children={<Add />}
          onClick={() => dispatch(create(entryUpsertId)) }
        />
      </Box>;
    // </Tooltip>;
  
  }

}

export default JournalPAB;