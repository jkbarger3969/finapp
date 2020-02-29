import React, { useCallback, useMemo } from "react";
import Checkbox, { CheckboxProps } from "@material-ui/core/Checkbox";

import { Root } from "../../redux/reducers/root";
import { useDebounceDispatch } from "../../redux/hooks";
import {
  setReconciledValue,
  clearReconciledValue
} from "../../redux/actions/journalEntryUpsert";
import {
  getReconciledValue,
  getType
} from "../../redux/selectors/journalEntryUpsert";
import { useSelector } from "react-redux";

interface SelectorResult {
  checked: boolean;
  disabled: boolean;
}

export interface DescriptionInputProps {
  entryUpsertId: string;
  autoFocus?: boolean;
}

const DescriptionInput = function(props: DescriptionInputProps) {
  const { entryUpsertId, autoFocus = false } = props;

  const dispatch = useDebounceDispatch();

  const { checked, disabled } = useSelector<Root, SelectorResult>(state => ({
    checked: getReconciledValue(state, entryUpsertId),
    disabled: getType(state, entryUpsertId) === null
  }));

  const onChange = useCallback(
    event => {
      const value = event.target.checked;
      if (value) {
        dispatch(setReconciledValue(entryUpsertId, value));
      } else {
        dispatch(clearReconciledValue(entryUpsertId));
      }
    },
    [dispatch, entryUpsertId]
  );

  const checkboxProps: CheckboxProps = {
    disabled,
    checked,
    required: false,
    name: "reconciled",
    onChange,
    inputProps: useMemo(
      () => ({
        type: "checkbox",
        autoFocus
      }),
      [autoFocus]
    )
  };

  return <Checkbox {...checkboxProps} />;
};

export default DescriptionInput;
