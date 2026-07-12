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
  Typography,
} from "@mui/material";
import api from "../api/api";
import PageHeader from "../components/PageHeader";

type RecommendedCourse = {
  id: number;
  title: string;
  description: string | null;
  instructor_id: number;
  price: string;
  enrollment_count: number;
  reason: string;
};

const recommendationGradients = [
  "linear-gradient(135deg, #7c3aed, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #8b5cf6, #06b6d4)",
];

const recommendationCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-7px)",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.15)",
  },
};

export default function Recommendations() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await api.get("/recommendations/courses", {
          params: { limit: 10 },
        });

        setCourses(response.data);
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load recommendations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Recommendations"
          subtitle="Discover popular courses you have not enrolled in yet."
          backTo="/dashboard"
        />

        {error && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : courses.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No new recommendations are available.
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
            {courses.map((course, index) => {
              const price = Number(course.price);

              return (
                <Box
                  key={course.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                >
                  <Card sx={recommendationCardSx}>
                    <Box
                      sx={{
                        height: 135,
                        p: 3,
                        color: "white",
                        background:
                          recommendationGradients[
                            index % recommendationGradients.length
                          ],
                        display: "flex",
                        alignItems: "flex-end",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          width: 125,
                          height: 125,
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
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                                ? "linear-gradient(135deg, #22c55e, #14b8a6)"
                                : recommendationGradients[
                                    index % recommendationGradients.length
                                  ],
                          }}
                        />

                        <Chip
                          label={`${course.enrollment_count} enrolled`}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Typography color="text.secondary" sx={{ mt: 2 }}>
                        {course.description || "No description available."}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          fontWeight: 800,
                          color: "#7c3aed",
                        }}
                      >
                        {course.reason}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 3,
                          py: 1.1,
                          borderRadius: 3,
                          fontWeight: 900,
                          background:
                            recommendationGradients[
                              index % recommendationGradients.length
                            ],
                          boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                        }}
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        View Course
                      </Button>
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