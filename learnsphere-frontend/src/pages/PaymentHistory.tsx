import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import api from "../api/api";
import PageHeader from "../components/PageHeader";

type Payment = {
  id: number;
  user_id: number;
  course_id: number | null;
  amount: string;
  txn_id: string;
  status: string;
  type: string;
  created_at: string;
};

const paymentGradients = [
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #f97316, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
];

const paymentCardSx = {
  borderRadius: 4,
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 24px 55px rgba(15, 23, 42, 0.14)",
  },
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await api.get("/payments/history");
        setPayments(response.data);
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load payment history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Payment History"
          subtitle="View wallet top-ups and course purchases."
          backTo="/wallet"
        />

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : payments.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No transactions available.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {payments.map((payment, index) => (
              <Box
                key={payment.id}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card sx={paymentCardSx}>
                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      alignItems: { xs: "flex-start", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        background:
                          paymentGradients[index % paymentGradients.length],
                        color: "white",
                        boxShadow: "0 14px 28px rgba(37, 99, 235, 0.22)",
                      }}
                    >
                      <ReceiptLongIcon />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {payment.type === "wallet_topup"
                          ? "Wallet Top-up"
                          : "Course Purchase"}
                      </Typography>

                      <Typography color="text.secondary">
                        Transaction: {payment.txn_id}
                      </Typography>

                      {payment.course_id && (
                        <Typography color="text.secondary">
                          Course ID: {payment.course_id}
                        </Typography>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        {new Date(payment.created_at).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color:
                            payment.type === "wallet_topup"
                              ? "#16a34a"
                              : "#2563eb",
                        }}
                      >
                        ₹{Number(payment.amount).toFixed(2)}
                      </Typography>

                      <Chip
                        label={payment.status}
                        color={
                          payment.status === "success"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                        sx={{ mt: 1, fontWeight: 800 }}
                      />
                    </Box>
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