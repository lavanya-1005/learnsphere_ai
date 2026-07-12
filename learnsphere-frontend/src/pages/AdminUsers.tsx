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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type AdminStats = {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_courses: number;
  total_enrollments: number;
  total_payments: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  kyc_status: string;
  kyc_document_url: string | null;
  created_at: string;
};

const adminGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #ef4444, #f97316)",
];

const adminCardSx = {
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

export default function AdminUsers() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load admin data."
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRole = async (userId: number, role: string) => {
    try {
      setError("");
      setMessage("");

      await api.put(`/admin/users/${userId}`, { role });

      setMessage("User role updated successfully.");
      await loadData();

      if (selectedUser?.id === userId) {
        setSelectedUser((current) =>
          current ? { ...current, role } : current
        );
      }
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to update user role."
      );
    }
  };

  const viewUserDetails = async (userId: number) => {
    try {
      setLoadingUserId(userId);
      setError("");

      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load user details."
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  const kycColor = (
    status: string
  ): "success" | "error" | "warning" | "default" => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    if (status === "submitted") return "warning";
    return "default";
  };

  const statCards = stats
    ? [
        {
          title: "Total Users",
          value: stats.total_users,
          icon: <PeopleIcon />,
        },
        {
          title: "Students",
          value: stats.total_students,
          icon: <SchoolIcon />,
        },
        {
          title: "Instructors",
          value: stats.total_instructors,
          icon: <PeopleIcon />,
        },
        {
          title: "Courses",
          value: stats.total_courses,
          icon: <MenuBookIcon />,
        },
        {
          title: "Enrollments",
          value: stats.total_enrollments,
          icon: <SchoolIcon />,
        },
        {
          title: "Payments",
          value: stats.total_payments,
          icon: <PaymentsIcon />,
        },
      ]
    : [];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1350, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Admin Management"
          subtitle="Review platform statistics and manage user roles."
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

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
          Platform Overview
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(6, 1fr)",
            },
            gap: 2,
            mb: 5,
          }}
        >
          {statCards.map((card, index) => (
            <Box
              key={card.title}
              component={motion.div}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Card sx={adminCardSx}>
                <Box
                  sx={{
                    height: 5,
                    background: adminGradients[index % adminGradients.length],
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      background:
                        adminGradients[index % adminGradients.length],
                      boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {card.value}
                  </Typography>

                  <Typography color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
          User Management
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255,255,255,0.86)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Table>
            <TableHead
              sx={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 900 }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 900 }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 900 }}>
                  Role
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 900 }}>
                  KYC
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 900 }}>
                  Created
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 900 }}
                  align="right"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 800 }}>
                      {user.name}
                    </Typography>
                  </TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      onChange={(event) =>
                        updateRole(user.id, event.target.value)
                      }
                      sx={{ minWidth: 130 }}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="instructor">Instructor</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                  </TableCell>

                  <TableCell>
                    {user.role === "instructor" ? (
                      <Chip
                        label={user.kyc_status}
                        size="small"
                        color={kycColor(user.kyc_status)}
                        sx={{ fontWeight: 800 }}
                      />
                    ) : (
                      <Chip
                        label="Not Applicable"
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 3, fontWeight: 800 }}
                      startIcon={
                        loadingUserId === user.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <VisibilityIcon />
                        )
                      }
                      disabled={loadingUserId === user.id}
                      onClick={() => viewUserDetails(user.id)}
                    >
                      {loadingUserId === user.id ? "Loading" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>User Details</DialogTitle>

          <DialogContent dividers>
            {selectedUser && (
              <Box sx={{ display: "grid", gap: 2 }}>
                <Typography>
                  <strong>User ID:</strong> {selectedUser.id}
                </Typography>

                <Typography>
                  <strong>Name:</strong> {selectedUser.name}
                </Typography>

                <Typography>
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={selectedUser.role.toUpperCase()} />

                  {selectedUser.role === "instructor" && (
                    <Chip
                      label={`KYC: ${selectedUser.kyc_status}`}
                      color={kycColor(selectedUser.kyc_status)}
                    />
                  )}
                </Box>

                <Typography>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedUser.created_at).toLocaleString()}
                </Typography>

                {selectedUser.role === "instructor" && (
                  <Typography sx={{ overflowWrap: "anywhere" }}>
                    <strong>KYC document:</strong>{" "}
                    {selectedUser.kyc_document_url || "Not uploaded"}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setSelectedUser(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}