import { Box, Skeleton, Card, CardContent, Grid } from "@mui/material";

export const DashboardSkeleton = () => {
    return (
        <Grid container spacing={3}>
            {/* Quick Action Card */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Skeleton variant="text" width="60%" height={32} />
                        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: 2, borderRadius: 1 }} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Summary Cards */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="50%" height={16} />
                                <Skeleton variant="text" width="70%" height={36} sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="40%" height={16} />
                                <Skeleton variant="text" width="60%" height={36} sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="55%" height={16} />
                                <Skeleton variant="text" width="65%" height={36} sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>

            {/* Department Budget Cards */}
            {[1, 2, 3].map((i) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Skeleton variant="text" width="50%" height={28} />
                                <Skeleton variant="circular" width={24} height={24} />
                            </Box>
                            <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1, mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Skeleton variant="text" width="30%" height={20} />
                                <Skeleton variant="text" width="30%" height={20} />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Skeleton variant="text" width="80%" height={16} />
                                <Skeleton variant="text" width="60%" height={16} />
                                <Skeleton variant="text" width="70%" height={16} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
