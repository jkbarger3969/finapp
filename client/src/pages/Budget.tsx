import { Box } from "@mui/material";
import PageHeader from "../components/PageHeader";
import BudgetAllocationTab from "../components/admin/BudgetAllocationTab";

export default function Budget() {
    return (
        <Box>
            <PageHeader
                title="Budget Allocations"
                subtitle="Manage budget allocations for departments"
            />
            <BudgetAllocationTab />
        </Box>
    );
}
