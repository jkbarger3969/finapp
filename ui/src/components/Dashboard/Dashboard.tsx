import React, { useCallback } from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import AddIcon from '@material-ui/icons/Add';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import TableChartIcon from '@material-ui/icons/TableChart';
import AssessmentIcon from '@material-ui/icons/Assessment';

import AddEntry from "./AddEntry";
import {uuid, namespace} from "../../utils/uuid";
import {useDebounceDispatch as useDispatch} from "../../redux/hooks";
import {create} from "../../redux/actions/journalEntryUpsert";

const ADD_ENTRY_ID = uuid("DashboardJournalEntry", namespace);

const Dashboard = function(props) {

  const dispatch = useDispatch();

  const onClickNewEntry = useCallback((event?)=>{
    dispatch(create(ADD_ENTRY_ID));
  }, [dispatch])

  return <Container>
    <Box pt={8}>
      <Grid
        container
        alignItems="center"
        justify="center"
        spacing={4}
      >
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            children={"New Entry"}
            onClick={onClickNewEntry}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            children={"Reconcile"}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            children={"Reports"}
          />
        </Grid>
        <Grid item>
          <Button
            component={Link}
            to="/journal"
            variant="contained"
            startIcon={<TableChartIcon />}
            children={"Journal"}
          />
        </Grid>
      </Grid>
    </Box>
    <AddEntry entryUpsertId={ADD_ENTRY_ID}/>;
  </Container>;

}

export default Dashboard;