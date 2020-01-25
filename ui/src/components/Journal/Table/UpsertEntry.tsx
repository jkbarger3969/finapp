import React from 'react';
import {useSelector, shallowEqual} from "react-redux";
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Box from '@material-ui/core/Box';


import DateInput from '../../JournalEntryInputs/DateInput';
import TotalInput from '../../JournalEntryInputs/TotalInput';
import DepartmentInput from '../../JournalEntryInputs/DepartmentInput';
import CategoryInput from '../../JournalEntryInputs/CategoryInput';
import SourceInput from '../../JournalEntryInputs/SourceInput';
import PaymentMethodInput from '../../JournalEntryInputs/PaymentMethodInput';
import DescriptionInput from '../../JournalEntryInputs/DescriptionInput';
import ReconciledInput from '../../JournalEntryInputs/ReconciledInput';
import {ROW_ID, DATE_ID, DEPT_ID, CATEGORY_ID, SRC_ID, PAY_METHOD_ID, DSCRPT_ID,
  TOTAL_ID, RECONCILED_ID
} from "./Cells/cellsReduxIni";
import {Root} from "../../../redux/reducers/root";
import {TableCell as CellFormat} from "../../../redux/reducers/tableRows";
import {getCell} from "../../../redux/selectors/tableRows";

interface SelectorResult {
  date:CellFormat;
  dept:CellFormat;
  cat:CellFormat;
  src:CellFormat;
  payMethod:CellFormat;
  dscrpt:CellFormat;
  total:CellFormat;
  reconciled:CellFormat;
}

export interface UpsertEntryProps {
  entryUpsertId: string;
}

const UpsertEntry = function(props:UpsertEntryProps) {

  const {entryUpsertId} = props;

  const {
    date, dept, cat, src, payMethod, dscrpt, total, reconciled
  } = useSelector<Root,SelectorResult>((state) => ({
    date:getCell(state, ROW_ID, DATE_ID) as CellFormat,
    dept:getCell(state, ROW_ID, DEPT_ID) as CellFormat,
    cat:getCell(state, ROW_ID, CATEGORY_ID) as CellFormat,
    src:getCell(state, ROW_ID, SRC_ID) as CellFormat,
    payMethod:getCell(state, ROW_ID, PAY_METHOD_ID) as CellFormat,
    dscrpt:getCell(state, ROW_ID, DSCRPT_ID) as CellFormat,
    total:getCell(state, ROW_ID, TOTAL_ID) as CellFormat,
    reconciled:getCell(state, ROW_ID, RECONCILED_ID) as CellFormat
  }), shallowEqual);

  return <Box display="flex !important"
    flexDirection="row"
    justifyContent="flex-start"
    clone
  >
    <TableRow component="div">
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={date.width}
        flexBasis={date.width}
        flexGrow={date.width}
        order={date.index}
        clone
      >
        <TableCell component="div">
          <DateInput entryUpsertId={entryUpsertId} autoFocus/>
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={dept.width}
        flexBasis={dept.width}
        flexGrow={dept.width}
        order={dept.index}
        clone
      >
        <TableCell component="div">
          <DepartmentInput entryUpsertId={entryUpsertId} />
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={cat.width}
        flexBasis={cat.width}
        flexGrow={cat.width}
        order={cat.index}
        clone
      >
        <TableCell component="div">
          <CategoryInput entryUpsertId={entryUpsertId} />
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={src.width}
        flexBasis={src.width}
        flexGrow={src.width}
        order={src.index}
        clone
      >
        <TableCell component="div">
          <SourceInput entryUpsertId={entryUpsertId} />
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={payMethod.width}
        flexBasis={payMethod.width}
        flexGrow={payMethod.width}
        order={payMethod.index}
        clone
      >
        <TableCell component="div">
          <PaymentMethodInput entryUpsertId={entryUpsertId} />
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={dscrpt.width}
        flexBasis={dscrpt.width}
        flexGrow={dscrpt.width}
        order={dscrpt.index}
        clone
      >
        <TableCell component="div">
          <DescriptionInput entryUpsertId={entryUpsertId}/>
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        pr="0px !important"
        minWidth={total.width}
        flexBasis={total.width}
        flexGrow={total.width}
        order={total.index}
        clone
      >
        <TableCell component="div">
          <TotalInput entryUpsertId={entryUpsertId} />
        </TableCell>
      </Box>
      <Box
        borderBottom="0px !important"
        // pr="0px !important"
        minWidth={reconciled.width}
        flexBasis={reconciled.width}
        flexGrow={reconciled.width}
        order={reconciled.index}
        display="flex !important"
        justifyContent="center"
        alignItems="flex-start"
        clone
      >
        <TableCell component="div">
            <ReconciledInput entryUpsertId={entryUpsertId} />
        </TableCell>
      </Box>
    </TableRow>
  </Box>

}

export default UpsertEntry;