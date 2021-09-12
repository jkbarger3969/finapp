import React, { useMemo } from "react";
import {
  Route,
  Switch,
  useParams,
  RouteComponentProps,
} from "react-router-dom";

// import Journal from "./components/Journal/Table/Journal";
import Grid from "./components/Journal/DataGrid/Grid";
import Dashboard from "./components/Dashboard/Dashboard";
import TopNav from "./components/TopNav";
import {
  AccountsWhere,
  DepartmentsWhere,
  EntriesWhere,
} from "./apollo/graphTypes";

const DashBoardRender = () => {
  const { id } = useParams<{ id: string }>();

  return id ? <Dashboard deptId={id} /> : <div>Error: No Dept ID!</div>;
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

  const selectableDepts = useMemo<DepartmentsWhere>(
    () => ({
      id: {
        eq: props.match.params.id,
      },
    }),
    [props.match.params.id]
  );

  const selectableAccounts = useMemo<AccountsWhere>(() => ({}), []);

  return (
    <Grid
      where={where}
      selectableDepts={selectableDepts}
      selectableAccounts={selectableAccounts}
    />
  );
};

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route exact path="/" component={TopNav} />
      <Route exact path="/department/:id" component={DashBoardRender} />
      <Route exact path="/journal/:id/:fiscalYear/" component={GridChild} />
      <Route exact path="/journal/:id/:year/reconcile" />
    </Switch>
  );
};

export default Routes;
