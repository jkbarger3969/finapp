import React, {Fragment} from 'react';
import { Provider } from "react-redux";
import { ApolloProvider } from '@apollo/react-hooks';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import client from './apollo/apollo';
import Journal from './components/Journal/Table/Journal';
import store from "./redux/store";

export default function App() {
  return <Fragment>
    <CssBaseline />
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Box
          position="fixed"
          top={0}
          left={0}
          height="100vh"
          width="100vw"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Journal/>
        </Box>
      </ApolloProvider>
    </Provider>
  </Fragment>;
    
}
