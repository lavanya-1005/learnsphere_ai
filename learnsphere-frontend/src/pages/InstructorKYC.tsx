import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import type { User } from "../types/user";

const API_BASE_URL = "http://127.0.0.1:8000";

const kycGradient = "linear-gradient(135deg, #7c3aed, #06b6d4)";
const approvedGradient = "linear-gradient(135deg, #22c55e, #14b8a6)";

const kycCardSx = {
  borderRadius: 5,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 22px 55px rgba(15, 23, 42, 0.12)",
};

export default function InstructorKYC() {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch {
      setError("Unable to load KYC status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const uploadKYC = async () => {
    if (!file) {
      setError("Select a KYC document.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      await api.post("/users/me/kyc", formData);

      setMessage("KYC document submitted successfully.");
      setFile(null);
      await loadProfile();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to upload KYC document."
      );
    } finally {
      setUploading(false);
    }
  };

  const statusColor = () => {
    if (user?.kyc_status === "approved") return "success";
    if (user?.kyc_status === "rejected") return "error";
    if (user?.kyc_status === "submitted") return "warning";
    return "default";
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 750, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Instructor Verification"
          subtitle="Submit your identity document and review your KYC status."
          backTo="/dashboard"
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 3 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            severity="success"
            sx={{ mb: 2, borderRadius: 3 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card sx={kycCardSx}>
              <Box
                sx={{
                  p: 4,
                  color: "white",
                  background:
                    user?.kyc_status === "approved"
                      ? approvedGradient
                      : kycGradient,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.14)",
                    top: -50,
                    right: -35,
                  }}
                />

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, position: "relative", zIndex: 1 }}
                >
                  Verification Status
                </Typography>

                <Chip
                  label={user?.kyc_status?.toUpperCase() || "PENDING"}
                  color={statusColor()}
                  sx={{
                    mt: 2,
                    fontWeight: 900,
                    background: "white",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </Box>

              <CardContent sx={{ p: 4 }}>
                {user?.kyc_document_url && (
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        window.open(
                          `${API_BASE_URL}${user.kyc_document_url}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      sx={{ borderRadius: 3, fontWeight: 800 }}
                    >
                      View Uploaded Document
                    </Button>
                  </Box>
                )}

                {user?.kyc_status !== "approved" && (
                  <>
                    <Typography sx={{ mb: 2 }}>
                      Upload a PDF, JPG, JPEG, or PNG identity document.
                    </Typography>

                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ borderRadius: 3, fontWeight: 800 }}
                    >
                      Select Document
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(event) =>
                          setFile(event.target.files?.[0] || null)
                        }
                      />
                    </Button>

                    {file && (
                      <Typography sx={{ mt: 2 }}>
                        Selected: {file.name}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={!file || uploading}
                      onClick={uploadKYC}
                      sx={{
                        mt: 3,
                        borderRadius: 3,
                        fontWeight: 900,
                        background: kycGradient,
                        boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                      }}
                    >
                      {uploading ? "Uploading..." : "Submit KYC"}
                    </Button>
                  </>
                )}

                {user?.kyc_status === "approved" && (
                  <Alert severity="success" sx={{ borderRadius: 3 }}>
                    Your KYC is approved. You can create and manage courses.
                  </Alert>
                )}

                {user?.kyc_status === "rejected" && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }}>
                    Your KYC was rejected. Upload a valid document again.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}