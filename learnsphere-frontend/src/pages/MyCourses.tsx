import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import type { Course } from "../types/course";

type Enrollment = {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  enrolled_at: string;
};

type EnrolledCourse = {
  enrollment: Enrollment;
  course: Course;
};

const courseGradients = [
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #0891b2, #2563eb)",
  "linear-gradient(135deg, #16a34a, #0f766e)",
  "linear-gradient(135deg, #f97316, #db2777)",
];

const enrolledCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-7px)",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.16)",
  },
};

export default function MyCourses() {
  const navigate = useNavigate();

  const [items, setItems] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        const enrollmentResponse = await api.get("/users/me/enrollments");
        const enrollments: Enrollment[] = enrollmentResponse.data;

        const courseResponses = await Promise.all(
          enrollments.map((enrollment) =>
            api.get(`/courses/${enrollment.course_id}`)
          )
        );

        const enrolledCourses = enrollments.map((enrollment, index) => ({
          enrollment,
          course: courseResponses[index].data,
        }));

        setItems(enrolledCourses);
      } catch {
        setError("Unable to load enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="My Courses"
          subtitle="Access your enrolled courses, lessons, assessments, and progress."
        />

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Alert severity="info">
            You have not enrolled in any courses yet.
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {items.map(({ enrollment, course }, index) => (
              <Box
                key={enrollment.id}
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card sx={enrolledCardSx}>
                  <Box
                    sx={{
                      height: 140,
                      p: 3,
                      color: "white",
                      background:
                        courseGradients[index % courseGradients.length],
                      display: "flex",
                      alignItems: "flex-end",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        width: 130,
                        height: 130,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.16)",
                        top: -35,
                        right: -30,
                      }}
                    />

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {course.title}
                    </Typography>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography color="text.secondary">
                      {course.description || "No description available."}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 2,
                        color: "success.main",
                        fontWeight: 800,
                      }}
                    >
                      Enrollment: {enrollment.status}
                    </Typography>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayCircleIcon />}
                      sx={{
                        mt: 3,
                        py: 1.2,
                        borderRadius: 3,
                        fontWeight: 800,
                        background:
                          "linear-gradient(135deg, #2563eb, #7c3aed)",
                        boxShadow: "0 12px 28px rgba(37, 99, 235, 0.28)",
                      }}
                      onClick={() => navigate(`/learn/${course.id}`)}
                    >
                      Continue Course
                    </Button>
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