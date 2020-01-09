import React, {Fragment} from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

import client from './apollo/apollo';
import Journal from './components/Journal/Table/Journal';

export default function App() {
  return <Fragment>
    <CssBaseline />
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
  </Fragment>;
    
}
