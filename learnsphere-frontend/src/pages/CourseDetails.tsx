import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SettingsIcon from "@mui/icons-material/Settings";
import PageHeader from "../components/PageHeader";
import type { Course } from "../types/course";
import type { User } from "../types/user";
import api from "../api/api";

const courseHeroGradient = "linear-gradient(135deg, #7c3aed, #06b6d4)";
const actionGradient = "linear-gradient(135deg, #22c55e, #14b8a6)";

const detailCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
};

export default function CourseDetails() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data);
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load course details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleEnrollOrBuy = async () => {
    if (!course || user?.role !== "student") {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const price = Number(course.price);

      if (price === 0) {
        await api.post(`/courses/${course.id}/enroll`);
        setSuccess("You enrolled in this course successfully.");
      } else {
        await api.post(`/payments/courses/${course.id}/buy`);
        setSuccess("Course purchased and enrollment created successfully.");
      }
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to enroll in this course."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getBackPath = () => {
    if (user?.role === "admin") return "/admin/courses";
    if (user?.role === "instructor") return "/instructor/courses";
    return "/courses";
  };

  const backPath = getBackPath();

  if (loading) {
    return (
      <Box sx={{ minHeight: 500, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader title="Course Details" backTo={backPath} />

        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error || "Course not found."}
        </Alert>
      </Box>
    );
  }

  const price = Number(course.price);
  const isFree = price === 0;

  const isCourseOwner =
    user?.role === "instructor" && course.instructor_id === user.id;

  return (
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", p: { xs: 2, md: 5 } }}>
      <PageHeader
        title="Course Details"
        subtitle="Review course information and available actions."
        backTo={backPath}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 5,
          background: courseHeroGradient,
          color: "white",
          mb: 4,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 24px 65px rgba(15, 23, 42, 0.16)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
            top: -70,
            right: -50,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            bottom: -45,
            left: -35,
          }}
        />

        <Chip
          label={isFree ? "Free Course" : `₹${price.toFixed(2)}`}
          sx={{
            background: "white",
            color: "#7c3aed",
            fontWeight: 900,
            mb: 2,
            position: "relative",
            zIndex: 1,
          }}
        />

        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            color: "white",
            position: "relative",
            zIndex: 1,
          }}
        >
          {course.title}
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: 18,
            opacity: 0.94,
            color: "white",
            position: "relative",
            zIndex: 1,
          }}
        >
          {course.description || "No course description available."}
        </Typography>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <Card sx={detailCardSx}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  background: actionGradient,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
                }}
              >
                <MenuBookIcon />
              </Box>

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {user?.role === "student"
                    ? "Start Learning"
                    : "Course Information"}
                </Typography>

                <Typography color="text.secondary">
                  Instructor ID: {course.instructor_id}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography color="text.secondary">
              After enrolling, students can access protected lessons, complete
              assessments, use the AI Tutor, track progress, and earn a
              certificate.
            </Typography>

            {user?.role === "student" && (
              <Button
                fullWidth
                size="large"
                variant="contained"
                startIcon={isFree ? <MenuBookIcon /> : <ShoppingCartIcon />}
                disabled={actionLoading}
                onClick={handleEnrollOrBuy}
                sx={{
                  mt: 4,
                  py: 1.4,
                  borderRadius: 3,
                  fontWeight: 900,
                  background: actionGradient,
                  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.16)",
                }}
              >
                {actionLoading
                  ? "Please wait..."
                  : isFree
                  ? "Enroll Now"
                  : `Buy Now for ₹${price.toFixed(2)}`}
              </Button>
            )}

            {isCourseOwner && (
              <Button
                fullWidth
                size="large"
                variant="contained"
                startIcon={<SettingsIcon />}
                sx={{
                  mt: 4,
                  py: 1.4,
                  borderRadius: 3,
                  fontWeight: 900,
                  background: courseHeroGradient,
                }}
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                Manage Course
              </Button>
            )}

            {user?.role === "instructor" && !isCourseOwner && (
              <Alert severity="info" sx={{ mt: 4, borderRadius: 3 }}>
                This course belongs to another instructor. You have read-only
                access.
              </Alert>
            )}

            {user?.role === "admin" && (
              <Alert severity="info" sx={{ mt: 4, borderRadius: 3 }}>
                You are viewing this course as an administrator. Use Admin
                Course Management to monitor or delete it.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={5000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
}