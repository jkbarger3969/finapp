import React, {useCallback, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {useMutation} from "@apollo/react-hooks";
import TableCell from "@material-ui/core/TableCell";
import Box from "@material-ui/core/Box";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DoneIcon from '@material-ui/icons/Done';
import Checkbox, {CheckboxProps} from '@material-ui/core/Checkbox';
import gql from "graphql-tag";

import {JournalEntry_1Fragment as JournalEntryFragment
} from "../../../../apollo/graphTypes";
import {ROW_ID, RECONCILED_ID} from "./cellsReduxIni";
import {Root} from "../../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../../redux/reducers/tableRows";
import {getCell} from "../../../../redux/selectors/tableRows";
import {JournalMode} from "../Body";
import {JOURNAL_ENTRY_FRAGMENT} from "../JournalEntries.gql";


const RECONCILE = gql`
  mutation Reconcile_1($id:ID!) {
    journalEntryUpdate(id: $id, fields:{reconciled:true}) {
      ...JournalEntry_1Fragment
    }
  }
  ${JOURNAL_ENTRY_FRAGMENT}
`;

export interface ReconciledProps {
  reconciled:JournalEntryFragment["reconciled"];
  entryId:string;
  textColor:string;
  mode:JournalMode;
  removeReconciled:(id:string)=>void;
}

const Reconciled = function(props:ReconciledProps) {

  const {reconciled, textColor, mode, entryId, removeReconciled} = props;

  const [checked, setChecked] = useState(false);

  const [mutate] =  useMutation(RECONCILE);

  const cellFormat = useSelector<Root, CellFormat>((state)=> 
    getCell(state, ROW_ID, RECONCILED_ID) as CellFormat);


  const onChange = useCallback(async (event?)=>{
    if(checked) {
      return;
    }
    setChecked(true);
    try{
      await mutate({variables:{id:entryId}});
      removeReconciled(entryId);
    } catch(error) {
      setChecked(false);
    }

  }, [setChecked, mutate, entryId, removeReconciled, checked]);


  const checkboxProps:CheckboxProps = {
    checked,
    name:"reconciled",
    onChange,
    inputProps:useMemo(() => ({
      type:"checkbox",
    }),[]),
  }
  
  return <Box
    className={textColor}
    textOverflow="ellipsis"
    whiteSpace="nowrap"
    overflow="hidden"
    // width="100%"
    minWidth={cellFormat.width}
    flexBasis={cellFormat.width}
    flexGrow={cellFormat.width}
    order={cellFormat.index > -1 ? cellFormat.index : undefined}
    display="flex !important"
    justifyContent="center"
    alignItems="center"
    clone
  >
    <TableCell component="div">{(()=>{
      if(reconciled) {
        return  <DoneIcon />;
      } else if(mode === JournalMode.Reconcile) {
        return <Checkbox {...checkboxProps} />;
      }
      return null;
    })()}</TableCell>
  </Box>;

}

export default Reconciled;