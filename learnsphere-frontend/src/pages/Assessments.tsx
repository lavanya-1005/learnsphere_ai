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
  Typography,
} from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type Assessment = {
  id: number;
  course_id: number;
  title: string;
  total_marks: number;
  created_at: string;
};

const assessmentGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const assessmentCardSx = {
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

export default function Assessments() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const response = await api.get(`/courses/${courseId}/assessments`);
        setAssessments(response.data);
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load assessments."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [courseId]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Assessments"
          subtitle="Complete the course quizzes and review your results."
          backTo={`/learn/${courseId}`}
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
        ) : assessments.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No assessments are available.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {assessments.map((assessment, index) => (
              <Box
                key={assessment.id}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card sx={assessmentCardSx}>
                  <Box
                    sx={{
                      height: 5,
                      background:
                        assessmentGradients[
                          index % assessmentGradients.length
                        ],
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      alignItems: { xs: "flex-start", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                        background:
                          assessmentGradients[
                            index % assessmentGradients.length
                          ],
                        boxShadow: "0 14px 28px rgba(15, 23, 42, 0.16)",
                      }}
                    >
                      <QuizIcon />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {assessment.title}
                      </Typography>

                      <Chip
                        label={`${assessment.total_marks} marks`}
                        size="small"
                        sx={{
                          mt: 1,
                          fontWeight: 800,
                          color: "white",
                          background:
                            assessmentGradients[
                              index % assessmentGradients.length
                            ],
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() =>
                        navigate(`/assessments/${assessment.id}/quiz`)
                      }
                      sx={{
                        borderRadius: 3,
                        fontWeight: 900,
                        background:
                          assessmentGradients[
                            index % assessmentGradients.length
                          ],
                        boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                      }}
                    >
                      Start Quiz
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