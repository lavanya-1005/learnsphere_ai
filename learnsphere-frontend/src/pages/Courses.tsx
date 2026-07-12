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
import SearchIcon from "@mui/icons-material/Search";

import PageHeader from "../components/PageHeader";
import type { Course } from "../types/course";
import api from "../api/api";

const courseGradients = [
  "linear-gradient(135deg, #2563eb, #7c3aed)",
  "linear-gradient(135deg, #0891b2, #2563eb)",
  "linear-gradient(135deg, #16a34a, #0f766e)",
  "linear-gradient(135deg, #f97316, #db2777)",
];

const courseCardSx = {
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

export default function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses/", {
        params: {
          search: search.trim() || undefined,
          page: 1,
          limit: 50,
        },
      });

      setCourses(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const clearSearch = async () => {
    setSearch("");

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/courses/", {
        params: {
          page: 1,
          limit: 50,
        },
      });

      setCourses(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1300,
        mx: "auto",
        p: { xs: 2, md: 5 },
      }}
    >
      <PageHeader
        title="Explore Courses"
        subtitle="Explore free and paid learning paths from verified instructors."
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          fullWidth
          label="Search courses"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              loadCourses();
            }
          }}
        />

        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={loadCourses}
          sx={{ px: 4 }}
        >
          Search
        </Button>

        {search && (
          <Button
            variant="outlined"
            onClick={clearSearch}
            sx={{ px: 3 }}
          >
            Clear
          </Button>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Alert severity="info">
          No courses match your search.
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
          {courses.map((course, index) => {            const price = Number(course.price);
            const isFree = price === 0;

            return (
              <Card
                key={course.id}
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                sx={courseCardSx}
              >
                <Box
                  sx={{
                    minHeight: 145,
                    p: 3,
                    color: "white",
                    background: courseGradients[index % courseGradients.length],
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >

                  <Box
                    sx={{
                      position: "absolute",
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.16)",
                      top: -35,
                      right: -25,
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 900,
                      color: "white",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {course.title}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={
                        isFree
                          ? "Free"
                          : `₹${price.toFixed(2)}`
                      }
                      color={
                        isFree ? "success" : "primary"
                      }
                      size="small"
                    />

                    <Chip
                      label={`Instructor ${course.instructor_id}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      mt: 2,
                      minHeight: 72,
                    }}
                  >
                    {course.description ||
                      "No description available."}
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      navigate(`/courses/${course.id}`)
                    }
                  >
                    View Course
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}