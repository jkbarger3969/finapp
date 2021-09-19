import React, { useMemo } from "react";
import { Route, Switch, RouteComponentProps } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

// import Journal from "./components/Journal/Table/Journal";
import Grid from "./components/Journal/DataGrid/Grid";
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

const DashBoardRender = (props: RouteComponentProps<{ id: string }>) => {
  const selectableDepts = useMemo<DepartmentsWhere>(
    () => ({
      id: {
        eq: props.match.params.id,
      },
    }),
    [props.match.params.id]
  );

  const selectableAccounts = useMemo<AccountsWhere>(() => ({}), []);

  return props.match.params.id ? (
    <Dashboard
      selectableDepts={selectableDepts}
      selectableAccounts={selectableAccounts}
      deptId={props.match.params.id}
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

const GridParent = (
  props: RouteComponentProps<{ id: string; fiscalYear: string }> & {
    reconcileMode?: boolean;
  }
): JSX.Element => {
  const where = useMemo<EntriesWhere>(
    () => ({
      department: {
        id: {
          lte: props.match.params.id,
        },
      },
      fiscalYear: {
        id: {
          eq: props.match.params.fiscalYear,
        },
      },
      deleted: false,
    }),
    [props.match.params.id, props.match.params.fiscalYear]
  );

  const selectableDepts = useMemo<DepartmentsWhere>(
    () => ({
      id: {
        eq: props.match.params.id,
      },
    }),
    [props.match.params.id]
  );

  const selectableAccounts = useMemo<AccountsWhere>(() => ({}), []);

  const { loading, error, data } = useQuery<
    DepartmentNameQuery,
    DepartmentNameQueryVars
  >(
    DEPT_NAME,
    useMemo(
      () => ({
        skip: !props.match.params.id,
        variables: {
          id: props.match.params.id,
        },
      }),
      [props.match.params.id]
    )
  );

  if (error) {
    return <Typography color="error">{error.message}</Typography>;
  }

  return (
    <Grid
      title={data?.department?.name}
      reconcileMode={props.reconcileMode}
      loading={loading}
      where={where}
      selectableDepts={selectableDepts}
      selectableAccounts={selectableAccounts}
    />
  );
};

const GridReconcileMode = (
  props: RouteComponentProps<{ id: string; fiscalYear: string }>
): JSX.Element => <GridParent {...props} reconcileMode />;

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route exact path="/" component={TopNav} />
      <Route exact path="/department/:id" component={DashBoardRender} />
      <Route exact path="/journal/:id/:fiscalYear/" component={GridParent} />
      <Route
        exact
        path="/journal/:id/:fiscalYear/reconcile"
        component={GridReconcileMode}
      />
    </Switch>
  );
};

export default Routes;
