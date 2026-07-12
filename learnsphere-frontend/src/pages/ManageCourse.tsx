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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import QuizIcon from "@mui/icons-material/Quiz";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import type { Course } from "../types/course";

type Lesson = {
  id: number;
  course_id: number;
  title: string;
  type: string;
  content_url: string | null;
  order_no: number;
};

type Assessment = {
  id: number;
  course_id: number;
  title: string;
  total_marks: number;
  created_at: string;
};

const manageGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const manageCardSx = {
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

export default function ManageCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [editingCourse, setEditingCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("0");
  const [savingCourse, setSavingCourse] = useState(false);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("pdf");
  const [orderNo, setOrderNo] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null);
  const [loadingLessonDetails, setLoadingLessonDetails] = useState(false);

  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [editingAssessmentId, setEditingAssessmentId] = useState<
    number | null
  >(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [courseResponse, lessonResponse, assessmentResponse] =
        await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/courses/${courseId}/lessons`),
          api.get(`/courses/${courseId}/assessments`),
        ]);

      setCourse(courseResponse.data);
      setLessons(lessonResponse.data);
      setAssessments(assessmentResponse.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load course management data."
      );
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const startEditingCourse = () => {
    if (!course) return;

    setCourseTitle(course.title);
    setCourseDescription(course.description || "");
    setCoursePrice(String(course.price));
    setEditingCourse(true);
    setError("");
    setMessage("");
  };

  const saveCourse = async () => {
    if (courseTitle.trim().length < 3) {
      setError("Course title must contain at least 3 characters.");
      return;
    }

    const price = Number(coursePrice);

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid course price.");
      return;
    }

    try {
      setSavingCourse(true);
      setError("");
      setMessage("");

      await api.put(`/courses/${courseId}`, {
        title: courseTitle.trim(),
        description: courseDescription.trim() || null,
        price,
      });

      setEditingCourse(false);
      setMessage("Course updated successfully.");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to update course."
      );
    } finally {
      setSavingCourse(false);
    }
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonTitle("");
    setLessonType("pdf");
    setOrderNo(String(lessons.length + 1));
    setFile(null);
  };

  const saveLesson = async () => {
    if (!lessonTitle.trim()) {
      setError("Enter a lesson title.");
      return;
    }

    if (!editingLessonId && !file) {
      setError("Select a content file.");
      return;
    }

    try {
      setSavingLesson(true);
      setError("");
      setMessage("");

      let contentUrl: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await api.post(
          "/uploads/content",
          formData
        );

        contentUrl = uploadResponse.data.url;
      }

      const lessonData: {
        title: string;
        type: string;
        order_no: number;
        content_url?: string;
      } = {
        title: lessonTitle.trim(),
        type: lessonType,
        order_no: Number(orderNo),
      };

      if (contentUrl) {
        lessonData.content_url = contentUrl;
      }

      if (editingLessonId) {
        await api.put(`/lessons/${editingLessonId}`, lessonData);
        setMessage("Lesson updated successfully.");
      } else {
        await api.post(`/courses/${courseId}/lessons`, lessonData);
        setMessage("Content uploaded and lesson created.");
      }

      resetLessonForm();
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to save lesson."
      );
    } finally {
      setSavingLesson(false);
    }
  };

  const startEditingLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonType(lesson.type);
    setOrderNo(String(lesson.order_no));
    setFile(null);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteLesson = async (lessonId: number) => {
    const confirmed = window.confirm(
      "Delete this lesson and its uploaded content?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/lessons/${lessonId}`);

      if (editingLessonId === lessonId) {
        resetLessonForm();
      }

      setMessage("Lesson deleted successfully.");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to delete lesson."
      );
    }
  };

  const viewLessonDetails = async (lessonId: number) => {
    try {
      setLoadingLessonDetails(true);
      setError("");

      const response = await api.get(`/lessons/${lessonId}`);
      setLessonDetails(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load lesson details."
      );
    } finally {
      setLoadingLessonDetails(false);
    }
  };

  const openLessonContent = async (lessonId: number) => {
    try {
      setOpeningId(lessonId);
      setError("");

      const response = await api.get(`/lessons/${lessonId}/content`, {
        responseType: "blob",
      });

      const fileUrl = URL.createObjectURL(response.data);
      window.open(fileUrl, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to open lesson content."
      );
    } finally {
      setOpeningId(null);
    }
  };

  const resetAssessmentForm = () => {
    setEditingAssessmentId(null);
    setAssessmentTitle("");
  };

  const saveAssessment = async () => {
    if (assessmentTitle.trim().length < 3) {
      setError("Assessment title must have at least 3 characters.");
      return;
    }

    try {
      setSavingAssessment(true);
      setError("");
      setMessage("");

      if (editingAssessmentId) {
        await api.put(`/assessments/${editingAssessmentId}`, {
          title: assessmentTitle.trim(),
        });
        setMessage("Assessment updated successfully.");
      } else {
        await api.post(`/courses/${courseId}/assessments`, {
          title: assessmentTitle.trim(),
        });
        setMessage("Assessment created successfully.");
      }

      resetAssessmentForm();
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to save assessment."
      );
    } finally {
      setSavingAssessment(false);
    }
  };

  const startEditingAssessment = (assessment: Assessment) => {
    setEditingAssessmentId(assessment.id);
    setAssessmentTitle(assessment.title);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAssessment = async (assessmentId: number) => {
    const confirmed = window.confirm(
      "Delete this assessment and all of its questions?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/assessments/${assessmentId}`);

      if (editingAssessmentId === assessmentId) {
        resetAssessmentForm();
      }

      setMessage("Assessment deleted successfully.");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to delete assessment."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1150, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Manage Course"
          subtitle="Upload lessons and create assessments."
          backTo="/instructor/courses"
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError("")}
          >
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

        {course && (
          <Box
            sx={{
              p: 4,
              borderRadius: 4,
              color: "white",
              background: manageGradients[0],
              boxShadow: "0 24px 65px rgba(15, 23, 42, 0.16)",
              position: "relative",
              overflow: "hidden",              
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  {course.title}
                </Typography>

                <Typography sx={{ mt: 1, opacity: 0.9 }}>
                  {course.description || "No description available."}
                </Typography>

                <Typography sx={{ mt: 1, opacity: 0.9 }}>
                  Price: {Number(course.price) === 0
                    ? "Free"
                    : `₹${Number(course.price).toFixed(2)}`}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<EditIcon />}
                onClick={startEditingCourse}
              >
                Edit Course
              </Button>
            </Box>
          </Box>
        )}

        {editingCourse && (
            <Card sx={{ ...manageCardSx, mb: 4 }}>            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Edit Course
              </Typography>

              <TextField
                fullWidth
                label="Course title"
                value={courseTitle}
                onChange={(event) => setCourseTitle(event.target.value)}
                sx={{ mt: 3 }}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={courseDescription}
                onChange={(event) =>
                  setCourseDescription(event.target.value)
                }
                sx={{ mt: 2 }}
              />

              <TextField
                fullWidth
                type="number"
                label="Price"
                value={coursePrice}
                onChange={(event) => setCoursePrice(event.target.value)}
                sx={{ mt: 2 }}
              />

              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <Button
                  variant="contained"
                  disabled={savingCourse}
                  onClick={saveCourse}
                >
                  {savingCourse ? "Saving..." : "Save Course"}
                </Button>

                <Button
                  variant="outlined"
                  disabled={savingCourse}
                  onClick={() => setEditingCourse(false)}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 3,
          }}
        >
            <Card sx={manageCardSx}>
              <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {editingLessonId ? "Edit Lesson" : "Add Lesson"}
              </Typography>

              <TextField
                fullWidth
                label="Lesson title"
                value={lessonTitle}
                onChange={(event) => setLessonTitle(event.target.value)}
                sx={{ mt: 3 }}
              />

              <TextField
                select
                fullWidth
                label="Lesson type"
                value={lessonType}
                onChange={(event) => setLessonType(event.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="note">Note</MenuItem>
                <MenuItem value="resource">Resource</MenuItem>
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Order number"
                value={orderNo}
                onChange={(event) => setOrderNo(event.target.value)}
                sx={{ mt: 2 }}
              />

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
              >
                Select Content
                <input
                  hidden
                  type="file"
                  accept=".pdf,.mp4,.jpg,.jpeg,.png,.txt,.docx"
                  onChange={(event) =>
                    setFile(event.target.files?.[0] || null)
                  }
                />
              </Button>

              {file && (
                <Typography sx={{ mt: 2 }}>
                  Selected: {file.name}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                startIcon={editingLessonId ? <EditIcon /> : <AddIcon />}
                disabled={savingLesson}
                onClick={saveLesson}
                sx={{ mt: 3 }}
              >
                {savingLesson
                  ? "Saving..."
                  : editingLessonId
                  ? "Update Lesson"
                  : "Create Lesson"}
              </Button>

              {editingLessonId && (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={savingLesson}
                  onClick={resetLessonForm}
                  sx={{ mt: 1 }}
                >
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>

          <Card sx={manageCardSx}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {editingAssessmentId
                  ? "Edit Assessment"
                  : "Create Assessment"}
              </Typography>

              <TextField
                fullWidth
                label="Assessment title"
                value={assessmentTitle}
                onChange={(event) =>
                  setAssessmentTitle(event.target.value)
                }
                sx={{ mt: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={editingAssessmentId ? <EditIcon /> : <QuizIcon />}
                disabled={savingAssessment}
                onClick={saveAssessment}
                sx={{ mt: 3 }}
              >
                {savingAssessment
                  ? "Saving..."
                  : editingAssessmentId
                  ? "Update Assessment"
                  : "Create Assessment"}
              </Button>

              {editingAssessmentId && (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={savingAssessment}
                  onClick={resetAssessmentForm}
                  sx={{ mt: 1 }}
                >
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mt: 5, mb: 3 }}>
          Lessons
        </Typography>

        {lessons.length === 0 ? (
          <Alert severity="info">No lessons created yet.</Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {lessons.map((lesson, index) => (
              <Box
                key={lesson.id}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card sx={manageCardSx}>
                  <Box
                    sx={{
                      height: 5,
                      background: manageGradients[index % manageGradients.length],
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
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {lesson.order_no}. {lesson.title}
                    </Typography>

                    <Chip
                      label={lesson.type.toUpperCase()}
                      size="small"
                      sx={{
                        mt: 1,
                        color: "white",
                        fontWeight: 800,
                        background: manageGradients[index % manageGradients.length],
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      startIcon={<InfoOutlinedIcon />}
                      disabled={loadingLessonDetails}
                      onClick={() => viewLessonDetails(lesson.id)}
                    >
                      Details
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      disabled={openingId === lesson.id || !lesson.content_url}
                      onClick={() => openLessonContent(lesson.id)}
                    >
                      {openingId === lesson.id
                        ? "Opening..."
                        : "View Content"}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => startEditingLesson(lesson)}
                    >
                      Edit
                    </Button>

                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteLesson(lesson.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
                            </Card>
            </Box>
            ))}
          </Box>
        )}

        <Typography variant="h4" sx={{ fontWeight: 900, mt: 5, mb: 3 }}>
          Assessments
        </Typography>

        {assessments.length === 0 ? (
          <Alert severity="info">No assessments created yet.</Alert>
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
                <Card sx={manageCardSx}>
                  <Box
                    sx={{
                      height: 5,
                      background: manageGradients[index % manageGradients.length],
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
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {assessment.title}
                    </Typography>

                    <Typography color="text.secondary">
                      Total marks: {assessment.total_marks}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      onClick={() =>
                        navigate(
                          `/instructor/assessments/${assessment.id}`
                        )
                      }
                    >
                      Manage Questions
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => startEditingAssessment(assessment)}
                    >
                      Edit
                    </Button>

                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteAssessment(assessment.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
                </Box>
            ))}
          </Box>
        )}

        <Dialog
          open={Boolean(lessonDetails)}
          onClose={() => setLessonDetails(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Lesson Details</DialogTitle>

          <DialogContent dividers>
            {lessonDetails && (
              <Box sx={{ display: "grid", gap: 2 }}>
                <Typography>
                  <strong>Title:</strong> {lessonDetails.title}
                </Typography>

                <Typography>
                  <strong>Type:</strong>{" "}
                  {lessonDetails.type.toUpperCase()}
                </Typography>

                <Typography>
                  <strong>Order:</strong> {lessonDetails.order_no}
                </Typography>

                <Typography sx={{ overflowWrap: "anywhere" }}>
                  <strong>Content URL:</strong>{" "}
                  {lessonDetails.content_url || "No content attached"}
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            {lessonDetails?.content_url && (
              <Button
                startIcon={<OpenInNewIcon />}
                onClick={() => openLessonContent(lessonDetails.id)}
              >
                View Content
              </Button>
            )}

            <Button onClick={() => setLessonDetails(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
