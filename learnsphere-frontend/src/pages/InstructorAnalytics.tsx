import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import type { User } from "../types/user";
import type { Course } from "../types/course";

type AnalyticsData = {
  course_id: number;
  total_enrollments: number;
  total_lessons: number;
  total_assessments: number;
  total_attempts: number;
  average_score: number;
};

const analyticsGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
];

const analyticsCardSx = {
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

export default function InstructorAnalytics() {
  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get("/courses/", {
          params: { page: 1, limit: 50 },
        });

        setCourses(
          response.data.filter(
            (course: Course) => course.instructor_id === user?.id
          )
        );
      } catch {
        setError("Unable to load instructor courses.");
      }
    };

    loadCourses();
  }, []);

  const loadAnalytics = async (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    setAnalytics(null);

    if (!selectedCourseId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/analytics/instructor/courses/${selectedCourseId}`
      );

      setAnalytics(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load course analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = analytics
    ? [
        {
          title: "Enrollments",
          value: analytics.total_enrollments,
          icon: <PeopleIcon />,
        },
        {
          title: "Lessons",
          value: analytics.total_lessons,
          icon: <MenuBookIcon />,
        },
        {
          title: "Assessments",
          value: analytics.total_assessments,
          icon: <QuizIcon />,
        },
        {
          title: "Quiz Attempts",
          value: analytics.total_attempts,
          icon: <AnalyticsIcon />,
        },
        {
          title: "Average Score",
          value: analytics.average_score.toFixed(2),
          icon: <AnalyticsIcon />,
        },
      ]
    : [];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Instructor Analytics"
          subtitle="Monitor enrollments, lessons, assessments, and student attempts."
          backTo="/dashboard"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          select
          fullWidth
          label="Select your course"
          value={courseId}
          onChange={(event) => loadAnalytics(event.target.value)}
          sx={{
            background: "rgba(255,255,255,0.86)",
            borderRadius: 3,
            mb: 4,
          }}
        >
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.title}
            </MenuItem>
          ))}
        </TextField>

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : analytics ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: 2,
            }}
          >
            {cards.map((card, index) => (
              <Box
                key={card.title}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card sx={analyticsCardSx}>
                  <Box
                    sx={{
                      height: 5,
                      background:
                        analyticsGradients[
                          index % analyticsGradients.length
                        ],
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
                          analyticsGradients[
                            index % analyticsGradients.length
                          ],
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
        ) : (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Select a course to view analytics.
          </Alert>
        )}
      </Box>
    </Box>
  );
}