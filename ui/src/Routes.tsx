import React from "react";
import {Route, Switch, useParams} from "react-router-dom";


import Journal from "./components/Journal/Table/Journal";
import Dashboard from "./components/Dashboard/Dashboard";
import TopNav from "./components/TopNav";

const DashBoardRender = (props) => {
  const {id} = useParams();
  return id ? <Dashboard deptId={id} /> : <div>Error: No Dept ID!</div>;
}

const JournalRender = (props) => {
  const {id} = useParams();
  return  <Journal deptId={id} />;
}

const Routes = (props) => {

  return <Switch>
      <Route exact path="/" component={TopNav}/>
      <Route exact path="/department/:id" component={DashBoardRender}/>
      <Route exact path="/journal" component={Journal}/>
      <Route exact path="/journal/:id" component={JournalRender}/>
    </Switch>;

}

export default Routes;