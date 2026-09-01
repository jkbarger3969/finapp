import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";

import { SyncEntriesResponse } from "../../shared/ipcTypes";

interface Props {
    entriesResult: SyncEntriesResponse | null;
    onRunAgain: () => void;
}

export default function SummaryStep({ entriesResult, onRunAgain }: Props) {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Done for now
                </Typography>

                <Alert severity="success" sx={{ mb: 2 }}>
                    {entriesResult
                        ? `Synced ${entriesResult.inserted} new and ${entriesResult.updated} updated entries from the old server to the new server.`
                        : "No changes were applied this run."}
                </Alert>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    While the old server is still in use, come back and run "Sync Entries" again (it only
                    picks up what's changed since last time, and re-running is always safe - it can never
                    create duplicates). Once the old server is retired, verify the entry counts match on
                    both servers before decommissioning it.
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={onRunAgain}>
                        Run Sync Entries Again
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
