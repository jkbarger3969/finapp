import React from "react";
import { Route, Switch, useParams } from "react-router-dom";

// import Journal from "./components/Journal/Table/Journal";
import Journal from "./components/Journal/Table/Journal";
import { JournalMode } from "./components/Journal/Table/Journal";
import Dashboard from "./components/Dashboard/Dashboard";
import TopNav from "./components/TopNav";
import { useQuery } from "@apollo/react-hooks";
import { DepartmentName_1Query as DepartmentName } from "./apollo/graphTypes";
import gql from "graphql-tag";

const DashBoardRender = () => {
  const { id } = useParams();
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

const JournalViewRender = () => {
  const { id } = useParams();
  const { data } = useQuery<DepartmentName>(DEPARTMENT_NAME, {
    variables: { id },
  });
  const journalTitle = data?.department?.name
    ? data.department.name
    : undefined;
  return (
    <Journal mode={JournalMode.View} deptId={id} journalTitle={journalTitle} />
  );
};

const JournalReconcileRender = () => {
  const { id } = useParams();
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
      journalTitle={journalTitle}
    />
  );
};

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route exact path="/" component={TopNav} />
      <Route exact path="/department/:id" component={DashBoardRender} />
      <Route exact path="/journal" component={Journal} />
      <Route exact path="/journal/:id" component={JournalViewRender} />
      <Route
        exact
        path="/journal/:id/reconcile"
        component={JournalReconcileRender}
      />
    </Switch>
  );
};

export default Routes;
