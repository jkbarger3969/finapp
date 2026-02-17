import { useLayout } from "../../context/LayoutContext";
import TopNav from "./TopNav";
import EntryFormDialog from "../EntryFormDialog";

import {
    Box,
} from "@mui/material";

interface MainLayoutProps {
    children: React.ReactNode;
}


export default function MainLayout({ children }: MainLayoutProps) {
    const { isEntryDialogOpen, closeEntryDialog } = useLayout();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', flexDirection: 'column' }}>
            <TopNav />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    mt: 8, // Ensure content is below TopNav
                    transition: "width 0.3s ease",
                }}
            >
                <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                    {children}
                </Box>
            </Box>

            <EntryFormDialog
                open={isEntryDialogOpen}
                onClose={closeEntryDialog}
                onSuccess={() => {
                    closeEntryDialog();
                    window.location.reload();
                }}
            />
        </Box>
    );
}
