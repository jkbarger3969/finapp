import React, { useCallback, useState, useMemo } from "react";
import Table from "@material-ui/core/Table";
import Box from "@material-ui/core/Box";
import AutoSizer, { Size } from "react-virtualized-auto-sizer";
import { Fab, useTheme } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useQuery } from "@apollo/react-hooks";

import Header from "./Header";
import Body, { JournalMode } from "./Body";
import UpsertEntry, { Values } from "../Upsert/UpsertEntry";
import { uuid, namespace } from "../../../utils/uuid";
import { DEPT_FOR_UPSERT_ADD } from "../../Dashboard/Dashboard";
import {
  DeptForUpsertAddQuery as DeptForUpsertAdd,
  DeptForUpsertAddQueryVariables as DeptForUpsertAddVars,
} from "../../../apollo/graphTypes";

export const entryUpsertId = uuid("Journal", namespace);

const Journal = function (props: { deptId?: string; mode: JournalMode }) {
  const { deptId, mode } = props;

  const theme = useTheme();

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [updateEntryId, setUpdateEntryId] = useState<undefined | string>(
    undefined
  );

  const { data: deptForUpsertAdd } = useQuery<
    DeptForUpsertAdd,
    DeptForUpsertAddVars
  >(DEPT_FOR_UPSERT_ADD, {
    skip: !deptId,
    variables: { id: deptId as string },
  });

  const initialValues = useMemo<Partial<Values> | undefined>(
    () =>
      deptForUpsertAdd?.department
        ? {
            department: deptForUpsertAdd.department,
          }
        : undefined,
    [deptForUpsertAdd]
  );

  const updateEntry = useCallback(
    (entryId: string) => {
      setUpdateEntryId(entryId);
      setUpsertOpen(true);
    },
    [setUpdateEntryId, setUpsertOpen]
  );

  const addEntry = useCallback(() => {
    setUpsertOpen(true);
    setUpdateEntryId(undefined);
  }, [setUpdateEntryId, setUpsertOpen]);

  const autoSizerChildren = useCallback(
    ({ width, height }: Size) => {
      return (
        <Body
          updateEntry={updateEntry}
          mode={mode}
          deptId={deptId}
          width={width}
          height={height}
        />
      );
    },
    [deptId, mode, updateEntry]
  );

  return (
    <Box
      style={{ overflowX: "auto" }}
      width="100%"
      overflow="hidden"
      flexGrow={1}
      display="flex"
      justifyContent="flex-start"
      flexDirection="column"
      clone
    >
      <form>
        <Box
          width="100%"
          flexGrow={1}
          display="flex !important" // Override display:table from child Table
          justifyContent="flex-start"
          flexDirection="column"
          clone
        >
          <Table component="div">
            <Header />
            <Box flexGrow={1}>
              <AutoSizer children={autoSizerChildren} />
            </Box>
            {mode === JournalMode.View && (
              <Box
                position="fixed !important"
                bottom={theme.spacing(2)}
                right={theme.spacing(2)}
                clone
              >
                <Fab
                  disabled={upsertOpen}
                  size="large"
                  color="secondary"
                  aria-label="add entry"
                  children={<Add />}
                  onClick={addEntry}
                />
              </Box>
            )}
          </Table>
        </Box>
        <UpsertEntry
          initialValues={initialValues}
          open={upsertOpen}
          setOpen={setUpsertOpen}
          entryId={updateEntryId}
        />
      </form>
    </Box>
  );
};

export default Journal;
