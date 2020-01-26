import React from "react";
import {Route, Switch, useParams} from "react-router-dom";


import Journal from "./components/Journal/Table/Journal";
import {JournalMode} from "./components/Journal/Table/Body";
import Dashboard from "./components/Dashboard/Dashboard";
import TopNav from "./components/TopNav";

const DashBoardRender = (props) => {
  const {id} = useParams();
  return id ? <Dashboard deptId={id} /> : <div>Error: No Dept ID!</div>;
}

const JournalViewRender = (props) => {
  const {id} = useParams();
  return  <Journal mode={JournalMode.View} deptId={id} />;
}

const JournalReconcileRender = (props) => {
  const {id} = useParams();
  return  <Journal mode={JournalMode.Reconcile} deptId={id} />;
}

const Routes = (props) => {

  return <Switch>
      <Route exact path="/" component={TopNav}/>
      <Route exact path="/department/:id" component={DashBoardRender}/>
      <Route exact path="/journal" component={Journal}/>
      <Route exact path="/journal/:id" component={JournalViewRender}/>
      <Route
        exact
        path="/journal/:id/reconcile"
        component={JournalReconcileRender}
      />
    </Switch>;

}

export default Routes;