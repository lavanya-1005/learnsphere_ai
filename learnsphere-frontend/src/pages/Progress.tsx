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
  LinearProgress,
  Typography,
} from "@mui/material";
import api from "../api/api";
import PageHeader from "../components/PageHeader";

type Enrollment = {
  course_id: number;
};

type CourseProgress = {
  course_id: number;
  course_title: string;
  total_lessons: number;
  completed_lessons: number;
  total_assessments: number;
  completed_attempts: number;
  passed_assessments: number;
  progress_percentage: number;
};

const progressGradients = [
  "linear-gradient(135deg, #f97316, #ec4899)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #eab308, #f97316)",
  "linear-gradient(135deg, #8b5cf6, #d946ef)",
  "linear-gradient(135deg, #ef4444, #f97316)",
  "linear-gradient(135deg, #10b981, #84cc16)",
];

const progressCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.15)",
  },
};

export default function Progress() {
  const navigate = useNavigate();

  const [items, setItems] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const enrollmentResponse = await api.get("/users/me/enrollments");
        const enrollments: Enrollment[] = enrollmentResponse.data;

        const results = await Promise.all(
          enrollments.map(async (enrollment) => {
            const [courseResponse, progressResponse] = await Promise.all([
              api.get(`/courses/${enrollment.course_id}`),
              api.get(`/analytics/courses/${enrollment.course_id}/progress`),
            ]);

            return {
              ...progressResponse.data,
              course_title: courseResponse.data.title,
            };
          })
        );

        setItems(results);
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load course progress."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Learning Progress"
          subtitle="Track completed lessons and passed assessments."
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
        ) : items.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Enroll in a course to start tracking progress.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 3 }}>
            {items.map((item, index) => (
              <Box
                key={item.course_id}
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card sx={progressCardSx}>
                  <Box
                    sx={{
                      height: 6,
                      background:
                        progressGradients[index % progressGradients.length],
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {item.course_title}
                      </Typography>

                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 3,
                          color: "white",
                          background:
                            progressGradients[
                              index % progressGradients.length
                            ],
                              boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",                        }}
                      >
                        <Typography sx={{ fontWeight: 900 }}>
                          {item.progress_percentage.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(item.progress_percentage, 100)}
                      sx={{
                        height: 12,
                        borderRadius: 10,
                        mt: 3,
                        mb: 3,
                        backgroundColor: "rgba(148, 163, 184, 0.18)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 10,
                          background:
                            progressGradients[
                              index % progressGradients.length
                            ],
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      {[
                        {
                          label: "Lessons",
                          value: `${item.completed_lessons}/${item.total_lessons}`,
                        },
                        {
                          label: "Assessments Attempted",
                          value: `${item.completed_attempts}/${item.total_assessments}`,
                        },
                        {
                          label: "Assessments Passed",
                          value: `${item.passed_assessments}/${item.total_assessments}`,
                        },
                      ].map((stat) => (
                        <Box
                          key={stat.label}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            background:
                              "linear-gradient(135deg, rgba(255,247,237,0.95), rgba(253,244,255,0.95))",
                              border: "1px solid rgba(148,163,184,0.18)",
                          }}
                        >
                          <Typography color="text.secondary">
                            {stat.label}
                          </Typography>
                          <Typography sx={{ fontWeight: 900, mt: 0.5 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      variant="contained"
                      sx={{
                        mt: 3,
                        borderRadius: 3,
                        fontWeight: 800,
                        background:
                          progressGradients[index % progressGradients.length],
                        boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",                      }}
                      onClick={() => navigate(`/learn/${item.course_id}`)}
                    >
                      Continue Learning
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