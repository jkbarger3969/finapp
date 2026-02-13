import { Box, Skeleton, Card, CardContent, Grid2 as Grid } from "@mui/material";

export const DashboardSkeleton = () => {
    return (
        <Grid container spacing={3}>
            {/* Summary Cards Row */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
                        <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Department Budget Cards */}
            {[1, 2, 3].map((i) => (
                <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
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
