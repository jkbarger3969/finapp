import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";

import { ServerSide, VerifyResult } from "../../shared/ipcTypes";

interface Props {
    side: ServerSide;
    title: string;
    defaultLocalPort: number;
    onConnected: (verify: VerifyResult) => void;
    onBack?: () => void;
}

export default function ConnectStep({ side, title, defaultLocalPort, onConnected, onBack }: Props) {
    const [mode, setMode] = useState<"tunnel" | "direct">("tunnel");
    const [sshHost, setSshHost] = useState("");
    const [sshPort, setSshPort] = useState("22");
    const [remotePort, setRemotePort] = useState("27017");
    const [localPort, setLocalPort] = useState(String(defaultLocalPort));
    const [uri, setUri] = useState("mongodb://localhost:27017");
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verify, setVerify] = useState<VerifyResult | null>(null);

    const handleConnect = async () => {
        setConnecting(true);
        setError(null);
        setVerify(null);
        try {
            const input =
                mode === "tunnel"
                    ? {
                          mode: "tunnel" as const,
                          sshHost,
                          sshPort: sshPort ? Number(sshPort) : undefined,
                          localPort: Number(localPort),
                          remotePort: remotePort ? Number(remotePort) : undefined,
                      }
                    : { mode: "direct" as const, uri };

            await window.syncApi.connect({ side, input });
            const result = await window.syncApi.verify(side);
            setVerify(result);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setConnecting(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {title}
                </Typography>

                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, v) => v && setMode(v)}
                    size="small"
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="tunnel">SSH Tunnel</ToggleButton>
                    <ToggleButton value="direct">Direct Mongo URI</ToggleButton>
                </ToggleButtonGroup>

                {mode === "tunnel" ? (
                    <Stack spacing={2} sx={{ mb: 2 }}>
                        <TextField
                            label="SSH host (user@host)"
                            value={sshHost}
                            onChange={(e) => setSshHost(e.target.value)}
                            placeholder="keith@172.16.2.5"
                            fullWidth
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="SSH port"
                                value={sshPort}
                                onChange={(e) => setSshPort(e.target.value)}
                                sx={{ width: 140 }}
                            />
                            <TextField
                                label="Remote Mongo port"
                                value={remotePort}
                                onChange={(e) => setRemotePort(e.target.value)}
                                sx={{ width: 180 }}
                                helperText="Port mongod listens on, on that server"
                            />
                            <TextField
                                label="Local tunnel port"
                                value={localPort}
                                onChange={(e) => setLocalPort(e.target.value)}
                                sx={{ width: 160 }}
                                helperText="On this machine"
                            />
                        </Stack>
                    </Stack>
                ) : (
                    <TextField
                        label="MongoDB URI"
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                )}

                <Button variant="contained" onClick={handleConnect} disabled={connecting}>
                    {connecting ? <CircularProgress size={20} color="inherit" /> : "Connect & Verify"}
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                        {error}
                    </Alert>
                )}

                {verify && (
                    <Box sx={{ mt: 3 }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Connected. Database: <strong>{verify.dbName}</strong> - confirm this looks like
                            the right server before continuing.
                        </Alert>
                        <Table size="small">
                            <TableBody>
                                {Object.entries(verify.counts).map(([name, count]) => (
                                    <TableRow key={name}>
                                        <TableCell>{name}</TableCell>
                                        <TableCell align="right">
                                            <Chip label={count} size="small" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    {onBack && <Button onClick={onBack}>Back</Button>}
                    <Button
                        variant="contained"
                        color="success"
                        disabled={!verify}
                        onClick={() => verify && onConnected(verify)}
                    >
                        This looks right - Continue
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
