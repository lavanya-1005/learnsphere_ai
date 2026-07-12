import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type WalletData = {
  id: number;
  user_id: number;
  balance: string;
  created_at: string;
};

const walletCardSx = {
  borderRadius: 5,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 22px 55px rgba(15, 23, 42, 0.12)",
};

export default function Wallet() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadWallet = async () => {
    try {
      setLoading(true);
      const response = await api.get("/payments/wallet");
      setWallet(response.data);
    } catch {
      setError("Unable to load wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleTopUp = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    try {
      setError("");
      await api.post("/payments/wallet/topup", {
        amount: value,
      });

      setAmount("");
      setMessage("Wallet topped up successfully.");
      await loadWallet();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Wallet top-up failed."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 760, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Wallet"
          subtitle="Manage your balance and payments."
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
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
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card sx={walletCardSx}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  color: "white",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #7c3aed 55%, #0f766e 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.14)",
                    top: -60,
                    right: -40,
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    bottom: -35,
                    left: -25,
                  }}
                />

                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 4,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.24)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: 38 }} />
                </Box>

                <Typography
                  sx={{
                    mt: 3,
                    opacity: 0.88,
                    fontWeight: 700,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  Available Balance
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  ₹{Number(wallet?.balance || 0).toFixed(2)}
                </Typography>
              </Box>

              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Add Money
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Enter an amount and instantly top up your wallet.
                </Typography>

                <TextField
                  type="number"
                  label="Amount"
                  fullWidth
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  sx={{ mt: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleTopUp}
                  sx={{
                    mt: 2,
                    py: 1.3,
                    borderRadius: 3,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.28)",
                  }}
                >
                  Top Up Wallet
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  onClick={() => navigate("/payment-history")}
                  sx={{
                    mt: 2,
                    py: 1.2,
                    borderRadius: 3,
                    fontWeight: 800,
                    borderColor: "rgba(37, 99, 235, 0.35)",
                    background: "rgba(255,255,255,0.72)",
                  }}
                >
                  View Payment History
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}