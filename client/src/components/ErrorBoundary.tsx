import { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Typography, Paper } from "@mui/material";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, bgcolor: '#0A0E17', color: 'white', minHeight: '100vh' }}>
                    <Paper sx={{ p: 4, bgcolor: '#151B2B' }}>
                        <Typography variant="h4" color="error" gutterBottom>
                            Something went wrong.
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                            {this.state.error?.toString()}
                        </Typography>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}
