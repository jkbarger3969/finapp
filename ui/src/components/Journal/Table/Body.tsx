import React, { useCallback, useMemo, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import TableBody from "@material-ui/core/TableBody";
import Box from "@material-ui/core/Box";
import { FixedSizeList as List, FixedSizeListProps } from "react-window";

import Entry from "./Entry";
import {
  JOURNAL_ENTRIES,
  JOURNAL_ENTRY_ADDED_SUB,
  JOURNAL_ENTRY_UPDATED_SUB,
  JOURNAL_ENTRY_FRAGMENT,
} from "./JournalEntries.gql";
import { ROW_ID } from "./Cells/cellsReduxIni";
import { Root } from "../../../redux/reducers/root";
import { TableCell as CellFormat } from "../../../redux/reducers/tableRows";
import { getIndexedCells } from "../../../redux/selectors/tableRows";
import {
  JournalEntries_1Query as JournalEntriesQuery,
  JournalEntries_1QueryVariables as JournalEntriesQueryVars,
  JournalEntryAdded_1Subscription as JournalEntryAdded,
  JournalEntryUpdated_1Subscription as JournalEntryUpdated,
  JournalEntry_1Fragment as JournalEntryFragment,
  JournalEntryRefund_1Fragment as JournalEntryRefundFragment,
  JournalEntryType,
} from "../../../apollo/graphTypes";

export enum JournalMode {
  View,
  Reconcile,
}

export interface BodyProps {
  deptId?: string;
  mode: JournalMode;
  height: number;
  width: number;
  updateEntry: (entryId: string) => void;
}

export type Entry =
  | JournalEntryFragment
  | (Omit<JournalEntryFragment, "__typename" | "refunds"> &
      JournalEntryRefundFragment & { refunds: never[] });

const entriesGen = function* (
  entry: JournalEntryFragment
): IterableIterator<Entry> {
  yield entry;
  const type =
    entry.type === JournalEntryType.Credit
      ? JournalEntryType.Debit
      : JournalEntryType.Credit;
  for (const refund of entry.refunds) {
    yield {
      ...entry,
      ...refund,
      type,
      description: refund.description || entry.description,
      refunds: [],
    };
  }
};

const Body = function (props: BodyProps) {
  const { height, deptId, mode, width: parentWidth, updateEntry } = props;

  const variables = useMemo<JournalEntriesQueryVars | undefined>(() => {
    return deptId
      ? {
          where: { department: { eq: deptId } },
        }
      : undefined;
  }, [deptId]);

  const cellFormats = useSelector<Root, CellFormat[]>(
    (state) => getIndexedCells(state, ROW_ID),
    shallowEqual
  );

  const width = useMemo(() => {
    const minWidth = cellFormats.reduce((minWidth, cellFormat) => {
      return minWidth + cellFormat.width;
    }, 0);

    return Math.max(minWidth, parentWidth);
  }, [cellFormats, parentWidth]);

  const { error, data, updateQuery, fetchMore, subscribeToMore } = useQuery<
    JournalEntriesQuery,
    JournalEntriesQueryVars
  >(JOURNAL_ENTRIES, {
    variables,
  });

  const client = useApolloClient();

  useEffect(() => {
    // Check if query has been cache already
    const cacheResults = (() => {
      try {
        return client.readQuery<JournalEntriesQuery, JournalEntriesQueryVars>({
          query: JOURNAL_ENTRIES,
          variables,
        });
      } catch (error) {
        return null;
      }
    })();

    // Request updated for any changes since last cache
    if (cacheResults?.journalEntries) {
      const gt = cacheResults.journalEntries
        .reduce((date, entry) => {
          const entryDate = new Date(entry.lastUpdate);
          return entryDate > date ? entryDate : date;
        }, new Date(0))
        .toISOString();

      fetchMore({
        variables: variables
          ? {
              ...variables,
              where: {
                ...(variables?.where || {}),
                lastUpdate: { gt },
              },
            }
          : {
              where: {
                lastUpdate: { gt },
              },
            },
        updateQuery: (prev, { fetchMoreResult }) => ({
          ...(prev || {}),
          ...(fetchMoreResult || {}),
          journalEntries: [
            ...(prev?.journalEntries || []),
            ...(fetchMoreResult?.journalEntries || []),
          ],
        }),
      });
    }

    // Subscribe to entry additions
    const addUnSub = subscribeToMore<JournalEntryAdded>({
      document: JOURNAL_ENTRY_ADDED_SUB,
      updateQuery: (prev, { subscriptionData }) => {
        const journalEntryAdded = subscriptionData?.data?.journalEntryAdded;

        if (
          !journalEntryAdded ||
          (journalEntryAdded.id !== deptId &&
            journalEntryAdded.department.ancestors.every(
              (dept) => dept.__typename === "Business" || dept.id !== deptId
            ))
        ) {
          return prev;
        }

        return {
          ...(prev || {}),
          journalEntries: [
            ...(prev?.journalEntries || []),
            ...([subscriptionData?.data?.journalEntryAdded] || []),
          ],
        };
      },
    });

    // Subscribe to updates
    const updateUnSub = subscribeToMore<JournalEntryUpdated>({
      document: JOURNAL_ENTRY_UPDATED_SUB,
      updateQuery: (prev, { subscriptionData }) => {
        const journalEntryUpdated = subscriptionData?.data?.journalEntryUpdated;

        if (journalEntryUpdated) {
          client.writeFragment<JournalEntryFragment>({
            id: `JournalEntry:${journalEntryUpdated.id}`,
            fragment: JOURNAL_ENTRY_FRAGMENT,
            data: journalEntryUpdated,
          });
        }

        return prev;
      },
    });

    return () => {
      addUnSub();
      updateUnSub();
    };
  }, [variables, fetchMore, client, subscribeToMore, deptId]);

  const removeReconciled = useCallback(
    (id: string) => {
      if (mode === JournalMode.View) {
        return;
      }

      updateQuery((prev) => {
        const entries = prev.journalEntries || [];

        for (let i = 0, len = entries.length; i < len; i++) {
          if (entries[i].id === id) {
            return {
              ...prev,
              journalEntries: [...entries.slice(0, i), ...entries.slice(i + 1)],
            };
          }
        }

        return prev;
      });
    },
    [mode, updateQuery]
  );

  const journalEntries = data?.journalEntries || [];
  const entries = useMemo(() => {
    const filters =
      mode === JournalMode.Reconcile
        ? [(entry: Entry) => !entry.reconciled && !entry.deleted]
        : [(entry: Entry) => !entry.deleted];

    return journalEntries
      .reduce((entries: Entry[], journalEntry) => {
        for (const entry of entriesGen(journalEntry)) {
          if (filters.every((filter) => filter(entry))) {
            entries.push(entry);
          }
        }

        return entries;
      }, [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journalEntries, mode]);

  const itemCount = entries.length ?? 500;

  const entryRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const entry = entries[index];
      return (
        <Entry
          mode={mode}
          style={style}
          journalEntry={entry}
          removeReconciled={removeReconciled}
          updateEntry={updateEntry}
        />
      );
    },
    [entries, mode, removeReconciled, updateEntry]
  );

  const itemKey = useCallback<NonNullable<FixedSizeListProps["itemKey"]>>(
    (index) => entries[index]?.id ?? index,
    [entries]
  );

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Box height={height} display="block" clone>
      <TableBody component="div">
        <Box display="flex" clone>
          <List
            itemKey={itemKey}
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={53}
            overscanCount={10}
          >
            {entryRow}
          </List>
        </Box>
      </TableBody>
    </Box>
  );
};

export default Body;
