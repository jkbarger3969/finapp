import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    Box,
    Typography,
    LinearProgress,
    Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useMutation } from "urql";

const UPLOAD_RECEIPT_MUTATION = `
  mutation UploadReceipt($entryId: ID!, $file: Upload!) {
    uploadReceipt(entryId: $entryId, file: $file) {
      attachment {
        id
        filename
        url
        uploadedAt
      }
    }
  }
`;

interface ReceiptUploadProps {
    entryId: string;
    onUploadComplete?: () => void;
}

export const ReceiptUpload = ({ entryId, onUploadComplete }: ReceiptUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, uploadReceipt] = useMutation(UPLOAD_RECEIPT_MUTATION);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            setUploading(true);
            setError(null);

            try {
                for (const file of acceptedFiles) {
                    if (file.size > 10 * 1024 * 1024) {
                        throw new Error(`File ${file.name} is too large (max 10MB)`);
                    }

                    const result = await uploadReceipt({
                        entryId,
                        file,
                    });

                    if (result.error) {
                        throw new Error(result.error.message);
                    }
                }
                if (onUploadComplete) {
                    onUploadComplete();
                }
            } catch (err: any) {
                setError(err.message || "Upload failed");
            } finally {
                setUploading(false);
            }
        },
        [entryId, uploadReceipt, onUploadComplete]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".heic"],
            "application/pdf": [".pdf"],
        },
        maxSize: 10485760, // 10MB
    });

    return (
        <Box sx={{ width: "100%" }}>
            <Box
                {...getRootProps()}
                sx={{
                    border: "2px dashed",
                    borderColor: isDragActive ? "primary.main" : "grey.300",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                    backgroundColor: isDragActive ? "action.hover" : "background.paper",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "action.hover",
                    },
                }}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                <Typography variant="body1" color="text.primary">
                    {isDragActive
                        ? "Drop the receipt here..."
                        : "Drag & drop receipt, or click to select"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Supports JPG, PNG, PDF (Max 10MB)
                </Typography>
            </Box>

            {uploading && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                        Uploading...
                    </Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};
