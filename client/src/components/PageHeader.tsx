import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    gradient?: boolean;
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    gradient = true
}: PageHeaderProps) {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
        }}>
            <Box>
                <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={gradient ? {
                        background: 'linear-gradient(45deg, #6C5DD3 30%, #00E5FF 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    } : {}}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actions && <Box>{actions}</Box>}
        </Box>
    );
}
