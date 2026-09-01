import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import { MapReferenceDataResponse } from "../../shared/ipcTypes";
import { allAmbiguousResolved, buildOverridesFromSelections, keyFor } from "../lib/resolveAmbiguous";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function MapReferenceStep({ onNext, onBack }: Props) {
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dryRun, setDryRun] = useState<MapReferenceDataResponse | null>(null);
    const [applied, setApplied] = useState<MapReferenceDataResponse | null>(null);
    const [selections, setSelections] = useState<Record<string, string>>({});

    const runDryRun = () => {
        setLoading(true);
        setError(null);
        window.syncApi
            .mapReferenceData({ dryRun: true, overrides: {} })
            .then(setDryRun)
            .catch((err) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    };

    useEffect(runDryRun, []);

    const ambiguousItems = dryRun?.reports.flatMap((r) => r.ambiguous) ?? [];
    const canApply = allAmbiguousResolved(ambiguousItems, selections);

    const handleApply = async () => {
        setApplying(true);
        setError(null);
        try {
            const overrides = buildOverridesFromSelections(
                ambiguousItems.map((item) => ({
                    collection: item.collection,
                    oldId: item.oldId,
                    chosenId: selections[keyFor(item)] ?? "",
                }))
            );
            const result = await window.syncApi.mapReferenceData({ dryRun: false, overrides });
            setApplied(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setApplying(false);
        }
    };

    const active = applied ?? dryRun;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Map reference data (categories, departments, accounts, fiscal years)
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 3 }}>
                        <CircularProgress size={20} />
                        <Typography>Matching by business key...</Typography>
                    </Box>
                )}

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {active && (
                    <Table size="small" sx={{ mb: 2 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Collection</TableCell>
                                <TableCell align="right">Matched</TableCell>
                                <TableCell align="right">{applied ? "Created" : "Will create"}</TableCell>
                                <TableCell align="right">Ambiguous</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {active.reports.map((r) => (
                                <TableRow key={r.collection}>
                                    <TableCell>{r.collection}</TableCell>
                                    <TableCell align="right">{r.matched}</TableCell>
                                    <TableCell align="right">{applied ? r.created : r.unmatched.length}</TableCell>
                                    <TableCell align="right">{r.ambiguous.length}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {!applied && ambiguousItems.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            These matched more than one candidate on the new server - pick the right one for
                            each before applying:
                        </Typography>
                        {ambiguousItems.map((item) => {
                            const k = keyFor(item);
                            return (
                                <Stack key={k} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                                    <Typography sx={{ minWidth: 220 }}>
                                        {item.collection}: <strong>{item.key}</strong>
                                    </Typography>
                                    <Select
                                        size="small"
                                        value={selections[k] ?? ""}
                                        onChange={(e) => setSelections((s) => ({ ...s, [k]: e.target.value }))}
                                        displayEmpty
                                        sx={{ minWidth: 260 }}
                                    >
                                        <MenuItem value="" disabled>
                                            Choose the correct match...
                                        </MenuItem>
                                        {item.candidates.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.label} ({c.id})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            );
                        })}
                    </Alert>
                )}

                {applied && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Applied - reference data on the new server is now mapped and ready for entry syncing.
                    </Alert>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button onClick={onBack}>Back</Button>
                    {!applied && (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleApply}
                            disabled={loading || applying || !canApply}
                        >
                            {applying ? <CircularProgress size={20} color="inherit" /> : "Apply Mapping"}
                        </Button>
                    )}
                    <Button variant="contained" onClick={onNext} disabled={!applied}>
                        Next
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
