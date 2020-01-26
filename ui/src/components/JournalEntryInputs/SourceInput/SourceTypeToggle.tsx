import React, { useCallback } from "react";
import {useSelector, useDispatch, shallowEqual} from "react-redux";
import Box from "@material-ui/core/Box";
import ToggleButton, {ToggleButtonProps} from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup, {ToggleButtonGroupProps
} from "@material-ui/lab/ToggleButtonGroup";
import {Person as PersonIcon, Business as BusinessIcon
} from "@material-ui/icons";
import { makeStyles, createStyles, Theme } from "@material-ui/core";

import {JournalEntrySourceType} from '../../../apollo/graphTypes';
import {Root} from "../../../redux/reducers/root";
import {setSrcType} from "../../../redux/actions/journalEntryUpsert";
import {getSrcType, getSrcInput, getSrc, getSrcError, getType
} from "../../../redux/selectors/journalEntryUpsert";

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

const bizToggleButtonProps:ToggleButtonProps = {
  value:JournalEntrySourceType.Business
};

const personToggleButtonProps:ToggleButtonProps = {
  value:JournalEntrySourceType.Person
};

export interface SourceTypeToggleProps {
  entryUpsertId: string;
}

interface SelectorResult {
  disabled:boolean;
  value:JournalEntrySourceType | null;
  srcInput:string;
  isSrcSet:boolean;
  hasError:boolean;
} 

const SourceTypeToggle = function(props:SourceTypeToggleProps) {
  
  const {entryUpsertId} = props;

  const classes = styles();

  const {disabled, value, srcInput, isSrcSet, hasError} = 
    useSelector<Root, SelectorResult>((state) => 
      ({
        disabled:getType(state, entryUpsertId) === null,
        value:getSrcType(state, entryUpsertId),
        srcInput:getSrcInput(state, entryUpsertId),
        isSrcSet:!!getSrc(state, entryUpsertId),
        hasError:!!getSrcError(state, entryUpsertId)
      }), shallowEqual);

  const dispatch = useDispatch();

  const color = hasError ? "error" : undefined;

  const onChange = useCallback((event, newSrcType:JournalEntrySourceType) => {
    dispatch(setSrcType(entryUpsertId, newSrcType));
  },[dispatch, entryUpsertId]);

  if(isSrcSet || srcInput) {
    if(value === JournalEntrySourceType.Person) {
      return <PersonIcon className={classes.sourceIcon} color={color} />;
    } else {
      return <BusinessIcon className={classes.sourceIcon} color={color} />;
    }
  }

  const toggleButtonGroupProps:ToggleButtonGroupProps = {
    className:classes.sourceToggle,
    size:"small",
    exclusive:true,
    onChange,
    value
  };

  return <Box py={1} clone>
    <ToggleButtonGroup {...toggleButtonGroupProps}>
      <ToggleButton disabled={disabled} {...bizToggleButtonProps}>
        <BusinessIcon color={color} />
      </ToggleButton>
      <ToggleButton disabled={disabled} {...personToggleButtonProps}>
        <PersonIcon color={color} />
      </ToggleButton>
    </ToggleButtonGroup>
  </Box>;

}

export default SourceTypeToggle;