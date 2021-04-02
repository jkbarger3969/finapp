import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
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
import { Color, FormControl, InputLabel } from "@material-ui/core";
import gql from "graphql-tag";
import Fraction from "fraction.js";
import { Select, SelectProps } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";

import {
  GetReportDataQuery,
  GetReportDataQueryVariables,
  EntryType,
  OnEntryUpsert_2Subscription as OnEntryUpsert,
  GetReportDataDept_1Fragment as DepartmentFragment,
  FiscalYear,
} from "../../apollo/graphTypes";
import { deserializeRational } from "../../apollo/scalars";
import {
  GET_REPORT_DATA,
  GET_REPORT_DATA_ENTRY_FRAGMENT,
} from "./ReportData.gql";
import { DEPT_ENTRY_OPT_FRAGMENT } from "../Journal/Upsert/upsertEntry.gql";
import AddEntry from "../Journal/Upsert/Entries/AddEntry";

const colorMeter = (percentSpent: number, shade: keyof Color = 800) => {
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

interface DeptReport {
  name: string;
  spent: Fraction;
  budget: Fraction | null;
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
    entryUpserted {
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

const Dashboard = (props: { deptId: string }): JSX.Element => {
  const { deptId } = props;

  const [addEntryOpen, setAddEntryOpen] = useState<boolean>(false);
  const addEntryOnClose = useCallback(() => void setAddEntryOpen(false), [
    setAddEntryOpen,
  ]);

  const variables = useMemo(
    () => ({
      deptId,
      where: {
        department: {
          id: {
            lte: deptId,
          },
        },
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

  const isLoading = loading && !data?.entries;

  // Subscribe to updates
  useEffect(() => {
    return subscribeToMore<OnEntryUpsert>({
      document: ON_ENTRY_UPSERT,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const upsertEntry = subscriptionData.data.entryUpserted;

        const ancestors = upsertEntry.department.ancestors;

        if (
          deptId &&
          upsertEntry.department.id !== deptId &&
          ancestors.every(
            (dept) => dept.__typename === "Department" && dept.id !== deptId
          )
        ) {
          // Filter entry out of query results if department changes.
          const entriesFiltered = prev.entries.filter(
            (entry) => entry.id !== upsertEntry.id
          );

          if (entriesFiltered.length === prev.entries.length) {
            return prev;
          }

          return Object.assign({}, prev, {
            entries: entriesFiltered,
          });
        }

        // Apollo will take care of updating if entry already exists in cache.
        if (prev.entries.some((entry) => entry.id === upsertEntry.id)) {
          return prev;
        }

        return Object.assign({}, prev, {
          entries: [upsertEntry, ...prev.entries],
        });
      },
    });
  }, [deptId, subscribeToMore]);

  const [year, setYear] = useState<Date>(new Date(new Date().toDateString()));

  const fiscalYear = useMemo<null | FiscalYear>(() => {
    for (const fiscalYear of data?.fiscalYears || []) {
      if (
        year >= new Date(fiscalYear.begin) &&
        year < new Date(fiscalYear.end)
      ) {
        return fiscalYear;
      }
    }
    return null;
  }, [year, data]);

  const entries = useMemo(() => {
    return (data?.entries || []).filter(
      (entry) => !entry.deleted && fiscalYear?.id === entry.fiscalYear.id
    );
  }, [data, fiscalYear]);
  const deptName = data?.department?.name || "";

  useEffect(() => {
    document.title = deptName;
  }, [deptName]);

  const department = data?.department || null;

  const {
    totalRemaining,
    budget,
    spentToBudgetRatio,
    deptReports,
    uBudget,
  } = useMemo<{
    totalRemaining: string;
    budget: string;
    spentToBudgetRatio: number;
    deptReports: Map<string, DeptReport>;
    uBudget: Fraction;
  }>(() => {
    // Generate department report objects
    const deptReports = new Map<string, DeptReport>();

    let uBudget = new Fraction(0);
    let uSpent = new Fraction(0);

    const depts: (GetReportDataQuery["department"] | DepartmentFragment)[] = [];

    if (department) {
      const budgetsAccountedFor = new Set<string>();
      depts.push(department, ...department.descendants);
      for (const dept of depts) {
        const budgetFound =
          dept.budgets.find(
            (b) =>
              b.fiscalYear.id === fiscalYear?.id &&
              !budgetsAccountedFor.has(b.id)
          ) ?? null;

        let budget: null | Fraction = null;
        if (budgetFound) {
          const amount = budgetFound.amount;
          budgetsAccountedFor.add(budgetFound.id);
          budget = deserializeRational(amount);
          uBudget = uBudget.add(budget);
        }

        deptReports.set(dept.id, {
          name: dept.name,
          spent: new Fraction(0),
          budget,
        });
      }
    }

    // Calculating aggregate depts and credits
    for (const entry of entries) {
      if (entry.deleted) {
        continue;
      }
      const deptReport = deptReports.get(entry.department.id) as DeptReport;

      let entryTotal = deserializeRational(entry.total);

      // BUG Story ID: CH58

      // Aggregate Refunds
      for (const refund of entry.refunds) {
        if (refund.deleted) {
          continue;
        }
        entryTotal = entryTotal.sub(deserializeRational(refund.total));
      }

      // Itemization Adjustments
      if (department) {
        for (const item of entry.items) {
          if (
            item.deleted ||
            !item.department ||
            depts.some(({ id }) => id === item.department?.id)
          ) {
            continue;
          }

          // Item has been applied  to another department budget.
          entryTotal = entryTotal.sub(deserializeRational(item.total));
        }
      }

      if (entry.type === EntryType.Credit) {
        uSpent = uSpent.sub(entryTotal);
        deptReport.spent = deptReport.spent.sub(entryTotal);
      } else {
        uSpent = uSpent.add(entryTotal);
        deptReport.spent = deptReport.spent.add(entryTotal);
      }
    }

    return {
      totalRemaining: numeral(uBudget.sub(uSpent).valueOf()).format("$0,0.00"),
      budget: numeral(uBudget.valueOf()).format("$0,0.00"),
      spentToBudgetRatio: uBudget.n === 0 ? 1 : uSpent.div(uBudget).valueOf(),
      deptReports,
      uBudget,
    };
  }, [entries, department]);

  const subDeptCards = useMemo(() => {
    const subDeptCards: JSX.Element[] = [];

    for (const [id, { budget, spent, name }] of deptReports) {
      // Do not include root department
      if (id === department?.id && (!budget || budget.equals(uBudget))) {
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
                if (budget === null || budget.n === 0) {
                  return (
                    <Box
                      color={
                        spent.compare(new Fraction(0)) > 0
                          ? red[900]
                          : green[900]
                      }
                      clone
                    >
                      <Typography variant="h6">
                        {`Spent: ${numeral(spent.abs().valueOf()).format(
                          "$0,0.00"
                        )}`}
                      </Typography>
                    </Box>
                  );
                }

                const totalRemaining = budget.sub(spent);

                const spentToBudgetRatio = spent.div(budget).valueOf();

                return (
                  <React.Fragment>
                    <Box color={colorMeter(spentToBudgetRatio, 900)} clone>
                      <Typography variant="h6">{`${numeral(
                        totalRemaining.valueOf()
                      ).format("$0,0.00")} Remaining`}</Typography>
                    </Box>
                    <Typography variant="body1">{`of ${numeral(
                      budget.valueOf()
                    ).format("$0,0.00")}`}</Typography>
                    <BudgetMeter
                      spentPercentage={spentToBudgetRatio}
                      height={5}
                    />
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
  }, [deptReports, department, uBudget]);

  const onClickAddEntry = useCallback(() => setAddEntryOpen(true), [
    setAddEntryOpen,
  ]);

  const fiscalYearSelect = useMemo<JSX.Element>(() => {
    const onChange: SelectProps["onChange"] = (event) => {
      const value = event.target.value as string;
      if (value) {
        for (const fiscalYear of data?.fiscalYears || []) {
          if (fiscalYear.id === value) {
            setYear(
              new Date(fiscalYear.begin)
              /* new Date(
                new Date(fiscalYear.begin).getTime() + 1000 * 60 * 60 * 24 * 5
              ) */
            );
            return;
          }
        }
      }
    };

    return (
      <Box minWidth={120} clone>
        <FormControl variant="outlined">
          <InputLabel>Fiscal Year</InputLabel>
          <Select
            label="Fiscal Year<"
            variant="outlined"
            value={fiscalYear?.id || ""}
            onChange={onChange}
          >
            {[...(data?.fiscalYears || [])]
              .sort(
                (a, b) =>
                  new Date(a.begin).getTime() - new Date(b.begin).getTime()
              )
              .map((fiscalYear) => {
                return (
                  <MenuItem key={fiscalYear.id} value={fiscalYear.id}>
                    {fiscalYear.name}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </Box>
    );
  }, [data, setYear, fiscalYear]);

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
                onClick={onClickAddEntry}
              >
                New Entry
              </Button>
            </Grid>
            <Grid item>
              <Button
                disabled={!fiscalYear}
                component={Link}
                to={`/journal/${deptId}/${fiscalYear?.id || ""}/reconcile`}
                variant="contained"
                startIcon={<DoneAllIcon />}
              >
                Reconcile
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<AssessmentIcon />}>
                Reports
              </Button>
            </Grid>
            <Grid item>
              <Button
                disabled={!fiscalYear}
                component={Link}
                to={`/journal/${deptId}/${fiscalYear?.id || ""}`}
                variant="contained"
                startIcon={<TableChartIcon />}
              >
                Journal
              </Button>
            </Grid>
            <Grid item>{fiscalYearSelect}</Grid>
          </Grid>
        </Box>
        <Box flexGrow={1} overflow="auto">
          <Grid justify="center" container spacing={2}>
            <Grid item xs={12}>
              <Typography align="center" variant="h3">
                {deptName}
              </Typography>
              <Box color={colorMeter(spentToBudgetRatio.valueOf())}>
                <Typography align="center" variant="h4">
                  {`${totalRemaining} Remaining`}
                </Typography>
              </Box>
              <Typography align="center" variant="subtitle1">
                {`of ${budget}`}
              </Typography>
              <BudgetMeter
                spentPercentage={spentToBudgetRatio.valueOf()}
                height={10}
              />
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
