import React, { Fragment } from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import CssBaseline from "@material-ui/core/CssBaseline";
import { BrowserRouter as Router } from "react-router-dom";

import client from "./apollo/apollo";
import Routes from "./Routes";

export default function App() {
  return (
    <Fragment>
      <CssBaseline />
      <ApolloProvider client={client}>
        <Router>
          <Routes />
        </Router>
      </ApolloProvider>
    </Fragment>
  );
}
