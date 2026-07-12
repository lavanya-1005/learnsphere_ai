import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RecommendIcon from "@mui/icons-material/Recommend";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

import type { ReactNode } from "react";
import type { User } from "../types/user";

const drawerWidth = 280;

type MenuItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

const roleMenus: Record<User["role"], MenuItem[]> = {
  student: [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Browse Courses", path: "/courses", icon: <MenuBookIcon /> },
    { label: "My Courses", path: "/my-courses", icon: <MenuBookIcon /> },
    { label: "Wallet", path: "/wallet", icon: <AccountBalanceWalletIcon /> },
    { label: "AI Tutor", path: "/ai-tutor", icon: <SmartToyIcon /> },
    { label: "Progress", path: "/progress", icon: <AnalyticsIcon /> },
    { label: "Certificates", path: "/certificates", icon: <EmojiEventsIcon /> },
    { label: "Recommendations", path: "/recommendations", icon: <RecommendIcon /> },
    { label: "Study Planner", path: "/study-planner", icon: <CalendarMonthIcon /> },
    { label: "Mock Interview", path: "/mock-interview", icon: <RecordVoiceOverIcon /> },
    { label: "Notifications", path: "/notifications", icon: <NotificationsIcon /> },
    { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  ],

  instructor: [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "My Courses", path: "/instructor/courses", icon: <MenuBookIcon /> },
    { label: "KYC Status", path: "/instructor/kyc", icon: <VerifiedUserIcon /> },
    { label: "Analytics", path: "/instructor/analytics", icon: <AnalyticsIcon /> },
    { label: "Interview Questions", path: "/interview-questions", icon: <RecordVoiceOverIcon /> },
    { label: "Notifications", path: "/notifications", icon: <NotificationsIcon /> },
    { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  ],

  admin: [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
    { label: "KYC Requests", path: "/admin/kyc", icon: <VerifiedUserIcon /> },
    { label: "Courses", path: "/admin/courses", icon: <MenuBookIcon /> },
    { label: "Interview Questions", path: "/interview-questions", icon: <RecordVoiceOverIcon /> },
    { label: "Notifications", path: "/notifications", icon: <NotificationsIcon /> },
    { label: "Profile", path: "/profile", icon: <PersonIcon /> },
  ],
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return null;
  }

  const menuItems = roleMenus[user.role];

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        color: "white",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #020617 0%, #111827 45%, #1e1b4b 100%)",
      }}
    >
      <Toolbar sx={{ minHeight: 86, px: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              boxShadow: "0 12px 30px rgba(37, 99, 235, 0.35)",
            }}
          >
            <AutoStoriesIcon />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              LearnSphere AI
            </Typography>

            <Chip
              size="small"
              label={user.role.toUpperCase()}
              sx={{
                mt: 0.8,
                height: 22,
                color: "white",
                fontWeight: 800,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            />
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);

          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 3,
                mb: 0.7,
                minHeight: 46,
                color: active ? "white" : "rgba(255,255,255,0.72)",
                transition: "0.22s ease",
                "& .MuiListItemIcon-root": {
                  color: "inherit",
                  minWidth: 40,
                },
                "&:hover": {
                  color: "white",
                  background: "rgba(255,255,255,0.1)",
                  transform: "translateX(4px)",
                },
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.95), rgba(124,58,237,0.95))",
                  boxShadow: "0 12px 28px rgba(37, 99, 235, 0.28)",
                },
                "&.Mui-selected:hover": {
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,1), rgba(124,58,237,1))",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>

              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: active ? 900 : 700,
                      fontSize: 14,
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{
            color: "white",
            borderColor: "rgba(255,255,255,0.25)",
            borderRadius: 3,
            py: 1.1,
            fontWeight: 800,
            "&:hover": {
              borderColor: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflowX: "hidden",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #f8fafc 38%, #eff6ff 100%)",
      }}
    >
      <Box
        component={motion.div}
        animate={{ y: [0, -18, 0], opacity: [0.55, 0.82, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "fixed",
          width: { xs: 260, md: 420 },
          height: { xs: 260, md: 420 },
          borderRadius: "50%",
          background: "rgba(37, 99, 235, 0.12)",
          filter: "blur(45px)",
          top: 90,
          right: { xs: -80, md: 80 },
          pointerEvents: "none",
        }}
      />

      <Box
        component={motion.div}
        animate={{ y: [0, 20, 0], opacity: [0.45, 0.72, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "fixed",
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          borderRadius: "50%",
          background: "rgba(124, 58, 237, 0.11)",
          filter: "blur(45px)",
          bottom: 90,
          left: { xs: -70, md: 340 },
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "linear-gradient(to bottom, black, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          background: "rgba(255,255,255,0.82)",
          color: "#0f172a",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
        }}
      >
        <Toolbar sx={{ minHeight: 72 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontWeight: 900,
                fontSize: { xs: 15, sm: 16 },
              }}
            >
              Welcome, {user.name}
            </Typography>

            <Typography
              noWrap
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Manage your LearnSphere AI workspace
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 900,
              boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              border: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component={motion.main}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          pt: "72px",
          position: "relative",
          zIndex: 1,
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}