import { useQuery } from "urql";
import { Grid, Paper, Typography, Box, CircularProgress, Alert, Fade, Grow } from "@mui/material";
import { format, parseISO, startOfMonth } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDepartment } from "../context/DepartmentContext";

const GET_DASHBOARD_DATA = `
  query GetDashboardData($where: EntriesWhere) {
    entries(where: $where) {
      id
      description
      date
      total
      category {
        name
        type
      }
      department {
        name
      }
    }
  }
`;

const parseRational = (rationalStr: any) => {
    try {
        const r = typeof rationalStr === 'string' ? JSON.parse(rationalStr) : rationalStr;
        return (r.n / r.d) * r.s;
    } catch {
        return 0;
    }
};

const aggregateByMonth = (entries: any[]) => {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    entries.forEach((entry: any) => {
        const monthKey = format(startOfMonth(parseISO(entry.date)), 'MMM yyyy');
        const amount = Math.abs(parseRational(entry.total));

        if (!monthMap.has(monthKey)) {
            monthMap.set(monthKey, { income: 0, expenses: 0 });
        }

        const data = monthMap.get(monthKey)!;
        if (entry.category?.type === 'CREDIT') {
            data.income += amount;
        } else {
            data.expenses += amount;
        }
    });

    return Array.from(monthMap.entries())
        .map(([month, data]) => ({
            month,
            income: Math.round(data.income * 100) / 100,
            expenses: Math.round(data.expenses * 100) / 100,
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-12);
};

export default function Dashboard() {
    const { departmentId, fiscalYearId } = useDepartment();

    const where: any = { deleted: false };

    if (departmentId) {
        where.department = {
            id: { lte: departmentId },
        };
    }

    if (fiscalYearId) {
        where.fiscalYear = {
            id: { eq: fiscalYearId },
        };
    }

    const [result] = useQuery({
        query: GET_DASHBOARD_DATA,
        variables: { where },
        pause: !departmentId || !fiscalYearId,
    });
    const { data, fetching, error } = result;

    const recentEntries = data?.entries
        ? [...data.entries]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
        : [];
    const chartData = data?.entries ? aggregateByMonth(data.entries) : [];

    const stats = {
        totalEntries: data?.entries?.length || 0,
        thisMonth: chartData.length > 0
            ? chartData[chartData.length - 1].income - chartData[chartData.length - 1].expenses
            : 0,
        avgMonthlySpending: chartData.length > 0
            ? chartData.reduce((sum, m) => sum + m.expenses, 0) / chartData.length
            : 0,
        totalIncome: chartData.reduce((sum, m) => sum + m.income, 0),
        totalExpenses: chartData.reduce((sum, m) => sum + m.expenses, 0),
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grow in timeout={600}>
                        <Paper sx={{
                            p: 3,
                            height: 380, // Slightly taller
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Spending Trends</Typography>
                                <Typography variant="caption" color="text.secondary">Last 12 Months</Typography>
                            </Box>

                            {fetching && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}><CircularProgress /></Box>}
                            {error && <Alert severity="error">Error loading chart data</Alert>}
                            {chartData.length > 0 && (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6C5DD3" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6C5DD3" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="month" stroke="#8F9BB3" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#8F9BB3" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 18, 30, 0.9)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 12,
                                                backdropFilter: 'blur(10px)',
                                                color: '#fff',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                            }}
                                            itemStyle={{ fontSize: 13 }}
                                            labelStyle={{ fontWeight: 600, color: '#8F9BB3', marginBottom: 5 }}
                                            formatter={(value) => [`$${Number(value).toFixed(2)}`, undefined]}
                                        />
                                        <Area type="monotone" dataKey="income" name="Income" stroke="#00E5FF" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#6C5DD3" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </Paper>
                    </Grow>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Grow in timeout={800}>
                        <Paper sx={{
                            p: 4,
                            height: 380,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative background blob */}
                            <Box sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 150,
                                height: 150,
                                bgcolor: 'primary.main',
                                filter: 'blur(80px)',
                                opacity: 0.2,
                                borderRadius: '50%'
                            }} />

                            <Box>
                                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>Net Position</Typography>
                                <Typography variant="h3" color={stats.thisMonth >= 0 ? 'success.main' : 'error.main'} fontWeight={800} sx={{ mt: 1 }}>
                                    ${stats.thisMonth.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {stats.thisMonth >= 0 ? '+ Positive' : '- Negative'} cash flow this month
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                                    <Typography variant="caption" color="text.secondary">Income</Typography>
                                    <Typography variant="h6" color="secondary.main">${stats.totalIncome.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ flex: 1, p: 2, borderRadius: 3, bgcolor: 'rgba(108, 93, 211, 0.05)', border: '1px solid rgba(108, 93, 211, 0.1)' }}>
                                    <Typography variant="caption" color="text.secondary">Spending</Typography>
                                    <Typography variant="h6" color="primary.main">${stats.totalExpenses.toFixed(2)}</Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Monthly Average</Typography>
                                    <Typography variant="body2" fontWeight={600}>${stats.avgMonthlySpending.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Total Entries</Typography>
                                    <Typography variant="body2" fontWeight={600}>{stats.totalEntries}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grow>
                </Grid>

                <Grid size={12}>
                    <Fade in timeout={1000}>
                        <Paper sx={{
                            p: 3,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                        }}>
                            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>

                            {fetching && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
                            {error && <Alert severity="error">Error loading data: {error.message}</Alert>}

                            {recentEntries.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {recentEntries.map((entry: any) => {
                                        const amount = Math.abs(parseRational(entry.total));
                                        const isCredit = entry.category?.type === 'CREDIT';
                                        return (
                                            <Box key={entry.id} sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                p: 2,
                                                bgcolor: 'background.default',
                                                borderRadius: 2,
                                                alignItems: 'center',
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: 'action.hover', transform: 'translateX(8px)', boxShadow: 2 }
                                            }}>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {entry.description || "No Description"}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(parseISO(entry.date), 'MMM dd, yyyy')} • {entry.category?.name || "Uncategorized"}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body1" fontWeight="bold" color={isCredit ? 'success.main' : 'error.main'}>
                                                    {isCredit ? '+' : '-'}${amount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {recentEntries.length === 0 && !fetching && (
                                <Alert severity="info">No transactions found for the selected department and fiscal year.</Alert>
                            )}
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>
        </Box>
    );
}
