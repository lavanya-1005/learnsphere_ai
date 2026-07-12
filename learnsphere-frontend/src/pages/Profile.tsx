import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import type { User } from "../types/user";

const profileGradient = "linear-gradient(135deg, #7c3aed, #06b6d4)";

const profileCardSx = {
  borderRadius: 5,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 22px 55px rgba(15, 23, 42, 0.12)",
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      const response = await api.get("/users/me");

      setUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch {
      setError("Unable to load profile.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setMessage("");

      const response = await api.put("/users/me", {
        name: name.trim(),
        email: email.trim(),
      });

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setMessage("Profile updated successfully.");
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (oldPassword.length < 6 || newPassword.length < 6) {
      setError("Passwords must have at least 6 characters.");
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setMessage("");

      await api.put("/users/me/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setMessage("Password changed successfully.");
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Profile"
          subtitle="Manage your personal information and account security."
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

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card sx={profileCardSx}>
            <Box
              sx={{
                p: 4,
                color: "white",
                background: profileGradient,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.14)",
                  top: -55,
                  right: -35,
                }}
              />

              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.24)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <PersonIcon sx={{ fontSize: 44 }} />
              </Box>

              <Typography
                variant="h3"
                sx={{ mt: 2, fontWeight: 900, position: "relative", zIndex: 1 }}
              >
                {user?.name || "Profile"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                  flexWrap: "wrap",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Chip
                  label={user?.role?.toUpperCase() || ""}
                  sx={{ background: "white", fontWeight: 900 }}
                />

                {user?.role === "instructor" && (
                  <Chip
                    label={`KYC: ${user.kyc_status}`}
                    sx={{ background: "white", fontWeight: 800 }}
                  />
                )}
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Personal Details
              </Typography>

              <TextField
                fullWidth
                label="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                sx={{ mt: 3 }}
              />

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                sx={{ mt: 2 }}
              />

              <Button
                variant="contained"
                disabled={savingProfile}
                onClick={updateProfile}
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 900,
                  background: profileGradient,
                  boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                }}
              >
                {savingProfile ? "Saving..." : "Update Profile"}
              </Button>

              <Divider sx={{ my: 5 }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                    background: "linear-gradient(135deg, #22c55e, #14b8a6)",
                  }}
                >
                  <LockIcon />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Change Password
                </Typography>
              </Box>

              <TextField
                fullWidth
                type="password"
                label="Current password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                sx={{ mt: 3 }}
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
                variant="contained"
                disabled={savingPassword}
                onClick={changePassword}
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #22c55e, #14b8a6)",
                  boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                }}
              >
                {savingPassword ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}