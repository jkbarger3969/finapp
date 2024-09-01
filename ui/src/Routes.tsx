import React, { useMemo } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

// import Journal from "./components/Journal/Table/Journal";
import Grid, { GridRefundsWhere } from "./components/Journal/DataGrid/Grid";
import Dashboard from "./components/Dashboard/Dashboard";
import TopNav from "./components/TopNav";
import {
  AccountsWhere,
  DepartmentsWhere,
  EntriesWhere,
  DepartmentNameQuery,
  DepartmentNameQueryVariables as DepartmentNameQueryVars,
} from "./apollo/graphTypes";
import { Typography } from "@material-ui/core";

const DashBoardRender = () => {
  const { id } = useParams<{ id: string }>();

  const selectableDepts = useMemo<DepartmentsWhere>(
    () => ({
      id: {
        eq: id,
      },
    }),
    [id]
  );

  const selectableAccounts = useMemo<AccountsWhere>(() => ({}), []);

  return id ? (
    <Dashboard
      selectableDepts={selectableDepts}
      selectableAccounts={selectableAccounts}
      deptId={id}
    />
  ) : (
    <div>Error: No Dept ID!</div>
  );
};

const DEPT_NAME = gql`
  query DepartmentName($id: ID!) {
    department(id: $id) {
      __typename
      id
      name
    }
  }
`;

const GridParent = ({
  reconcileMode,
}: {
  reconcileMode?: boolean;
}): JSX.Element => {
  const { id = "", fiscalYear } =
    useParams<{ id: string; fiscalYear: string }>();

  const where = useMemo<EntriesWhere>(
    () => ({
      department: {
        id: {
          lte: id,
        },
      },
      fiscalYear: {
        id: {
          eq: fiscalYear,
        },
      },
      deleted: false,
    }),
    [id, fiscalYear]
  );

  const refundsWhere = useMemo<GridRefundsWhere>(
    () => ({
      where: {
        fiscalYear: {
          id: {
            eq: fiscalYear,
          },
        },
        deleted: false,
      },
      entriesWhere: {
        department: {
          id: {
            lte: id,
          },
        },
        fiscalYear: {
          nor: [
            {
              id: {
                eq: fiscalYear,
              },
            },
          ],
        },
        deleted: false,
      },
    }),
    [fiscalYear, id]
  );

  const selectableDepts = useMemo<DepartmentsWhere>(
    () => ({
      id: {
        eq: id,
      },
    }),
    [id]
  );

  const selectableAccounts = useMemo<AccountsWhere>(() => ({}), []);

  const { loading, error, data } = useQuery<
    DepartmentNameQuery,
    DepartmentNameQueryVars
  >(
    DEPT_NAME,
    useMemo(
      () => ({
        skip: !id,
        variables: {
          id: id,
        },
      }),
      [id]
    )
  );

  if (error) {
    return <Typography color="error">{error.message}</Typography>;
  }

  return (
    <Grid
      fiscalYear={fiscalYear}
      title={data?.department?.name}
      reconcileMode={reconcileMode}
      loading={loading}
      where={where}
      refundsWhere={refundsWhere}
      selectableDepts={selectableDepts}
      selectableAccounts={selectableAccounts}
    />
  );
};

const GridReconcileMode = (): JSX.Element => <GridParent reconcileMode />;

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<TopNav />} />
      <Route path="department/:id" element={<DashBoardRender />} />
      <Route path="journal">
        <Route path=":id/:fiscalYear" element={<GridParent />}></Route>
        <Route
          path=":id/:fiscalYear/reconcile"
          element={<GridReconcileMode />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
