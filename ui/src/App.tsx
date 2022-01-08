import React, { Fragment } from "react";
import { ApolloProvider } from "@apollo/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import { BrowserRouter } from "react-router-dom";

import client from "./apollo/apollo";
import AppRoutes from "./Routes";

const App = (): JSX.Element => (
  <Fragment>
    <CssBaseline />

    <ApolloProvider client={client}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ApolloProvider>
  </Fragment>
);

export default App;
