import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControlLabel,
    LinearProgress,
    Radio,
    RadioGroup,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";

import { SyncEntriesResponse } from "../../shared/ipcTypes";

interface Props {
    unwrapLegacyNodeIdRefs?: { idKey: "id" | "node" };
    onNext: (result: SyncEntriesResponse) => void;
    onBack: () => void;
}

export default function SyncEntriesStep({ unwrapLegacyNodeIdRefs, onNext, onBack }: Props) {
    const [mode, setMode] = useState<"full" | "incremental">("full");
    const [checkpointIso, setCheckpointIso] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dryRun, setDryRun] = useState<SyncEntriesResponse | null>(null);
    const [applied, setApplied] = useState<SyncEntriesResponse | null>(null);

    useEffect(() => {
        window.syncApi.getCheckpoint().then((cp) => {
            if (cp?.entries?.lastUpdateIso) {
                setCheckpointIso(cp.entries.lastUpdateIso);
                setMode("incremental");
            }
        });
    }, []);

    useEffect(() => {
        return window.syncApi.onSyncEntriesProgress(setProgress);
    }, []);

    const run = async (isDryRun: boolean) => {
        setLoading(true);
        setProgress(0);
        setError(null);
        try {
            const result = await window.syncApi.syncEntries({
                dryRun: isDryRun,
                full: mode === "full",
                unwrapLegacyNodeIdRefs,
            });
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
                    Sync entries (transactions)
                </Typography>

                <RadioGroup
                    row
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "full" | "incremental")}
                    sx={{ mb: 2 }}
                >
                    <FormControlLabel value="full" control={<Radio />} label="Full sync (everything)" />
                    <FormControlLabel
                        value="incremental"
                        control={<Radio />}
                        label={
                            checkpointIso
                                ? `Since last run (${new Date(checkpointIso).toLocaleString()})`
                                : "Since last run (no prior run found)"
                        }
                        disabled={!checkpointIso}
                    />
                </RadioGroup>

                <Button variant="outlined" onClick={() => run(true)} disabled={loading} sx={{ mb: 2 }}>
                    {loading && !dryRun ? <CircularProgress size={18} /> : "Run Dry Run"}
                </Button>

                {loading && (
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="text.secondary">
                            Processed {progress} entries so far...
                        </Typography>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>{error}</Alert>}

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
                                    <TableCell>Errors</TableCell>
                                    <TableCell align="right">{summary.errors}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Unresolved references (left as old-server id)</TableCell>
                                    <TableCell align="right">{summary.unresolvedRefCount}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Out-of-scope references (users/businesses/people)</TableCell>
                                    <TableCell align="right">{summary.outOfScopeRefCount}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        {summary.unresolvedRefCount > 0 && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Some entries reference a category/department/account that wasn't mapped. Go
                                back to "Map References" and re-run it, then come back here.
                            </Alert>
                        )}
                        {summary.errors > 0 && (
                            <Alert severity="error" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                                {summary.errorSamples.join("\n")}
                            </Alert>
                        )}
                    </Box>
                )}

                {applied && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Applied. A backup of the new server's entries was taken automatically before writing.
                    </Alert>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button onClick={onBack}>Back</Button>
                    {dryRun && !applied && (
                        <Button variant="contained" color="warning" onClick={() => run(false)} disabled={loading}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : "Apply"}
                        </Button>
                    )}
                    <Button variant="contained" onClick={() => applied && onNext(applied)} disabled={!applied}>
                        Next
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
