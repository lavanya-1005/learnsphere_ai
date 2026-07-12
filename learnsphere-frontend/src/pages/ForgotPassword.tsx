import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { motion } from "framer-motion";
import api from "../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const requestResetToken = async () => {
    if (!email.trim()) {
      setError("Enter your registered email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setResetToken(response.data.reset_token);
      setStep("reset");
      setMessage(
        "Reset token generated. In production, this token will be sent by email."
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to generate reset token."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!resetToken.trim() || newPassword.length < 6) {
      setError(
        "Enter the reset token and a password with at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/reset-password", {
        reset_token: resetToken.trim(),
        new_password: newPassword,
      });

      setMessage("Password reset successfully. Redirecting to login.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          "linear-gradient(135deg, #020617 0%, #1e3a8a 52%, #7c3aed 100%)",
      }}
    >
      <Box
        component={motion.div}
        animate={{ y: [0, -18, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.42)",
          filter: "blur(45px)",
          top: 70,
          right: 100,
        }}
      />

      <Box
        component={motion.div}
        animate={{ y: [0, 22, 0], opacity: [0.4, 0.72, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(124, 58, 237, 0.44)",
          filter: "blur(45px)",
          bottom: 70,
          left: 100,
        }}
      />

      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 45, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 5,
          position: "relative",
          zIndex: 1,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 28px 80px rgba(15, 23, 42, 0.32)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                color: "white",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                boxShadow: "0 16px 34px rgba(37, 99, 235, 0.35)",
                mb: 2,
              }}
            >
              <LockResetIcon sx={{ fontSize: 34 }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Reset Password
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Recover access to your LearnSphere account.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {step === "email" ? (
            <>
              <TextField
                fullWidth
                label="Registered email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                onClick={requestResetToken}
                sx={{
                  mt: 3,
                  py: 1.3,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  boxShadow: "0 12px 28px rgba(37, 99, 235, 0.32)",
                  transition: "0.25s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 18px 36px rgba(37, 99, 235, 0.42)",
                  },
                }}
              >
                {loading ? "Generating..." : "Generate Reset Token"}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Reset token"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
              />

              <TextField
                fullWidth
                type="password"
                label="New password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                sx={{ mt: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                onClick={resetPassword}
                sx={{
                  mt: 3,
                  py: 1.3,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  boxShadow: "0 12px 28px rgba(37, 99, 235, 0.32)",
                  transition: "0.25s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 18px 36px rgba(37, 99, 235, 0.42)",
                  },
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          )}

          <Typography sx={{ textAlign: "center", mt: 3 }}>
            <Link to="/">Return to Login</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}