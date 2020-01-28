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
import numeral from 'numeral';
import {red, green, orange, grey} from '@material-ui/core/colors';

import AddEntry from "./AddEntry";
import {uuid, namespace} from "../../utils/uuid";
import {useDebounceDispatch as useDispatch} from "../../redux/hooks";
import {create} from "../../redux/actions/journalEntryUpsert";
import {GetReportDataQuery, GetReportDataQueryVariables,
  GetReportDataEntryFragment as ReportDataEntry, JournalEntryType
} from "../../apollo/graphTypes";

const GET_REPORT_DATA = gql`
  query GetReportData($deptId:ID!) {
    department(id:$deptId) {
      __typename
      id
      name
      budget {
        id
        __typename
        amount {
          num
          den
        }
      }
    }
    journalEntries(filterBy:{department:{eq:$deptId}}) {
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
    type
    total {
      num
      den
    }
    department {
      __typename
      id
      name
      budget {
        id
        __typename
        amount {
          num
          den
        }
      }
    }
  }
`;

const ADD_ENTRY_ID = uuid("DashboardJournalEntry", namespace);

const colorMeter = (percentSpent:number, shade = 800) => {
  if(percentSpent < .75) {
    return green[shade];
  } else if(percentSpent < .90) {
    return orange[shade];
  } else {
    return red[shade];
  }
}

const BudgetMeter = (props:{spentPercentage:number; height:number;}) => {

  const {spentPercentage, height} = props;

  return <Box
    height={height}
    bgcolor={colorMeter(spentPercentage)}
    display="flex"
    justifyContent="flex-start"
  >
    <Box
      height="100%"
      width={`${100 * spentPercentage}%`}
      bgcolor={grey[400]}
    />
  </Box>;
}

interface DeptReportObj {
  name:string;
  spent:number;
  budget:number | null;
}

const Dashboard = function(props:{deptId:string}) {

  const {deptId} = props;

  const {loading, error, data} = useQuery<GetReportDataQuery,
    GetReportDataQueryVariables>(GET_REPORT_DATA,{
    variables:{
      deptId
    }
  });

  const entries = data?.journalEntries.entries || [];
  const deptName = data?.department?.name || "";
  const sudDeptReport = new Map<string, DeptReportObj>();

  useEffect(()=>{
    document.title = deptName;
  }, [deptName]);
  
  const dispatch = useDispatch();

  const onClickNewEntry = useCallback((event?)=>{
    dispatch(create(ADD_ENTRY_ID,{fromDept:deptId}));
  }, [dispatch, deptId]);

  let total = 0 ;

  for(const entry of entries) {

    if(!sudDeptReport.has(entry.department.id)) {

      sudDeptReport.set(entry.department.id, {
        name:entry.department.name,
        spent:0,
        budget:(()=>{
          if(entry.department?.budget?.amount) {
            const {num, den} = entry.department.budget.amount;
            return num/den;
          }
          return null;
        })()
      });
    
    }
    
    const nameTotal = sudDeptReport.get(entry.department.id) as DeptReportObj;

    const entryTotal = entry.total.num / entry.total.den;
    
    if(entry.type === JournalEntryType.Credit) {
    
      total -= entryTotal;
      nameTotal.spent -= entryTotal;
    
    } else {
    
      total += entryTotal;
    
      nameTotal.spent += entryTotal;
    
    }

  }

  const {num:bNum, den:bDen} = 
    data?.department?.budget?.amount || {num:0, den:1};
  const budgetDec = bNum/bDen;
  const totalRemaining = numeral(budgetDec - total).format('$0,0.00');
  const budget = numeral(budgetDec).format('$0,0.00');

  if(loading) {
    return <p>Loading...</p>;
  } else if(error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

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
            <Box color={colorMeter(total/budgetDec)}>
              <Typography align="center" variant="h4">
                  {`${totalRemaining} Remaining`}
              </Typography>
            </Box>
            <Typography align="center" variant="subtitle1">
              {`of ${budget}`}
            </Typography>
            <BudgetMeter spentPercentage={total/budgetDec} height={10} />
          </Grid>
          {Array.from(sudDeptReport).filter(d => d[0] !== deptId).map(([id, deptReportObj])=>{

            const {budget, spent, name} = deptReportObj as DeptReportObj;

            return <Grid key={id} item xs={12} md={4} lg={3}>
              <Card>
                <CardHeader titleTypographyProps={{
                  noWrap:true
                }} title={name} />
                <CardContent>{(()=>{

                  if(budget === null) {

                    return <Box color={spent > 0 ? red[900] : green[900]} clone>
                      <Typography variant="h6">
                      {`Spent: ${numeral(Math.abs(spent)).format('$0,0.00')}`} 
                      </Typography>;
                    </Box>;

                  }
                  
                  const totalRemaining = budget - spent;

                  return <React.Fragment>
                    <Box color={colorMeter(spent/budget, 900)} clone>
                      <Typography variant="h6">{
                        `${numeral(totalRemaining).format('$0,0.00')} Remaining`
                      }</ Typography>
                    </Box>
                    <Typography variant="body1" >{
                      `of ${numeral(budget).format('$0,0.00')}`
                    }</Typography>
                    <BudgetMeter spentPercentage={spent/budget} height={5}/>
                  </React.Fragment>;


                })()}</CardContent>
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