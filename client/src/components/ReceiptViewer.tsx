import { useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogContent,
    Stack,
    Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useMutation } from "urql";

const DELETE_ATTACHMENT_MUTATION = `
  mutation DeleteAttachment($id: ID!) {
    deleteAttachment(id: $id) {
      deletedAttachment {
        id
        deleted
      }
    }
  }
`;

interface Attachment {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
}

interface ReceiptViewerProps {
    attachments: Attachment[];
    editable?: boolean;
    onDeleteComplete?: () => void;
}

export const ReceiptViewer = ({
    attachments,
    editable = false,
    onDeleteComplete,
}: ReceiptViewerProps) => {
    const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
    const [, deleteAttachment] = useMutation(DELETE_ATTACHMENT_MUTATION);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this receipt?")) {
            await deleteAttachment({ id });
            if (onDeleteComplete) onDeleteComplete();
        }
    };

    if (!attachments || attachments.length === 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Attachments ({attachments.length})
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {attachments.map((file) => {
                    const isImage = file.mimeType.startsWith("image/");

                    return (
                        <Box
                            key={file.id}
                            sx={{
                                position: "relative",
                                width: 80,
                                height: 80,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                overflow: "hidden",
                                cursor: "pointer",
                                "&:hover .actions": {
                                    opacity: 1,
                                },
                            }}
                            onClick={() => setPreviewFile(file)}
                        >
                            {isImage ? (
                                <img
                                    src={file.url}
                                    alt={file.filename}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "grey.100",
                                    }}
                                >
                                    <InsertDriveFileIcon color="action" />
                                </Box>
                            )}

                            {/* Hover Actions */}
                            <Box
                                className="actions"
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: "rgba(0,0,0,0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: 0,
                                    transition: "opacity 0.2s",
                                }}
                            >
                                <IconButton
                                    size="small"
                                    sx={{ color: "white" }}
                                    onClick={() => setPreviewFile(file)}
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                                {editable && (
                                    <IconButton
                                        size="small"
                                        sx={{ color: "white" }}
                                        onClick={(e) => handleDelete(file.id, e)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Stack>

            {/* Preview Dialog */}
            <Dialog
                open={!!previewFile}
                onClose={() => setPreviewFile(null)}
                maxWidth="lg"
            >
                <DialogContent sx={{ p: 0, position: 'relative', minWidth: 300, minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {previewFile && (
                        <>
                            {/* Close button - top right */}
                            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}>
                                <Tooltip title="Close">
                                    <IconButton
                                        onClick={() => setPreviewFile(null)}
                                        size="small"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            
                            {/* Download button - top left (only for images since PDFs have built-in controls) */}
                            {previewFile.mimeType.startsWith("image/") && (
                                <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}>
                                    <Tooltip title="Download">
                                        <IconButton
                                            component="a"
                                            href={previewFile.url}
                                            target="_blank"
                                            download
                                            size="small"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                            
                            {previewFile.mimeType.startsWith("image/") ? (
                                <img
                                    src={previewFile.url}
                                    alt={previewFile.filename}
                                    style={{ maxWidth: "100%", maxHeight: "80vh" }}
                                />
                            ) : (
                                <iframe
                                    src={previewFile.url}
                                    title={previewFile.filename}
                                    style={{ width: "80vw", height: "80vh", border: "none" }}
                                />
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};
