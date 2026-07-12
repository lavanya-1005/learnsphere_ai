import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type Question = {
  id: number;
  assessment_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
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

export default function ManageAssessment() {
  const { assessmentId } = useParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [answer, setAnswer] = useState("");
  const [marks, setMarks] = useState("1");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQuestions = async () => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/questions`);
      setQuestions(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load assessment questions."
      );
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [assessmentId]);

  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setAnswer("");
    setMarks("1");
  };

  const saveQuestion = async () => {
    if (
      !question.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      setError("Complete the question and all four options.");
      return;
    }

    if (!editingId && !answer) {
      setError("Select the correct answer.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const requestData: Record<string, string | number> = {
        question: question.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        marks: Number(marks),
      };

      if (answer) {
        requestData.answer = answer;
      }

      if (editingId) {
        await api.put(`/questions/${editingId}`, requestData);
        setMessage("Question updated successfully.");
      } else {
        await api.post(`/assessments/${assessmentId}/questions`, requestData);
        setMessage("Question added successfully.");
      }

      resetForm();
      await loadQuestions();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (item: Question) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setOptionA(item.option_a);
    setOptionB(item.option_b);
    setOptionC(item.option_c);
    setOptionD(item.option_d);
    setAnswer("");
    setMarks(String(item.marks));

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteQuestion = async (questionId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/questions/${questionId}`);
      setMessage("Question deleted successfully.");
      await loadQuestions();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to delete question."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1050, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Manage Assessment"
          subtitle="Create and edit assessment questions."
          backTo="/instructor/courses"
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
          <Card sx={assessmentCardSx}>
            <Box sx={{ height: 7, background: assessmentGradients[0] }} />

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {editingId ? "Update Question" : "Add Question"}
              </Typography>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                sx={{ mt: 3 }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  label="Option A"
                  value={optionA}
                  onChange={(event) => setOptionA(event.target.value)}
                />

                <TextField
                  label="Option B"
                  value={optionB}
                  onChange={(event) => setOptionB(event.target.value)}
                />

                <TextField
                  label="Option C"
                  value={optionC}
                  onChange={(event) => setOptionC(event.target.value)}
                />

                <TextField
                  label="Option D"
                  value={optionD}
                  onChange={(event) => setOptionD(event.target.value)}
                />

                <TextField
                  select
                  label={
                    editingId
                      ? "New correct answer (optional)"
                      : "Correct answer"
                  }
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                >
                  {editingId && (
                    <MenuItem value="">Keep current answer</MenuItem>
                  )}
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="D">D</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  label="Marks"
                  value={marks}
                  onChange={(event) => setMarks(event.target.value)}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={editingId ? <EditIcon /> : <AddIcon />}
                  disabled={saving}
                  onClick={saveQuestion}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 900,
                    background: assessmentGradients[0],
                    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Question"
                    : "Add Question"}
                </Button>

                {editingId && (
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    sx={{ borderRadius: 3, fontWeight: 800 }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mt: 5, mb: 3 }}>
          Question Bank
        </Typography>

        {questions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No questions added yet.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {questions.map((item, index) => (
              <Box
                key={item.id}
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

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {index + 1}. {item.question}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, 1fr)",
                        },
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      {[
                        `A. ${item.option_a}`,
                        `B. ${item.option_b}`,
                        `C. ${item.option_c}`,
                        `D. ${item.option_d}`,
                      ].map((option) => (
                        <Box
                          key={option}
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            background:
                              "linear-gradient(135deg, rgba(240,253,250,0.9), rgba(245,243,255,0.9))",
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                          }}
                        >
                          <Typography>{option}</Typography>
                        </Box>
                      ))}
                    </Box>

                    <Chip
                      label={`${item.marks} marks`}
                      size="small"
                      sx={{
                        mt: 2,
                        color: "white",
                        fontWeight: 800,
                        background:
                          assessmentGradients[
                            index % assessmentGradients.length
                          ],
                      }}
                    />

                    <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => editQuestion(item)}
                        sx={{ borderRadius: 3, fontWeight: 800 }}
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteQuestion(item.id)}
                        sx={{ borderRadius: 3, fontWeight: 800 }}
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
      </Box>
    </Box>
  );
}