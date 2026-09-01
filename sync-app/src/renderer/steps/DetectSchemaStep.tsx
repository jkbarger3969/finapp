import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { CollectionCensus, DetectSchemaResult } from "../../shared/ipcTypes";

const COLLECTIONS = ["entries", "categories", "departments", "accounts", "budgets", "fiscalYears"];

interface Props {
    unwrapLegacyNodeIdRefs?: { idKey: "id" | "node" };
    onUnwrapChange: (value: { idKey: "id" | "node" } | undefined) => void;
    onNext: () => void;
    onBack: () => void;
}

function CensusTable({ census }: { census: CollectionCensus }) {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell align="right">Present</TableCell>
                    <TableCell>Types</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {census.fields.map((f) => (
                    <TableRow key={f.path}>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{f.path}</TableCell>
                        <TableCell align="right">
                            {f.count}/{census.sampleSize}
                        </TableCell>
                        <TableCell>{f.types.join(", ")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function DetectSchemaStep({ unwrapLegacyNodeIdRefs, onUnwrapChange, onNext, onBack }: Props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<DetectSchemaResult | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        window.syncApi
            .detectSchema({ collections: COLLECTIONS, sampleSize: 500 })
            .then((res) => {
                if (!cancelled) setResult(res);
            })
            .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const unexpectedEntries = Object.entries(result?.unexpectedTopLevelFields ?? {});

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Detect schema differences
                </Typography>

                {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 3 }}>
                        <CircularProgress size={20} />
                        <Typography>Sampling both servers...</Typography>
                    </Box>
                )}

                {error && <Alert severity="error">{error}</Alert>}

                {result && (
                    <>
                        {unexpectedEntries.length > 0 ? (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                The old server has fields not in the new server's current schema:
                                <ul>
                                    {unexpectedEntries.map(([collection, fields]) => (
                                        <li key={collection}>
                                            <strong>{collection}</strong>: {fields.join(", ")}
                                        </li>
                                    ))}
                                </ul>
                                These pass through untouched by default, which is usually fine for legacy
                                leftover fields. If one of the fields above (like <code>node</code>/
                                <code>id</code> pairs) is actually a reference that needs translating, use the
                                option below.
                            </Alert>
                        ) : (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                No unexpected top-level fields found on the old server.
                            </Alert>
                        )}

                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                Only enable this if you've confirmed the old server stores references as{" "}
                                <code>{"{ node, id }"}</code> pairs instead of a plain ID (a known older
                                finapp schema).
                            </Typography>
                            <RadioGroup
                                row
                                value={unwrapLegacyNodeIdRefs ? unwrapLegacyNodeIdRefs.idKey : "off"}
                                onChange={(e) =>
                                    onUnwrapChange(
                                        e.target.value === "off" ? undefined : { idKey: e.target.value as "id" | "node" }
                                    )
                                }
                            >
                                <FormControlLabel value="off" control={<Radio size="small" />} label="Off (default)" />
                                <FormControlLabel value="id" control={<Radio size="small" />} label="Unwrap using .id" />
                                <FormControlLabel value="node" control={<Radio size="small" />} label="Unwrap using .node" />
                            </RadioGroup>
                        </Alert>

                        {COLLECTIONS.map((collection) => (
                            <Accordion key={collection} disableGutters>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{collection}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
                                        <Box sx={{ flex: 1, minWidth: 320 }}>
                                            <Typography variant="subtitle2">Old server</Typography>
                                            {result.old[collection] && <CensusTable census={result.old[collection]} />}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 320 }}>
                                            <Typography variant="subtitle2">New server</Typography>
                                            {result.new[collection] && <CensusTable census={result.new[collection]} />}
                                        </Box>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button onClick={onBack}>Back</Button>
                    <Button variant="contained" onClick={onNext} disabled={loading || !result}>
                        Next
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
