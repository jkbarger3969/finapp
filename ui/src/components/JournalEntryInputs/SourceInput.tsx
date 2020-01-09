import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import { makeStyles, createStyles, Theme } from "@material-ui/core";

import { JournalEntrySourceType} from '../../apollo/graphTypes';
import useJournalEntryUpsert from "./useJournalEntryUpsert";
import SourceTypeToggle from "./SourceInput/SourceTypeToggle";
import BusinessSrc from "./SourceInput/BusinessSrc";
import PersonSrc from "./SourceInput/PersonSrc";

const styles = makeStyles((theme:Theme) => createStyles({
  sourceInput:{
    flexGrow:1
  },
}));

export interface SourceInputProps {
  entryUpsertId: string;
  autoFocus?:boolean;
  variant?:"filled" | "outlined";
}

const SourceInput = function(props:SourceInputProps) {

  const classes = styles();
  
  const {entryUpsertId, autoFocus = false, variant = "filled"} = props;
  
  const {loading, error, upsert} = useJournalEntryUpsert(entryUpsertId);
    
  if(loading) {
    // Same stand in for BizPersonToggle
    return <Skeleton variant="rect" height={56} width={81}/>;
  } else if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  } else if(upsert === null) {
    return null;
  }

  const srcType = upsert?.inputValues?.srcType;

  return <Box display="flex" flexWrap="nowrap" alignItems="center">
    <Grid item >
      <SourceTypeToggle entryUpsertId={entryUpsertId}/>
    </Grid>
    <Grid item className={classes.sourceInput}>{(()=>{
      if(!srcType) {
        return null;//<Skeleton variant="rect" height={56}/>;;
      } else if(srcType === JournalEntrySourceType.Business) {
        return <BusinessSrc 
          entryUpsertId={entryUpsertId}
          autoFocus={autoFocus}
          variant={variant}
        />;
      }
      return <PersonSrc
        entryUpsertId={entryUpsertId}
        autoFocus={autoFocus}
        variant={variant}
      />;
    })()}</Grid>
  </Box>;

}

export default SourceInput;