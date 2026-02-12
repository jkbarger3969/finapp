import { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper } from '@mui/material';
import PaymentCardsTab from '../components/admin/PaymentCardsTab';
import UsersTab from '../components/admin/UsersTab';
import AuditLogTab from '../components/admin/AuditLogTab';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Admin() {
    const { isSuperAdmin, isDeptAdmin } = useAuth();
    const [value, setValue] = useState(0);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    if (!isSuperAdmin && !isDeptAdmin) {
        return (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                <Typography variant="h5" color="text.secondary">
                    You do not have permission to access this page.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Admin Panel</Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
                        <Tab label="User Access" disabled={!isSuperAdmin} />
                        <Tab label="Payment Cards" />
                        <Tab label="Audit Log" disabled={!isSuperAdmin} />
                    </Tabs>
                </Box>
            </Paper>

            <CustomTabPanel value={value} index={0}>
                {isSuperAdmin && <UsersTab />}
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <PaymentCardsTab />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                {isSuperAdmin && <AuditLogTab />}
            </CustomTabPanel>
        </Box>
    );
}
