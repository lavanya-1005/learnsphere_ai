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
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type Notification = {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const notificationGradients = [
  "linear-gradient(135deg, #f97316, #ec4899)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #d946ef)",
  "linear-gradient(135deg, #eab308, #f97316)",
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications/me");
      setNotifications(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to update notification."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Notifications"
          subtitle="View certificate and platform updates."
          backTo="/dashboard"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No notifications available.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {notifications.map((notification, index) => (
              <Box
                key={notification.id}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    background: notification.is_read
                      ? "rgba(255,255,255,0.82)"
                      : "linear-gradient(135deg, rgba(255,247,237,0.96), rgba(253,244,255,0.96))",
                    border: notification.is_read
                      ? "1px solid rgba(148, 163, 184, 0.22)"
                      : "1px solid rgba(249, 115, 22, 0.22)",
                    boxShadow: notification.is_read
                      ? "0 14px 34px rgba(15, 23, 42, 0.07)"
                      : "0 20px 48px rgba(249, 115, 22, 0.14)",
                    transition: "0.25s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 26px 60px rgba(15, 23, 42, 0.14)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 5,
                      background: notification.is_read
                        ? "linear-gradient(135deg, #cbd5e1, #94a3b8)"
                        : notificationGradients[
                            index % notificationGradients.length
                          ],
                    }}
                  />

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
                        background: notification.is_read
                          ? "linear-gradient(135deg, #cbd5e1, #94a3b8)"
                          : notificationGradients[
                              index % notificationGradients.length
                            ],
                        color: "white",
                        boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
                      }}
                    >
                      <NotificationsIcon />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Chip
                          label={notification.type}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            color: "white",
                            background:
                              notificationGradients[
                                index % notificationGradients.length
                              ],
                          }}
                        />

                        <Chip
                          label={notification.is_read ? "Read" : "New"}
                          size="small"
                          color={notification.is_read ? "default" : "success"}
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Typography sx={{ fontWeight: 700 }}>
                        {notification.message}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </Box>

                    {!notification.is_read && (
                      <Button
                        variant="contained"
                        startIcon={<DoneAllIcon />}
                        onClick={() => markAsRead(notification.id)}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 800,
                          background:
                            notificationGradients[
                              index % notificationGradients.length
                            ],
                          boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                        }}
                      >
                        Mark Read
                      </Button>
                    )}
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