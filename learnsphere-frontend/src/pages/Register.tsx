import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { motion } from "framer-motion";
import api from "../api/api";

const formItemAnimation = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setError("");

      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      navigate("/");
    } catch {
      setError("Registration failed. Try another email.");
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
          "radial-gradient(circle at 18% 28%, rgba(96, 165, 250, 0.32) 0, transparent 28%), radial-gradient(circle at 82% 18%, rgba(168, 85, 247, 0.3) 0, transparent 28%), linear-gradient(135deg, #020617 0%, #1e3a8a 52%, #7c3aed 100%)",
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
          right: 110,
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

      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 45, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        sx={{
          width: "100%",
          maxWidth: 520,
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
              component={motion.div}
              initial={{ opacity: 0, scale: 0.75, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              whileHover={{ scale: 1.06, rotate: 2 }}
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
              <PersonAddAltIcon sx={{ fontSize: 34 }} />
            </Box>

            <Typography
              component={motion.h1}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              variant="h4"
              sx={{ fontWeight: 900 }}
            >
              Create Account
            </Typography>

            <Typography
              component={motion.p}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              sx={{ color: "text.secondary", mt: 1, mb: 3 }}
            >
              Join LearnSphere AI as a student or instructor
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component={motion.div} {...formItemAnimation} transition={{ duration: 0.35, delay: 0.36 }}>
            <TextField label="Full Name" fullWidth margin="normal" value={name} onChange={(event) => setName(event.target.value)} />
          </Box>

          <Box component={motion.div} {...formItemAnimation} transition={{ duration: 0.35, delay: 0.44 }}>
            <TextField label="Email" fullWidth margin="normal" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Box>

          <Box component={motion.div} {...formItemAnimation} transition={{ duration: 0.35, delay: 0.52 }}>
            <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(event) => setPassword(event.target.value)} />
          </Box>

          <Box component={motion.div} {...formItemAnimation} transition={{ duration: 0.35, delay: 0.6 }}>
            <TextField label="Role" select fullWidth margin="normal" value={role} onChange={(event) => setRole(event.target.value)}>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
            </TextField>
          </Box>

          <Button
            component={motion.button}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.68 }}
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
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 18px 36px rgba(37, 99, 235, 0.42)",
              },
            }}
            onClick={handleRegister}
          >
            Register
          </Button>

          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.76 }}
            sx={{ textAlign: "center", mt: 2 }}
          >
            Already have an account? <Link to="/">Login</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}