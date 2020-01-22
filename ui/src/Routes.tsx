import React from "react";
import {Route, Switch} from "react-router-dom";


import Journal from "./components/Journal/Table/Journal";
import Dashboard from "./components/Dashboard/Dashboard";


const Routes = (props) => {

  return <Switch>
      <Route exact path="/" component={Dashboard}/>
      <Route exact path="/journal" component={Journal}/>
    </Switch>;

}

export default Routes;