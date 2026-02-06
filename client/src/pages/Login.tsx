import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        const fetchAuthUrl = async () => {
            try {
                const response = await fetch('/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `query { googleAuthUrl { url } }`,
                    }),
                });
                const result = await response.json();
                if (result.data?.googleAuthUrl?.url) {
                    setGoogleAuthUrl(result.data.googleAuthUrl.url);
                }
            } catch (e) {
                console.error('Failed to fetch Google auth URL:', e);
            }
        };
        fetchAuthUrl();
    }, []);

    useEffect(() => {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Google sign-in was cancelled or failed. Please try again.');
            return;
        }

        if (code) {
            setIsLoading(true);
            setError(null);
            login(code)
                .then(() => {
                    navigate('/');
                })
                .catch((err) => {
                    setError(err.message || 'Authentication failed. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [searchParams, login, navigate]);

    const handleGoogleLogin = () => {
        if (googleAuthUrl) {
            window.location.href = googleAuthUrl;
        } else {
            setError('Unable to initiate Google sign-in. Please refresh and try again.');
        }
    };

    if (authLoading || isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress size={48} />
                <Typography sx={{ mt: 2 }} color="text.secondary">
                    {isLoading ? 'Signing you in...' : 'Loading...'}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            {/* Decorative Glow */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(108, 93, 211, 0.2) 0%, rgba(0, 229, 255, 0.1) 30%, transparent 70%)',
                    zIndex: 0,
                    filter: 'blur(60px)',
                    animation: 'pulse 10s infinite',
                    '@keyframes pulse': {
                        '0%': { transform: 'scale(1)', opacity: 0.5 },
                        '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                        '100%': { transform: 'scale(1)', opacity: 0.5 },
                    },
                }}
            />

            <Card sx={{ maxWidth: 400, width: '100%', position: 'relative', zIndex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            background: (theme: any) => theme.device?.linearGradient || 'linear-gradient(135deg, #6C5DD3 0%, #00E5FF 100%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            mb: 1
                        }}
                    >
                        FinApp
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                        Church Financial Management System
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        disabled={!googleAuthUrl}
                        sx={{
                            py: 2,
                            px: 4,
                            width: '100%',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600
                        }}
                    >
                        Sign in with Google
                    </Button>

                    <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ mt: 4 }}
                    >
                        Only @lonestarcowboychurch.org accounts are allowed
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
