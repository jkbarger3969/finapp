import React, {useCallback} from "react";
import Table from "@material-ui/core/Table";
import Box from "@material-ui/core/Box";
import AutoSizer, {Size} from 'react-virtualized-auto-sizer';

import Header from "./Header";
import Body, {JournalMode} from "./Body";
import Footer from "./Footer";
import JournalPAB from "./JournalPAB";
import {uuid, namespace} from "../../../utils/uuid";

export const entryUpsertId = uuid("Journal", namespace);


const Journal = function(props:{deptId?:string, mode:JournalMode}) {

  const {deptId, mode} = props;

  const autoSizerChildren = useCallback(({width, height}:Size) => {
    return <Body mode={mode} deptId={deptId} width={width} height={height} />;
  },[deptId, mode]);

  return <Box
    style={{overflowX:"auto"}}
    width="100%"
    overflow="hidden"
    flexGrow={1}
    display="flex"
    justifyContent="flex-start"
    flexDirection="column"
    clone
  >
    <form>
      <Box
        width="100%"
        flexGrow={1}
        display="flex !important" // Override display:table from child Table
        justifyContent="flex-start"
        flexDirection="column"
        clone
      >
        <Table component="div">
          <Header />
          <Box flexGrow={1} >
            <AutoSizer children={autoSizerChildren}/>
          </Box>
          <Footer entryUpsertId={entryUpsertId} />
          {mode === JournalMode.View && 
            <JournalPAB entryUpsertId={entryUpsertId} />}
        </Table>
      </Box>
    </form>
  </Box>;

}

export default Journal;