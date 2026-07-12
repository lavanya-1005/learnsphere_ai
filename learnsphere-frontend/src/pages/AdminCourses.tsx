import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api/api";

type AdminCourse = {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number;
  price: string;
  created_at: string;
};

const adminCourseGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
];

const adminCourseCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.14)",
  },
};

export default function AdminCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCourses = async () => {
    try {
      const response = await api.get("/admin/courses");
      setCourses(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const deleteCourse = async (courseId: number) => {
    const confirmed = window.confirm(
      "This will permanently delete the course. Continue?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/admin/courses/${courseId}`);

      setMessage("Course deleted successfully.");
      await loadCourses();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to delete course."
      );
    }
  };

  const filteredCourses = courses.filter((course) => {
    const query = search.toLowerCase();

    return (
      course.title.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Course Management"
          subtitle="Monitor and manage all courses available on the platform."
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

        <TextField
          fullWidth
          label="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            },
          }}
          sx={{
            background: "rgba(255,255,255,0.86)",
            borderRadius: 3,
            mb: 4,
          }}
        />

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : filteredCourses.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No courses found.
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
            {filteredCourses.map((course, index) => {
              const price = Number(course.price);

              return (
                <Box
                  key={course.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <Card sx={adminCourseCardSx}>
                    <Box
                      sx={{
                        height: 6,
                        background:
                          adminCourseGradients[
                            index % adminCourseGradients.length
                          ],
                      }}
                    />

                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {course.title}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <Chip
                          label={
                            price === 0 ? "Free" : `₹${price.toFixed(2)}`
                          }
                          size="small"
                          sx={{
                            color: "white",
                            fontWeight: 800,
                            background:
                              price === 0
                                ? adminCourseGradients[1]
                                : adminCourseGradients[
                                    index % adminCourseGradients.length
                                  ],
                          }}
                        />

                        <Chip
                          label={`Instructor ${course.instructor_id}`}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 2, minHeight: 70 }}
                      >
                        {course.description || "No description available."}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Created:{" "}
                        {new Date(course.created_at).toLocaleDateString()}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/courses/${course.id}`)}
                          sx={{ borderRadius: 3, fontWeight: 800 }}
                        >
                          View
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => deleteCourse(course.id)}
                          sx={{ borderRadius: 3, fontWeight: 800 }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}