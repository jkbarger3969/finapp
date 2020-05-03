import React, { useCallback } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import TableRow from "@material-ui/core/TableRow";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import { TableCell } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles";
import { red, green } from "@material-ui/core/colors";

import { randUUID } from "../../../utils/uuid";
import TransactionDate from "./Cells/TransactionDate";
import Department from "./Cells/Department";
import Category from "./Cells/Category";
import Source from "./Cells/Source";
import PaymentMethod from "./Cells/PaymentMethod";
import Description from "./Cells/Description";
import Total from "./Cells/Total";
import Reconciled from "./Cells/Reconciled";
import { JournalEntryType } from "../../../apollo/graphTypes";
import { useDebounceDispatch as useDispatch } from "../../../redux/hooks";
import { JournalMode } from "./Body";

const styles = makeStyles((theme: Theme) =>
  createStyles({
    positive: {
      color: green[900],
    },
    negative: {
      color: red[900],
    },
  })
);

type JournalEntryFragment = any;

export interface EntryProps {
  journalEntry?: JournalEntryFragment;
  deptId?: string;
  mode: JournalMode;
  style: React.CSSProperties;
  updateEntry: (entryId: string) => void;
  removeReconciled: (id: string) => void;
}

const Entry = function (props: EntryProps) {
  const classes = styles();

  const {
    journalEntry,
    style,
    deptId,
    mode,
    updateEntry,
    removeReconciled,
  } = props;

  const onDoubleClick = useCallback(
    (event) => {
      if (journalEntry) {
        updateEntry(journalEntry.id);
      }
    },
    [journalEntry, updateEntry]
  );

  if (!journalEntry) {
    const skeleton = <Skeleton variant="rect" height={20} />;

    return (
      <Box style={style} display="flex !important" clone>
        <TableRow component="div">
          <Box flexGrow={1} clone>
            <TableCell component="div" children={skeleton} />
          </Box>
        </TableRow>
      </Box>
    );
  }

  const textColor =
    journalEntry.type === JournalEntryType.Credit
      ? classes.positive
      : classes.negative;

  return (
    <Box style={style} display="flex !important" clone>
      <TableRow onDoubleClick={onDoubleClick} component="div" hover>
        <TransactionDate textColor={textColor} entryDate={journalEntry.date} />
        <Department
          textColor={textColor}
          department={journalEntry.department}
        />
        <Category textColor={textColor} category={journalEntry.category} />
        <Source textColor={textColor} source={journalEntry.source} />
        <PaymentMethod
          textColor={textColor}
          paymentMethod={journalEntry.paymentMethod}
        />
        <Description
          textColor={textColor}
          description={journalEntry.description}
        />
        <Total textColor={textColor} total={journalEntry.total} />
        <Reconciled
          removeReconciled={removeReconciled}
          entryId={journalEntry.id}
          mode={mode}
          textColor={textColor}
          reconciled={journalEntry.reconciled}
        />
      </TableRow>
    </Box>
  );
};

export default Entry;
