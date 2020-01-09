import React, { MouseEvent } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import ToggleButton, {ToggleButtonProps} from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup, {ToggleButtonGroupProps
} from "@material-ui/lab/ToggleButtonGroup";
import {Person as PersonIcon, Business as BusinessIcon
} from "@material-ui/icons";
import { makeStyles, createStyles, Theme } from "@material-ui/core";

import useJournalEntryUpsert from "../useJournalEntryUpsert";
import {JournalEntrySourceType} from '../../../apollo/graphTypes';

  const styles = makeStyles((theme:Theme) => createStyles({
  sourceToggle:{
    marginRight:theme.spacing(1)
  },
  sourceInput:{
    flexGrow:1
  },
  sourceIcon:{
    marginRight:theme.spacing(1),
    marginLeft:theme.spacing(1),
  }
}));

export interface SourceTypeToggleProps {
  entryUpsertId: string;
}

const SourceTypeToggle = function(props:SourceTypeToggleProps) {
  
  const {entryUpsertId} = props;

  const classes = styles();

  const {loading, error, upsert, update} 
    = useJournalEntryUpsert(entryUpsertId);

  if(loading){
    return <Skeleton variant="rect" height={56} width={81}/>;
  } else if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

  const srcInput = upsert?.inputValues?.srcInput || null;
  const srcType = upsert?.inputValues?.srcType || null;
  const source = upsert?.fields?.source || [];

  if(srcType === JournalEntrySourceType.Business) {
    if((source && source.length > 0 ) || srcInput) {
      return <BusinessIcon className={classes.sourceIcon} />;
    }
  } else if(srcType === JournalEntrySourceType.Person){
    if((source && source.length > 0) || srcInput) {
      return <PersonIcon className={classes.sourceIcon} />;
    }
  }

  const bizToggleButtonProps:ToggleButtonProps = {
    value:JournalEntrySourceType.Business || ""
  };
  
  const personToggleButtonProps:ToggleButtonProps = {
    value:JournalEntrySourceType.Person || ""
  };
  
  const toggleButtonGroupProps:ToggleButtonGroupProps = {
    className:classes.sourceToggle,
    size:"small",
    exclusive:true,
    onChange:(event:MouseEvent<HTMLElement>, 
      value:JournalEntrySourceType | null) => 
    {
      value = value ? value : null;
      update.inputValues.srcType(value); 
    },
    value:srcType || "NONE"
  };

  return <Box py={1} clone>
    <ToggleButtonGroup {...toggleButtonGroupProps}>
      <ToggleButton {...bizToggleButtonProps}>
        <BusinessIcon />
      </ToggleButton>
      <ToggleButton {...personToggleButtonProps}>
        <PersonIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  </Box>;

}

export default SourceTypeToggle;