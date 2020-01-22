import React from 'react';
import {useSelector} from "react-redux";
import TableFooter from '@material-ui/core/TableFooter';
import Box from '@material-ui/core/Box';

import UpsertEntry from "./UpsertEntry";
import {Root} from "../../../redux/reducers/root";
import {getUpsertType, UpsertType
} from "../../../redux/selectors/journalEntryUpsert";

export interface FooterProps {
  entryUpsertId: string;
}

const Footer = function(props:FooterProps) {
  
  const {entryUpsertId} = props;
  
  const upsertType = useSelector<Root, UpsertType | null>(
    (state) => getUpsertType(state, entryUpsertId));

  if(upsertType !== UpsertType.Add) {
    return null;
  }

  return <Box pb={10} clone>
    <TableFooter component="div">
      <UpsertEntry entryUpsertId={entryUpsertId} />
    </TableFooter>
  </Box>;

}

export default Footer;