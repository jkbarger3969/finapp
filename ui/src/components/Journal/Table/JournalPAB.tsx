import React, { ReactElement } from "react";
import {useDispatch} from "react-redux";
import {useMutation} from "@apollo/react-hooks";
import Fab from "@material-ui/core/Fab";
import Tooltip from "@material-ui/core/Tooltip";
import {Add, Error, Cancel} from "@material-ui/icons/";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Skeleton from "@material-ui/lab/Skeleton";
import CircularProgress from '@material-ui/core/CircularProgress';
// import Box from "@material-ui/core/Box";

import {Lc_JournalEntryUpsertSubmitStatus as SubmitStatus
} from "../../../apollo/graphTypes";
import useJournalEntryUpsert 
  from "../../JournalEntryInputs/useJournalEntryUpsert";
import {create as createR, cancel as cancelR
} from "../../../redux/actions/journalEntryUpsert";

const styles = makeStyles((theme)=> {
  return createStyles({
    fab: {
      position: 'fixed',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    }
  });
});

export interface JournalPABProps {
  entryUpsertId: string;
}

const JournalPAB = function(props) {

  const {entryUpsertId} = props;

  const classes = styles();

  const dispatch = useDispatch();

  const {loading, error, cancel, create, upsert} 
    = useJournalEntryUpsert(entryUpsertId);
  
  let icon:ReactElement;
  let tip:string;
  let disabled:boolean = loading;
  let onClick:typeof cancel | typeof create | any = () => {};

  if(loading) {
   
    return <Skeleton
      className={`${classes.fab}`}
      width={56}
      height={56}
      variant="circle"
    />;
  
  } else if(error) {
  
    icon = <Error />;
    tip = error.message;
    console.error(error.message);
    disabled = true;
  
  } else {

    // const isUpdate = !!(upsert?.fields?.id);

    switch(upsert?.submitStatus || null) {
      case null:
        tip = "New"
        icon = <Add />;
        onClick = () => { create(); dispatch(createR(entryUpsertId)); };
        break;
      case SubmitStatus.NotSubmitted:
        tip = "Cancel";
        icon = <Cancel />;
        onClick = () => { cancel(); dispatch(cancelR(entryUpsertId)); };
        break;
      case SubmitStatus.Submitting:
        tip = "Submitting";
        icon = <CircularProgress />;
        disabled = true;
        break;
      default:
        icon = <Error />;
        tip = "Something went wrong.";
    }

  } 

  return <Tooltip title={tip} placement="top">
    <Fab 
      size="large"
      color="secondary"
      aria-label="add transaction"
      className={classes.fab}
      disabled={disabled}
      children={icon}
      onClick={onClick}
    />
  </Tooltip>;

}

export default JournalPAB;