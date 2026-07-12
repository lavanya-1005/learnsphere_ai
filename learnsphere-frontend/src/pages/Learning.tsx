import { useEffect, useState } from "react";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageHeader from "../components/PageHeader";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import QuizIcon from "@mui/icons-material/Quiz";
import api from "../api/api";

type Lesson = {
  id: number;
  course_id: number;
  title: string;
  type: string;
  content_url: string | null;
  order_no: number;
};

type LessonProgress = {
  id: number;
  user_id: number;
  lesson_id: number;
  completed_at: string;
};

export default function Learning() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [lessonsResponse, progressResponse] = await Promise.all([
        api.get(`/courses/${courseId}/lessons`),
        api.get("/users/me/lesson-progress"),
      ]);

      setLessons(lessonsResponse.data);

      setCompletedIds(
        progressResponse.data.map(
          (progress: LessonProgress) => progress.lesson_id
        )
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to load lessons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const openContent = async (lessonId: number) => {
    try {
      setOpeningId(lessonId);
      setError("");

      const response = await api.get(`/lessons/${lessonId}/content`, {
        responseType: "blob",
      });

      const fileUrl = URL.createObjectURL(response.data);
      window.open(fileUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to open lesson content."
      );
    } finally {
      setOpeningId(null);
    }
  };

  const markComplete = async (lessonId: number) => {
    try {
      setError("");
      await api.post(`/lessons/${lessonId}/complete`);

      setCompletedIds((current) =>
        current.includes(lessonId) ? current : [...current, lessonId]
      );

      setMessage("Lesson marked as complete.");
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to complete this lesson."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>

      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
            title="Course Learning"
            subtitle="Open lessons and track your completion."
            backTo="/my-courses"
            actions={
              <Button
                variant="contained"
                startIcon={<QuizIcon />}
                onClick={() => navigate(`/courses/${courseId}/assessments`)}
              >
                Assessments
              </Button>
            }
          />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : lessons.length === 0 ? (
          <Alert severity="info">No lessons are available yet.</Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {lessons.map((lesson) => {
              const completed = completedIds.includes(lesson.id);

              return (
                <Card key={lesson.id} sx={{ borderRadius: 3 }}>
                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      gap: 3,
                      alignItems: { xs: "flex-start", md: "center" },
                      flexDirection: { xs: "column", md: "row" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        color: completed ? "#166534" : "#1e3a8a",
                        background: completed ? "#dcfce7" : "#dbeafe",
                        fontWeight: 900,
                      }}
                    >
                      {lesson.order_no}
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {lesson.title}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip label={lesson.type.toUpperCase()} size="small" />

                        {completed && (
                          <Chip
                            label="Completed"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        variant="outlined"
                        startIcon={<OpenInNewIcon />}
                        disabled={openingId === lesson.id}
                        onClick={() => openContent(lesson.id)}
                      >
                        {openingId === lesson.id ? "Opening..." : "Open"}
                      </Button>

                      <Button
                        variant="contained"
                        color={completed ? "success" : "primary"}
                        startIcon={<CheckCircleIcon />}
                        disabled={completed}
                        onClick={() => markComplete(lesson.id)}
                      >
                        {completed ? "Completed" : "Mark Complete"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}