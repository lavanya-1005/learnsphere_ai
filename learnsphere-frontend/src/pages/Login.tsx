import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { motion } from "framer-motion";
import api from "../api/api";

const formItemAnimation = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    background: "rgba(248,250,252,0.9)",
  },
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      const userResponse = await api.get("/users/me");
      localStorage.setItem("user", JSON.stringify(userResponse.data));

      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
        background:
          "radial-gradient(circle at 18% 28%, rgba(96, 165, 250, 0.32) 0, transparent 28%), radial-gradient(circle at 82% 18%, rgba(168, 85, 247, 0.3) 0, transparent 28%), linear-gradient(135deg, #020617 0%, #312e81 52%, #2563eb 100%)",
      }}
    >
      <Box
        component={motion.div}
        animate={{ y: [0, -18, 0], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: 290,
          height: 290,
          borderRadius: "50%",
          background: "rgba(168, 85, 247, 0.5)",
          filter: "blur(55px)",
          top: 70,
          right: 120,
        }}
      />

      <Box
        component={motion.div}
        animate={{ y: [0, 22, 0], opacity: [0.35, 0.72, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: 270,
          height: 270,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.52)",
          filter: "blur(55px)",
          bottom: 60,
          left: 90,
        }}
      />

      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -45 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65 }}
        sx={{
          color: "white",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          px: 8,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.75, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          whileHover={{ scale: 1.06, rotate: 2 }}
          sx={{
            width: 76,
            height: 76,
            borderRadius: 5,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            mb: 3,
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: 44 }} />
        </Box>

        <Typography
          component={motion.h1}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.25 }}
          variant="h2"
          sx={{ fontWeight: 900, lineHeight: 1.05 }}
        >
          LearnSphere AI
        </Typography>

        <Typography
          component={motion.p}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          sx={{ mt: 2, fontSize: 20, maxWidth: 560, opacity: 0.9 }}
        >
          Learn smarter with AI tutor support, quizzes, progress tracking,
          certificates, study planner, and mock interviews.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap", mt: 3 }}>
          {["AI Tutor", "Quizzes", "Certificates", "Progress"].map(
            (item, index) => (
              <Chip
                component={motion.div}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.48 + index * 0.12 }}
                whileHover={{ y: -3, scale: 1.04 }}
                key={item}
                label={item}
                sx={{
                  color: "white",
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                }}
              />
            )
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          px: 2,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Card
          component={motion.div}
          initial={{ opacity: 0, y: 45, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 5,
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.32)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              sx={{
                width: "fit-content",
                mx: "auto",
                mb: 2,
                px: 2,
                py: 0.7,
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 13,
                color: "#7c3aed",
                background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                border: "1px solid rgba(124, 58, 237, 0.16)",
              }}
            >
              Learning made smarter
            </Box>

            <Typography
              component={motion.h2}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              variant="h4"
              sx={{ fontWeight: 900, textAlign: "center" }}
            >
              Welcome Back
            </Typography>

            <Typography
              component={motion.p}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              sx={{
                color: "text.secondary",
                textAlign: "center",
                mt: 1,
                mb: 3,
              }}
            >
              Login to continue your learning journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Box
              component={motion.div}
              {...formItemAnimation}
              transition={{ duration: 0.35, delay: 0.32 }}
            >
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                sx={inputSx}
              />
            </Box>

            <Box
              component={motion.div}
              {...formItemAnimation}
              transition={{ duration: 0.35, delay: 0.42 }}
            >
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                sx={inputSx}
              />
            </Box>

            <Box
              component={motion.div}
              {...formItemAnimation}
              transition={{ duration: 0.35, delay: 0.5 }}
              sx={{ textAlign: "right", mt: 1 }}
            >
              <Link to="/forgot-password">Forgot password?</Link>
            </Box>

            <Button
              component={motion.button}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.58 }}
              whileTap={{ scale: 0.98 }}
              fullWidth
              variant="contained"
              size="large"
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
              onClick={handleLogin}
            >
              Login
            </Button>

            <Typography
              component={motion.p}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.68 }}
              sx={{ textAlign: "center", mt: 2 }}
            >
              New user? <Link to="/register">Create account</Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}