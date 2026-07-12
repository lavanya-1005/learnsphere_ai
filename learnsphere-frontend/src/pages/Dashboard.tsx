import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RecommendIcon from "@mui/icons-material/Recommend";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PersonIcon from "@mui/icons-material/Person";
import PageHeader from "../components/PageHeader";

import type { ReactNode } from "react";
import type { User } from "../types/user";
import api from "../api/api";

type FeatureCard = {
  title: string;
  value: string;
  icon: ReactNode;
};

type RecentNotification = {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type BFFDashboardData = {
  user: User;
  summary: Record<string, string | number>;
  recent_notifications: RecentNotification[];
};

const roleCards: Record<User["role"], FeatureCard[]> = {
  student: [
    {
      title: "Browse Courses",
      value: "Explore learning paths",
      icon: <MenuBookIcon />,
    },
    {
      title: "My Courses",
      value: "Continue learning",
      icon: <MenuBookIcon />,
    },
    {
      title: "My Wallet",
      value: "Manage payments",
      icon: <AccountBalanceWalletIcon />,
    },
    {
      title: "AI Tutor",
      value: "Ask doubts instantly",
      icon: <SmartToyIcon />,
    },
    {
      title: "Progress",
      value: "Track your completion",
      icon: <AnalyticsIcon />,
    },
    {
      title: "Certificates",
      value: "Earn achievements",
      icon: <EmojiEventsIcon />,
    },
    {
      title: "Recommendations",
      value: "Discover new courses",
      icon: <RecommendIcon />,
    },
    {
      title: "Study Planner",
      value: "Plan your learning",
      icon: <CalendarMonthIcon />,
    },
    {
      title: "Mock Interview",
      value: "Practice with AI",
      icon: <RecordVoiceOverIcon />,
    },
    {
      title: "Notifications",
      value: "View updates",
      icon: <NotificationsIcon />,
    },
    {
      title: "Profile",
      value: "Manage your account",
      icon: <PersonIcon />,
    },
  ],

  instructor: [
    {
      title: "My Courses",
      value: "Create and manage",
      icon: <MenuBookIcon />,
    },
    {
      title: "KYC Status",
      value: "Verification center",
      icon: <VerifiedUserIcon />,
    },
    {
      title: "Assessments",
      value: "Build quizzes",
      icon: <SchoolIcon />,
    },
    {
      title: "Analytics",
      value: "View performance",
      icon: <AnalyticsIcon />,
    },
    {
      title: "Interview Questions",
      value: "Manage question bank",
      icon: <RecordVoiceOverIcon />,
    },
    {
      title: "Notifications",
      value: "View updates",
      icon: <NotificationsIcon />,
    },
    {
      title: "Profile",
      value: "Manage your account",
      icon: <PersonIcon />,
    },
  ],

  admin: [
    {
      title: "Users",
      value: "Manage platform users",
      icon: <SchoolIcon />,
    },
    {
      title: "KYC Requests",
      value: "Approve instructors",
      icon: <VerifiedUserIcon />,
    },
    {
      title: "Courses",
      value: "Monitor content",
      icon: <MenuBookIcon />,
    },
    {
      title: "Reports",
      value: "Platform insights",
      icon: <AnalyticsIcon />,
    },
    {
      title: "Interview Questions",
      value: "Manage question bank",
      icon: <RecordVoiceOverIcon />,
    },
    {
      title: "Notifications",
      value: "View updates",
      icon: <NotificationsIcon />,
    },
    {
      title: "Profile",
      value: "Manage your account",
      icon: <PersonIcon />,
    },
  ],
};

function formatSummaryLabel(key: string) {
  return key
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

const statGradients = [
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #0891b2, #2563eb)",
  "linear-gradient(135deg, #16a34a, #0f766e)",
  "linear-gradient(135deg, #f97316, #db2777)",
];

const glassCardSx = {
  borderRadius: 4,
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.15)",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [dashboardData, setDashboardData] =
    useState<BFFDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/bff/${user.role}/dashboard`
        );

        setDashboardData(response.data);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load dashboard information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.role]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const cards = roleCards[user.role];

  const openFeature = (title: string) => {
    if (title === "Profile") {
      navigate("/profile");
      return;
    }

    if (title === "Notifications") {
      navigate("/notifications");
      return;
    }

    if (title === "Interview Questions") {
      navigate("/interview-questions");
      return;
    }

    if (user.role === "student") {
      const studentRoutes: Record<string, string> = {
        "Browse Courses": "/courses",
        "My Courses": "/my-courses",
        "My Wallet": "/wallet",
        "AI Tutor": "/ai-tutor",
        Progress: "/progress",
        Certificates: "/certificates",
        Recommendations: "/recommendations",
        "Study Planner": "/study-planner",
        "Mock Interview": "/mock-interview",
      };

      const path = studentRoutes[title];

      if (path) navigate(path);

      return;
    }

    if (user.role === "instructor") {
      const instructorRoutes: Record<string, string> = {
        "My Courses": "/instructor/courses",
        "KYC Status": "/instructor/kyc",
        Assessments: "/instructor/courses",
        Analytics: "/instructor/analytics",
      };

      const path = instructorRoutes[title];

      if (path) navigate(path);

      return;
    }

    if (user.role === "admin") {
      const adminRoutes: Record<string, string> = {
        Users: "/admin/users",
        "KYC Requests": "/admin/kyc",
        Courses: "/admin/courses",
        Reports: "/admin/users",
      };

      const path = adminRoutes[title];

      if (path) navigate(path);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>

      <Box
        sx={{
          width: "100%",
          maxWidth: 1400,
          mx: "auto",
          p: { xs: 2, md: 5 },
        }}
      >
        <PageHeader
          title={`Welcome, ${user.name}`}
          subtitle={`Your ${user.role} dashboard is ready.`}
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 3 }}
        >
          Overview
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              py: 6,
            }}
          >
            <CircularProgress />
          </Box>
        ) : dashboardData ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 5,
            }}
          >
            {Object.entries(dashboardData.summary).map(([key, value], index) => (
              <Card
                key={key}
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                sx={{
                  ...glassCardSx,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: statGradients[index % statGradients.length],
                    opacity: 0.14,
                    top: -28,
                    right: -24,
                  }}
                />

                <CardContent sx={{ p: 3, position: "relative" }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      background: statGradients[index % statGradients.length],
                      boxShadow: "0 12px 26px rgba(37, 99, 235, 0.25)",
                      mb: 2,
                    }}
                  >
                    <AnalyticsIcon fontSize="small" />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {key === "wallet_balance"
                      ? `₹${Number(value).toFixed(2)}`
                      : value}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mt: 1, fontWeight: 700 }}>
                    {formatSummaryLabel(key)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : null}

        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 3 }}
        >
          Features
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
            {cards.map((card, index) => (            <Card
              key={card.title}
              component={motion.div}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              onClick={() => openFeature(card.title)}
              sx={{
                ...glassCardSx,
                cursor: "pointer",
                height: "100%",
                overflow: "hidden",
              }}
            >

              <Box
                sx={{
                  height: 4,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "white",
                    boxShadow: "0 12px 26px rgba(37, 99, 235, 0.24)",
                  }}
                >
                  {card.icon}
                </Box>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800 }}
                >
                  {card.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {dashboardData &&
          dashboardData.recent_notifications.length > 0 && (
            <>
              <Typography
                variant="h4"
                sx={{ fontWeight: 900, mt: 5, mb: 3 }}
              >
                Recent Notifications
              </Typography>

              <Box sx={{ display: "grid", gap: 2 }}>
                {dashboardData.recent_notifications.map(
                  (notification) => (
              <Card
                key={notification.id}
                component={motion.div}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                sx={{
                  borderRadius: 4,
                  background: notification.is_read
                    ? "rgba(255,255,255,0.72)"
                    : "linear-gradient(135deg, rgba(239,246,255,0.95), rgba(245,243,255,0.95))",
                  border: notification.is_read
                    ? "1px solid rgba(148, 163, 184, 0.18)"
                    : "1px solid rgba(37, 99, 235, 0.18)",
                  boxShadow: notification.is_read
                    ? "0 12px 30px rgba(15, 23, 42, 0.06)"
                    : "0 18px 42px rgba(37, 99, 235, 0.12)",
                }}
              >
                        <CardContent
                        sx={{
                          p: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 3,
                            display: "grid",
                            placeItems: "center",
                            background: notification.is_read
                              ? "#f1f5f9"
                              : "linear-gradient(135deg, #2563eb, #7c3aed)",
                            color: notification.is_read ? "#94a3b8" : "white",
                          }}
                        >
                          <NotificationsIcon fontSize="small" />
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography>
                            {notification.message}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </Typography>
                        </Box>

                        <Chip
                          label={
                            notification.is_read
                              ? "Read"
                              : "New"
                          }
                          color={
                            notification.is_read
                              ? "default"
                              : "success"
                          }
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  )
                )}
              </Box>
            </>
          )}
      </Box>
    </Box>
  );
}