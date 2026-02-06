import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Divider,
    Typography,
    CircularProgress,
} from "@mui/material";
import { useQuery } from "urql";
import { ReceiptUpload } from "./ReceiptUpload";
import { ReceiptViewer } from "./ReceiptViewer";

const GET_ENTRY_ATTACHMENTS = `
  query GetEntryAttachments($id: ID!) {
     entry(id: $id) {
       id
       attachments {
         id
         filename
         gcsUrl
         mimeType
         uploadedAt
       }
     }
  }
`;

interface ReceiptManagerDialogProps {
    open: boolean;
    onClose: () => void;
    entryId: string | null;
}

export const ReceiptManagerDialog = ({
    open,
    onClose,
    entryId,
}: ReceiptManagerDialogProps) => {
    const [result, reexecuteQuery] = useQuery({
        query: GET_ENTRY_ATTACHMENTS,
        variables: { id: entryId! },
        pause: !open || !entryId,
    });

    const { data, fetching, error } = result;

    const handleRefresh = () => {
        reexecuteQuery({ requestPolicy: "network-only" });
    };

    if (!entryId) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Manage Receipts</DialogTitle>
            <DialogContent>
                {fetching ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">Failed to load receipts</Typography>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <ReceiptViewer
                            attachments={data?.entry?.attachments || []}
                            editable={true}
                            onDeleteComplete={handleRefresh}
                        />

                        <Divider />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Upload New Receipt</Typography>
                            <ReceiptUpload
                                entryId={entryId}
                                onUploadComplete={handleRefresh}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
