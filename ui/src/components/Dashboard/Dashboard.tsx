import React, { useCallback, useEffect } from "react";
import {useQuery} from "@apollo/react-hooks";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AddIcon from '@material-ui/icons/Add';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import TableChartIcon from '@material-ui/icons/TableChart';
import AssessmentIcon from '@material-ui/icons/Assessment';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import gql from "graphql-tag";

import AddEntry from "./AddEntry";
import {uuid, namespace} from "../../utils/uuid";
import {useDebounceDispatch as useDispatch} from "../../redux/hooks";
import {create} from "../../redux/actions/journalEntryUpsert";
import {GetReportDataQuery, GetReportDataQueryVariables,
  GetReportDataEntryFragment as ReportDataEntry
} from "../../apollo/graphTypes";

const GET_REPORT_DATA = gql`
  query GetReportData($deptId:ID!, $filterBy:JournalEntiresFilterInput) {
    department(id:$deptId) {
      __typename
      id
      name
    }
    journalEntries(paginate:{skip:0,limit:5000} ,
      sortBy:[{column:DATE, direction:ASC}], filterBy:$filterBy )
    {
      entries {
        ...GetReportDataEntryFragment
      }
    }
  }
  fragment GetReportDataEntryFragment on JournalEntry {
    __typename
    category {
      __typename
      id
      name
    }
    total {
      num
      den
    }
  }
`;

const ADD_ENTRY_ID = uuid("DashboardJournalEntry", namespace);

const Dashboard = function(props:{deptId:string}) {

  const {deptId} = props;

  const {loading, error, data} = useQuery<GetReportDataQuery,
    GetReportDataQueryVariables>(GET_REPORT_DATA,{
    variables:{
      deptId,
      filterBy:{
        department:{
          eq:deptId
        }
      }
    }
  });

  const entries = data?.journalEntries.entries || [];
  const deptName = data?.department?.name || "";
  const categoryReport = new Map<string, [string, number]>();

  useEffect(()=>{
    document.title = deptName;
  }, [deptName]);

  let total = 0 ;

  for(const entry of entries) {

    if(!categoryReport.has(entry.category.id)) {
      categoryReport.set(entry.category.id, [entry.category.name, 0]);
    }
    
    const nameTotal = categoryReport.get(entry.category.id) as [string, number];

    const subTotal = nameTotal[1] + (entry.total.num / entry.total.den);
    total += subTotal;
    nameTotal[1] = subTotal;

  }
  
  const dispatch = useDispatch();

  const onClickNewEntry = useCallback((event?)=>{
    dispatch(create(ADD_ENTRY_ID,{fromDept:deptId}));
  }, [dispatch, deptId])

  const genBudget = total + total * Math.random();

  return <Box display="flex" flexDirection="column" overflow="hidden" clone>
    <Container>
      <Box padding={8}>
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
              component={Link}
              to={`/journal/${deptId}/reconcile`}
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
              to={`/journal/${deptId}`}
              variant="contained"
              startIcon={<TableChartIcon />}
              children={"Journal"}
            />
          </Grid>
        </Grid>
      </Box>
      <Box flexGrow={1} overflow="auto">
        <Grid justify="center" container spacing={2}>
          <Grid item xs={12}>
            <Typography align="center" variant="h3">{deptName}</Typography>
            <Typography align="center" variant="h5">{
              `$ ${total.toFixed(2)} / $${genBudget.toFixed(2)}`
            }</Typography>
            <div style={{height:5, backgroundColor:"grey"}}>
              <div style={{height:"100%", width:`${100 * total/genBudget}%`, backgroundColor:"green"}}></div>
            </div>
          </Grid>
          {Array.from(categoryReport).map(([id, nameTotal])=>{

            const [cat, total] = nameTotal;

            return <Grid key={id} item xs={12} md={4} lg={3}>
              <Card>
                <CardHeader titleTypographyProps={{
                  noWrap:true
                }} title={cat} />
                <CardContent>
                  <Typography variant="h6">{`$ ${total.toFixed(2)}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>;

          })}
        </Grid>
      </Box>
      <AddEntry entryUpsertId={ADD_ENTRY_ID} fromDept={deptId} />;
    </Container>
  </Box>;

}

export default Dashboard;