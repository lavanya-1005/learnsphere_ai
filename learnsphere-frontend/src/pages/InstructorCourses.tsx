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
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import type { User } from "../types/user";
import type { Course } from "../types/course";

const instructorGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const instructorCardSx = {
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

export default function InstructorCourses() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load instructor courses."
      );
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const createCourse = async () => {
    if (title.trim().length < 3) {
      setError("Course title must contain at least 3 characters.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/courses/", {
        title: title.trim(),
        description: description.trim() || null,
        price: Number(price),
      });

      setTitle("");
      setDescription("");
      setPrice("0");
      setMessage("Course created successfully.");
      await loadCourses();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to create course."
      );
    } finally {
      setCreating(false);
    }
  };

  const deleteCourse = async (courseId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setMessage("Course deleted successfully.");
      await loadCourses();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to delete course."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1150, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Instructor Courses"
          subtitle="Create and manage your courses."
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

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card sx={{ ...instructorCardSx, mb: 5 }}>
            <Box
              sx={{
                p: 4,
                color: "white",
                background: instructorGradients[0],
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.14)",
                  top: -55,
                  right: -35,
                }}
              />

              <Typography
                variant="h3"
                sx={{ fontWeight: 900, position: "relative", zIndex: 1 }}
              >
                Create Course
              </Typography>

              <Typography sx={{ mt: 1, opacity: 0.9, position: "relative", zIndex: 1 }}>
                Your KYC must be approved before creating courses.
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "grid", gap: 2 }}>
                <TextField
                  label="Course title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />

                <TextField
                  label="Description"
                  multiline
                  minRows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />

                <TextField
                  type="number"
                  label="Price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  helperText="Enter 0 for a free course."
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={creating}
                onClick={createCourse}
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 900,
                  background: instructorGradients[0],
                  boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                }}
              >
                {creating ? "Creating..." : "Create Course"}
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
          My Courses
        </Typography>

        {courses.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            You have not created any courses yet.
          </Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 3,
            }}
          >
            {courses.map((course, index) => {
              const coursePrice = Number(course.price);

              return (
                <Box
                  key={course.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <Card sx={instructorCardSx}>
                    <Box
                      sx={{
                        height: 6,
                        background:
                          instructorGradients[
                            index % instructorGradients.length
                          ],
                      }}
                    />

                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>
                          {course.title}
                        </Typography>

                        <Chip
                          label={
                            coursePrice === 0
                              ? "Free"
                              : `₹${coursePrice.toFixed(2)}`
                          }
                          sx={{
                            color: "white",
                            fontWeight: 900,
                            background:
                              coursePrice === 0
                                ? instructorGradients[1]
                                : instructorGradients[
                                    index % instructorGradients.length
                                  ],
                          }}
                        />
                      </Box>

                      <Typography color="text.secondary" sx={{ mt: 2 }}>
                        {course.description || "No description available."}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                        <Button
                          variant="contained"
                          startIcon={<SettingsIcon />}
                          onClick={() =>
                            navigate(`/instructor/courses/${course.id}`)
                          }
                          sx={{
                            borderRadius: 3,
                            fontWeight: 900,
                            background:
                              instructorGradients[
                                index % instructorGradients.length
                              ],
                          }}
                        >
                          Manage
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