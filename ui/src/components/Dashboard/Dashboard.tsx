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
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import numeral from "numeral";
import { red, green, orange, grey } from "@material-ui/core/colors";
import { Color, FormControl, InputLabel } from "@material-ui/core";
import Fraction from "fraction.js";
import { Select, SelectProps } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";

import {
  GetReportDataQuery,
  GetReportDataQueryVariables,
  EntryType,
  GetReportDataDeptFragment as DepartmentFragment,
  FiscalYear,
  DepartmentsWhere,
  AccountsWhere,
  ReportDataOtherEntryRefundFragment,
} from "../../apollo/graphTypes";
import { deserializeRational, serializeDate } from "../../apollo/scalars";
import { GET_REPORT_DATA } from "./ReportData.gql";
import {
  UpsertEntry,
  UpsertEntryProps,
} from "../Journal/DataGrid/forms/UpsertEntry";
import { dialogProps } from "../Journal/DataGrid/forms/shared";

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

const Dashboard = (props: {
  deptId: string;
  selectableDepts: DepartmentsWhere;
  selectableAccounts: AccountsWhere;
}): JSX.Element => {
  const { deptId, selectableAccounts, selectableDepts } = props;

  const [addEntryOpen, setAddEntryOpen] = useState<boolean>(false);

  const [year, setYear] = useState<Date>(new Date(new Date().toDateString()));
  const variables = useMemo<GetReportDataQueryVariables>(
    () => ({
      deptId,
      where: {
        fiscalYear: {
          date: {
            eq: serializeDate(year),
          },
        },
        department: {
          id: {
            lte: deptId,
          },
        },
        deleted: false,
      },
      whereRefunds: {
        fiscalYear: {
          date: {
            eq: serializeDate(year),
          },
        },
        deleted: false,
      },
      whereRefundEntries: {
        department: {
          id: {
            lte: deptId,
          },
        },
        fiscalYear: {
          nor: [
            {
              date: {
                eq: serializeDate(year),
              },
            },
          ],
        },
        deleted: false,
      },
      filterRefunds: true,
    }),
    [deptId, year]
  );

  const { loading, error, data } = useQuery<
    GetReportDataQuery,
    GetReportDataQueryVariables
  >(GET_REPORT_DATA, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const isLoading = loading && !data?.entries;

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
    return data?.entries || [];
  }, [data?.entries]);
  const extraneousRefunds = useMemo(() => {
    return data?.entryRefunds || [];
  }, [data?.entryRefunds]);
  const deptName = data?.department?.name || "";

  useEffect(() => {
    document.title = deptName;
  }, [deptName]);

  const department = data?.department || null;

  const { totalRemaining, budget, spentToBudgetRatio, deptReports, uBudget } =
    useMemo<{
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

      const depts: (GetReportDataQuery["department"] | DepartmentFragment)[] =
        [];

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

      const otherRefundsMap = extraneousRefunds.reduce(
        (otherRefundsMap, otherRefund) => {
          otherRefundsMap.set(otherRefund.id, otherRefund);

          return otherRefundsMap;
        },
        new Map<string, ReportDataOtherEntryRefundFragment>()
      );

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
          // Remove if accounted for
          otherRefundsMap.delete(refund.id);
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

        if (entry.category.type === EntryType.Credit) {
          uSpent = uSpent.sub(entryTotal);
          deptReport.spent = deptReport.spent.sub(entryTotal);
        } else {
          uSpent = uSpent.add(entryTotal);
          deptReport.spent = deptReport.spent.add(entryTotal);
        }
      }

      // Calculate other refunds
      for (const otherRefund of otherRefundsMap.values()) {
        const entry = otherRefund.entry;
        const refundTotal = deserializeRational(otherRefund.total);
        const deptReport = deptReports.get(entry.department.id) as DeptReport;

        if (entry.category.type === EntryType.Debit) {
          uSpent = uSpent.sub(refundTotal);
          deptReport.spent = deptReport.spent.sub(refundTotal);
        } else {
          uSpent = uSpent.add(refundTotal);
          deptReport.spent = deptReport.spent.add(refundTotal);
        }
      }

      return {
        totalRemaining: numeral(uBudget.sub(uSpent).valueOf()).format(
          "$0,0.00"
        ),
        budget: numeral(uBudget.valueOf()).format("$0,0.00"),
        spentToBudgetRatio:
          uBudget.n === 0
            ? uSpent.s === -1
              ? 0
              : 1
            : uSpent.div(uBudget).valueOf(),
        deptReports,
        uBudget,
      };
    }, [department, extraneousRefunds, fiscalYear?.id, entries]);

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

  const onClickAddEntry = useCallback(
    () => setAddEntryOpen(true),
    [setAddEntryOpen]
  );

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

  const upsertEntryProps: UpsertEntryProps = useMemo<UpsertEntryProps>(
    () => ({
      dialogProps: {
        ...dialogProps,
        open: addEntryOpen,
        onClose: () => setAddEntryOpen(false),
      },
      entryProps: {
        paymentMethod: { accounts: selectableAccounts },
        department: {
          root: selectableDepts,
        },
      },
      refetchQueries: {
        onNewEntry: [
          {
            query: GET_REPORT_DATA,
            variables,
          },
        ],
      },
    }),
    [addEntryOpen, selectableAccounts, selectableDepts, variables]
  );

  if (isLoading) {
    return <p>Loading...</p>;
  } else if (error) {
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

        <UpsertEntry {...upsertEntryProps} />
      </Container>
    </Box>
  );
};

export default Dashboard;
