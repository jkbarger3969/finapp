
import { Box, Skeleton, TableCell, TableRow, Table, TableBody, TableHead } from "@mui/material";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 5 }: TableSkeletonProps) => {
    return (
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Array.from(new Array(columns)).map((_, index) => (
                            <TableCell key={`header-${index}`}>
                                <Skeleton variant="text" width="60%" height={24} />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from(new Array(rows)).map((_, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                            {Array.from(new Array(columns)).map((_, colIndex) => (
                                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                                    <Skeleton variant="text" width={colIndex === 0 ? "40%" : "80%"} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};
