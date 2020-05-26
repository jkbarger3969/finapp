import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import TableChartIcon from "@material-ui/icons/TableChart";
import AssessmentIcon from "@material-ui/icons/Assessment";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import numeral from "numeral";
import { red, green, orange, grey } from "@material-ui/core/colors";
import gql from "graphql-tag";

import {
  GetReportDataQuery,
  GetReportDataQueryVariables,
  JournalEntryType,
  OnEntryUpsert_2Subscription as OnEntryUpsert,
} from "../../apollo/graphTypes";
import {
  GET_REPORT_DATA,
  GET_REPORT_DATA_ENTRY_FRAGMENT,
} from "./ReportData.gql";
import { DEPT_ENTRY_OPT_FRAGMENT } from "../Journal/Upsert/upsertEntry.gql";
import AddEntry from "../Journal/Upsert/Entries/AddEntry";

const colorMeter = (percentSpent: number, shade = 800) => {
  if (percentSpent < 0.75) {
    return green[shade];
  } else if (percentSpent < 0.9) {
    return orange[shade];
  } else {
    return red[shade];
  }
};

const BudgetMeter = (props: { spentPercentage: number; height: number }) => {
  const { spentPercentage, height } = props;

  return (
    <Box
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
    </Box>
  );
};

interface DeptReportObj {
  name: string;
  spent: number;
  budget: number | null;
}

export const DEPT_FOR_UPSERT_ADD = gql`
  query DeptForUpsertAdd($id: ID!) {
    department(id: $id) {
      ...DeptEntryOptFragment
    }
  }
  ${DEPT_ENTRY_OPT_FRAGMENT}
`;

const ON_ENTRY_UPSERT = gql`
  subscription OnEntryUpsert_2 {
    journalEntryUpserted {
      ...GetReportDataEntry_1Fragment
      department {
        ancestors {
          ... on Department {
            __typename
            id
          }
        }
      }
    }
  }
  ${GET_REPORT_DATA_ENTRY_FRAGMENT}
`;

const Dashboard = function (props: { deptId: string }) {
  const { deptId } = props;

  const [addEntryOpen, setAddEntryOpen] = useState<boolean>(false);
  const addEntryOnClose = useCallback(() => void setAddEntryOpen(false), [
    setAddEntryOpen,
  ]);

  const variables = useMemo(
    () => ({
      deptId,
      where: {
        department: { eq: deptId, matchDecedentTree: true },
        deleted: false,
      },
    }),
    [deptId]
  );

  const { loading, error, data, subscribeToMore } = useQuery<
    GetReportDataQuery,
    GetReportDataQueryVariables
  >(GET_REPORT_DATA, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const isLoading = loading && !data?.journalEntries;

  // Subscribe to updates
  useEffect(() => {
    return subscribeToMore<OnEntryUpsert>({
      document: ON_ENTRY_UPSERT,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const upsertEntry = subscriptionData.data.journalEntryUpserted;

        const ancestors = upsertEntry.department.ancestors;

        if (
          deptId &&
          upsertEntry.department.id !== deptId &&
          ancestors.every((dept) => (dept as any).id !== deptId)
        ) {
          // Filter entry out of query results if department changes.
          const journalEntriesFiltered = prev.journalEntries.filter(
            (entry) => entry.id !== upsertEntry.id
          );

          if (journalEntriesFiltered.length === prev.journalEntries.length) {
            return prev;
          }

          return Object.assign({}, prev, {
            journalEntries: journalEntriesFiltered,
          });
        }

        // Apollo will take care of updating if entry already exists in cache.
        if (prev.journalEntries.some((entry) => entry.id === upsertEntry.id)) {
          return prev;
        }

        return Object.assign({}, prev, {
          journalEntries: [upsertEntry, ...prev.journalEntries],
        });
      },
    });
  }, [deptId, subscribeToMore]);

  const entries = useMemo(() => {
    return (data?.journalEntries || []).filter((entry) => !entry.deleted);
  }, [data]);
  const deptName = data?.department?.name || "";

  useEffect(() => {
    document.title = deptName;
  }, [deptName]);

  const department = data?.department || null;

  const {
    totalRemaining,
    budget,
    spentToBudgetRatio,
    deptReport,
  } = useMemo(() => {
    // Generate department report objects
    const deptReport = new Map<string, DeptReportObj>();
    let subDeptBudgetAg = 0;

    if (department) {
      const budget = (() => {
        if (department.budget) {
          const { num, den } = department.budget.amount;
          return num / den;
        }
        return null;
      })();

      deptReport.set(department.id, {
        name: department.name,
        spent: 0,
        budget,
      });

      for (const subDept of department.descendants) {
        let budget: null | number = null;

        if (subDept.budget) {
          const { num, den } = subDept.budget.amount;
          const subBudgetDec = num / den;
          subDeptBudgetAg += subBudgetDec;
          budget = subBudgetDec;
        }

        deptReport.set(subDept.id, {
          name: subDept.name,
          spent: 0,
          budget,
        });
      }
    }

    // Calculating aggregate depts and credits
    let spent = 0;
    for (const entry of entries) {
      if (entry.deleted) {
        continue;
      }
      const deptReportObj = deptReport.get(
        entry.department.id
      ) as DeptReportObj;

      let entryTotal = entry.total.num / entry.total.den;

      // Aggregate refunds
      for (const refund of entry.refunds) {
        if (refund.deleted) {
          continue;
        }
        entryTotal -= refund.total.num / refund.total.den;
      }

      if (entry.type === JournalEntryType.Credit) {
        spent -= entryTotal;
        deptReportObj.spent -= entryTotal;
      } else {
        spent += entryTotal;

        deptReportObj.spent += entryTotal;
      }
    }

    // Format values
    const budgetDec = (() => {
      if (department?.budget) {
        const { num, den } = department?.budget?.amount || { num: 0, den: 1 };
        return num / den;
      }

      return subDeptBudgetAg;
    })();

    const totalRemaining = numeral(budgetDec - spent).format("$0,0.00");
    const budget = numeral(budgetDec).format("$0,0.00");
    const spentToBudgetRatio = spent / budgetDec;

    return {
      totalRemaining,
      budget,
      spentToBudgetRatio,
      deptReport,
    };
  }, [entries, department]);

  const subDeptCards = useMemo(() => {
    const subDeptCards: JSX.Element[] = [];

    for (const [id, { budget, spent, name }] of deptReport) {
      // Do not include root department
      if (id === department?.id) {
        continue;
      }

      const card = (
        <Grid key={id} item xs={12} md={4} lg={3}>
          <Card>
            <CardHeader
              titleTypographyProps={{
                noWrap: true,
              }}
              title={name}
            />
            <CardContent>
              {(() => {
                if (budget === null) {
                  return (
                    <Box color={spent > 0 ? red[900] : green[900]} clone>
                      <Typography variant="h6">
                        {`Spent: ${numeral(Math.abs(spent)).format("$0,0.00")}`}
                      </Typography>
                    </Box>
                  );
                }

                const totalRemaining = budget - spent;

                return (
                  <React.Fragment>
                    <Box color={colorMeter(spent / budget, 900)} clone>
                      <Typography variant="h6">{`${numeral(
                        totalRemaining
                      ).format("$0,0.00")} Remaining`}</Typography>
                    </Box>
                    <Typography variant="body1">{`of ${numeral(budget).format(
                      "$0,0.00"
                    )}`}</Typography>
                    <BudgetMeter spentPercentage={spent / budget} height={5} />
                  </React.Fragment>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      );

      subDeptCards.push(card);
    }

    return subDeptCards;
  }, [deptReport, department]);

  const onClickAddEntry = useCallback((event?) => setAddEntryOpen(true), [
    setAddEntryOpen,
  ]);

  if (isLoading) {
    return <p>Loading...</p>;
  } else if (error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

  return (
    <Box display="flex" flexDirection="column" overflow="hidden" clone>
      <Container>
        <Box padding={8}>
          <Grid container alignItems="center" justify="center" spacing={4}>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                children={"New Entry"}
                onClick={onClickAddEntry}
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
              <Typography align="center" variant="h3">
                {deptName}
              </Typography>
              <Box color={colorMeter(spentToBudgetRatio)}>
                <Typography align="center" variant="h4">
                  {`${totalRemaining} Remaining`}
                </Typography>
              </Box>
              <Typography align="center" variant="subtitle1">
                {`of ${budget}`}
              </Typography>
              <BudgetMeter spentPercentage={spentToBudgetRatio} height={10} />
            </Grid>
            {subDeptCards}
          </Grid>
        </Box>
        <AddEntry
          deptId={deptId}
          open={addEntryOpen}
          onClose={addEntryOnClose}
        />
      </Container>
    </Box>
  );
};

export default Dashboard;
