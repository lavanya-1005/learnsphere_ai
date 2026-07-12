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
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type KYCUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  kyc_status: string;
  kyc_document_url: string | null;
  created_at: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";

const kycGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const kycCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.14)",
  },
};

export default function AdminKYC() {
  const [requests, setRequests] = useState<KYCUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    try {
      const response = await api.get("/admin/kyc-requests");
      setRequests(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load KYC requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateKYC = async (
    userId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      setUpdatingId(userId);
      setError("");

      await api.put(`/admin/users/${userId}/kyc`, {
        kyc_status: status,
      });

      setMessage(`Instructor KYC ${status}.`);
      await loadRequests();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to update KYC status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const viewDocument = (url: string | null) => {
    if (!url) {
      setError("No KYC document available.");
      return;
    }

    window.open(`${API_BASE_URL}${url}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1050, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="KYC Verification"
          subtitle="Review instructor documents before allowing course creation."
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
        ) : requests.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No submitted KYC requests are pending.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {requests.map((request, index) => (
              <Box
                key={request.id}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card sx={kycCardSx}>
                  <Box
                    sx={{
                      height: 5,
                      background: kycGradients[index % kycGradients.length],
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      alignItems: { xs: "flex-start", md: "center" },
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {request.name}
                      </Typography>

                      <Typography color="text.secondary">
                        {request.email}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Chip
                          label={request.role}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />

                        <Chip
                          label={request.kyc_status}
                          size="small"
                          sx={{
                            color: "white",
                            fontWeight: 800,
                            background:
                              kycGradients[index % kycGradients.length],
                          }}
                        />
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => viewDocument(request.kyc_document_url)}
                      sx={{ borderRadius: 3, fontWeight: 800 }}
                    >
                      View Document
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      disabled={updatingId === request.id}
                      onClick={() => updateKYC(request.id, "approved")}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #22c55e, #14b8a6)",
                      }}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      disabled={updatingId === request.id}
                      onClick={() => updateKYC(request.id, "rejected")}
                      sx={{ borderRadius: 3, fontWeight: 800 }}
                    >
                      Reject
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}