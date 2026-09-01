import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";

import { SyncBudgetsResponse } from "../../shared/ipcTypes";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function SyncBudgetsStep({ onNext, onBack }: Props) {
    const [include, setInclude] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dryRun, setDryRun] = useState<SyncBudgetsResponse | null>(null);
    const [applied, setApplied] = useState<SyncBudgetsResponse | null>(null);

    const run = async (isDryRun: boolean) => {
        setLoading(true);
        setError(null);
        try {
            const result = await window.syncApi.syncBudgets({ dryRun: isDryRun });
            if (isDryRun) setDryRun(result);
            else setApplied(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const summary = applied ?? dryRun;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Sync budgets (optional)
                </Typography>

                <FormControlLabel
                    control={<Checkbox checked={include} onChange={(e) => setInclude(e.target.checked)} />}
                    label="Include budget allocations in this sync"
                    sx={{ mb: 2 }}
                />

                {include && (
                    <>
                        <Button variant="outlined" onClick={() => run(true)} disabled={loading} sx={{ mb: 2 }}>
                            {loading && !dryRun ? <CircularProgress size={18} /> : "Run Dry Run"}
                        </Button>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {summary && (
                            <Box sx={{ mb: 2 }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Would insert / Inserted</TableCell>
                                            <TableCell align="right">{summary.inserted}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Would update / Updated</TableCell>
                                            <TableCell align="right">{summary.updated}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Unchanged</TableCell>
                                            <TableCell align="right">{summary.unchanged}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Skipped (unresolved fiscal year/owner)</TableCell>
                                            <TableCell align="right">{summary.skippedUnresolved}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>
                        )}

                        {applied && <Alert severity="success" sx={{ mb: 2 }}>Applied.</Alert>}
                    </>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button onClick={onBack}>Back</Button>
                    {include && dryRun && !applied && (
                        <Button variant="contained" color="warning" onClick={() => run(false)} disabled={loading}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : "Apply"}
                        </Button>
                    )}
                    <Button variant="contained" onClick={onNext} disabled={include && dryRun !== null && !applied}>
                        Next
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
