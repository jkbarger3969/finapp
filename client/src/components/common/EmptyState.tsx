
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    height?: number | string;
}

export const EmptyState = ({
    title = "No Data Found",
    description = "Try adjusting your filters or search terms.",
    icon = <SearchOffIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />,
    action,
    height = 400
}: EmptyStateProps) => {
    return (
        <Paper
            sx={{
                p: 4,
                height: height,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider'
            }}
            elevation={0}
        >
            <Box sx={{ mb: 2 }}>
                {icon}
            </Box>
            <Typography variant="h6" gutterBottom color="text.primary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: action ? 3 : 0 }}>
                {description}
            </Typography>

            {action && (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={action.onClick}
                    sx={{ mt: 2 }}
                >
                    {action.label}
                </Button>
            )}
        </Paper>
    );
};
