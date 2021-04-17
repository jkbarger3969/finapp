import React, { useMemo } from "react";
import {
  Route,
  Switch,
  useParams,
  RouteComponentProps,
} from "react-router-dom";

// import Journal from "./components/Journal/Table/Journal";
import Journal from "./components/Journal/Table/Journal";
import Grid from "./components/Journal/DataGrid/Grid";
import { JournalMode } from "./components/Journal/Table/Journal";
import Dashboard from "./components/Dashboard/Dashboard";
import TopNav from "./components/TopNav";
import { useQuery } from "@apollo/client";
import {
  DepartmentName_1Query as DepartmentName,
  EntriesWhere,
} from "./apollo/graphTypes";
import gql from "graphql-tag";

const DashBoardRender = () => {
  const { id } = useParams<{ id: string }>();

  return id ? <Dashboard deptId={id} /> : <div>Error: No Dept ID!</div>;
};

const DEPARTMENT_NAME = gql`
  query DepartmentName_1($id: ID!) {
    department(id: $id) {
      id
      __typename
      name
    }
  }
`;

/* const JournalViewRender = () => {
  const { id, year } = useParams<{ id: string; year: string }>();
  const { data } = useQuery<DepartmentName>(DEPARTMENT_NAME, {
    variables: { id },
  });
  const journalTitle = data?.department?.name
    ? data.department.name
    : undefined;
  return (
    <Journal
      mode={JournalMode.View}
      deptId={id}
      fiscalYearId={year}
      journalTitle={journalTitle}
    />
  );
}; */

const JournalReconcileRender = () => {
  const { id, year } = useParams<{ id: string; year: string }>();
  const { data } = useQuery<DepartmentName>(DEPARTMENT_NAME, {
    variables: { id },
  });
  const journalTitle = data?.department?.name
    ? `Reconcile ${data.department.name}`
    : "Reconcile";
  return (
    <Journal
      mode={JournalMode.Reconcile}
      deptId={id}
      fiscalYearId={year}
      journalTitle={journalTitle}
    />
  );
};

const GridChild: React.FC<
  RouteComponentProps<{ id: string; fiscalYear: string }>
> = (props: RouteComponentProps<{ id: string; fiscalYear: string }>) => {
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
  return <Grid where={where} />;
};

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route exact path="/" component={TopNav} />
      <Route exact path="/department/:id" component={DashBoardRender} />
      <Route exact path="/journal/:id/:fiscalYear/" component={GridChild} />
      <Route
        exact
        path="/journal/:id/:year/reconcile"
        component={JournalReconcileRender}
      />
    </Switch>
  );
};

export default Routes;
