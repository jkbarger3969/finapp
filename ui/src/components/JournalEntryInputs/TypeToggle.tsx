import React, {useCallback} from "react";
import {useApolloClient} from "@apollo/react-hooks";
import {useSelector} from "react-redux";
import Box from "@material-ui/core/Box";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ToggleButton, {ToggleButtonProps} from "@material-ui/lab/ToggleButton";
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButtonGroup, {ToggleButtonGroupProps
} from "@material-ui/lab/ToggleButtonGroup";
import { BankPlus, BankMinus } from 'mdi-material-ui'

import {BusinessSrcOptsInput_1Query as BusinessSrcOptsInputQuery,
  BusinessSrcOptsInput_1QueryVariables as BusinessSrcOptsInputQueryVariables,
  BusinessSrcBizOpts_1Fragment as BusinessSrcBizOptsFragment,
  BusinessSrcDeptOpts_1Fragment as BusinessSrcDeptOptsFragment,
  JournalEntrySourceType, JournalEntrySourceInput,
  JournalEntryType
} from "../../apollo/graphTypes";
import {Root} from "../../redux/reducers/root";
import {useDebounceDispatch as useDispatch} from "../../redux/hooks";
import {setSrcInput, clearSrcInput, clearSrcValue, setSrcOpen, setSrcValue,
  validateSrc, setType
} from "../../redux/actions/journalEntryUpsert";
import {getSrc, isSrcOpen, getSrcChain, getSrcError,
  getType, getTypeError
} from "../../redux/selectors/journalEntryUpsert";

const creditToggleButtonProps:ToggleButtonProps = {
  value:JournalEntryType.Credit
};

const debitToggleButtonProps:ToggleButtonProps = {
  value:JournalEntryType.Debit
};

interface SelectorResult {
  value:JournalEntryType | null;
  typeError:Error | null;
  hasError:boolean;
}

export interface TypeToggleProps {
  entryUpsertId: string;
}

const TypeToggle = (props:TypeToggleProps) => {

  const {entryUpsertId} = props;

  const client = useApolloClient();

  const {value, typeError, hasError} =
    useSelector<Root, SelectorResult>((state) => {

      const typeError = getTypeError(state, entryUpsertId);

      return {
        value:getType(state, entryUpsertId),
        typeError,
        hasError:!!typeError
      };
    
    });

  const dispatch = useDispatch();

  const onChange = useCallback((event, newType:JournalEntryType) => {
    dispatch(setType(entryUpsertId, newType, client));
  },[dispatch, entryUpsertId, client]);

  const color = hasError ? "error" : (value === null ? "secondary" : undefined);

  const toggleButtonGroupProps:ToggleButtonGroupProps = {
    size:"small",
    exclusive:true,
    onChange,
    value
  };

  const control = <Box pl={1} clone>
    <ToggleButtonGroup {...toggleButtonGroupProps}>
      <Tooltip arrow placement="top" title="Credit">
        <ToggleButton
          selected={value === JournalEntryType.Credit}
          {...creditToggleButtonProps}
        >
          <BankPlus color={color} />
        </ToggleButton>
      </Tooltip>
      <Tooltip arrow placement="top" title="Debit">
        <ToggleButton
          selected={value === JournalEntryType.Debit}
          {...debitToggleButtonProps}
        >
          <BankMinus color={color} />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  </Box>;

  return <FormControlLabel
    color={value === null ? "secondary" : "default"}
    labelPlacement="start"
    control={control}
    label="Type"
  />;

}

export default TypeToggle;