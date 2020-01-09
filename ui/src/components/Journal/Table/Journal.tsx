import React from "react";
import Table from "@material-ui/core/Table";
import Box from "@material-ui/core/Box";

import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import JournalPAB from "./JournalPAB";
import {uuid, namespace} from "../../../utils/uuid";

export const entryUpsertId = uuid("Journal", namespace);

const Journal = function() {

  return <Box
    width="100%"
    maxWidth="100vw"
    overflow="auto"
    flexGrow={1}
    display="flex"
    justifyContent="flex-start"
    flexDirection="column"
    clone
  >
    <form>
      <Box
        width="100%"
        minWidth={1400}
        flexGrow={1}
        overflow="auto"
        display="flex !important" // Override display:table from child Table
        justifyContent="flex-start"
        flexDirection="column"
        clone
      >
        <Table component="div">
          <Header />
          <Box flexGrow={1} >
            <Body />
          </Box>
          <Footer entryUpsertId={entryUpsertId} />
          <JournalPAB entryUpsertId={entryUpsertId} />
        </Table>
      </Box>
    </form>
  </Box>;

}

export default Journal;