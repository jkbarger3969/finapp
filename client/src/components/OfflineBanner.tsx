import { Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useOnlineStatus } from '../context/OnlineStatusContext';

export default function OfflineBanner() {
    const { isOnline } = useOnlineStatus();

    if (isOnline) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                py: 1,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                zIndex: 9999,
                boxShadow: 2,
            }}
        >
            <WifiOffIcon fontSize="small" />
            <Typography variant="body2" fontWeight="bold">
                You are offline. Viewing cached data. Changes cannot be saved until reconnected.
            </Typography>
        </Box>
    );
}
