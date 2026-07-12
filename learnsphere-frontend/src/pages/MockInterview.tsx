import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type InterviewQuestion = {
  id: number;
  category: string;
  question: string;
  difficulty: string;
  created_at: string;
};

type InterviewResult = {
  id: number;
  user_id: number;
  question_id: number;
  answer: string;
  feedback: string;
  score: number;
  created_at: string;
};

const interviewGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const interviewCardSx = {
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

export default function MockInterview() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [history, setHistory] = useState<InterviewResult[]>([]);
  const [questionId, setQuestionId] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [questionsResponse, historyResponse] = await Promise.all([
        api.get("/interviews/questions"),
        api.get("/interviews/me"),
      ]);

      setQuestions(questionsResponse.data);
      setHistory(historyResponse.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load interview module."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitAnswer = async () => {
    if (!questionId || answer.trim().length < 5) {
      setError("Select a question and enter a proper answer.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/interviews/mock", {
        question_id: Number(questionId),
        answer: answer.trim(),
      });

      setResult(response.data);
      setAnswer("");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to evaluate interview answer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedQuestion = questions.find(
    (question) => question.id === Number(questionId)
  );

  const questionText = (id: number) =>
    questions.find((question) => question.id === id)?.question ||
    `Question ${id}`;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Mock Interview"
          subtitle="Answer technical questions and receive AI-generated feedback."
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

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card sx={interviewCardSx}>
                <Box sx={{ height: 7, background: interviewGradients[0] }} />

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
                    Practice Question
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    label="Select interview question"
                    value={questionId}
                    onChange={(event) => {
                      setQuestionId(event.target.value);
                      setResult(null);
                    }}
                  >
                    {questions.map((question) => (
                      <MenuItem key={question.id} value={question.id}>
                        {question.category} - {question.difficulty} -{" "}
                        {question.question}
                      </MenuItem>
                    ))}
                  </TextField>

                  {selectedQuestion && (
                    <Box
                      sx={{
                        p: 3,
                        mt: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, rgba(240,253,250,0.96), rgba(245,243,255,0.96))",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip
                          label={selectedQuestion.category}
                          size="small"
                          sx={{
                            color: "white",
                            fontWeight: 800,
                            background: interviewGradients[0],
                          }}
                        />

                        <Chip
                          label={selectedQuestion.difficulty}
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {selectedQuestion.question}
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    label="Your answer"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    sx={{ mt: 3 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    onClick={submitAnswer}
                    sx={{
                      mt: 3,
                      py: 1.3,
                      borderRadius: 3,
                      fontWeight: 900,
                      background: interviewGradients[0],
                      boxShadow: "0 14px 30px rgba(15, 23, 42, 0.16)",
                    }}
                  >
                    {submitting
                      ? "AI is evaluating..."
                      : "Submit for AI Feedback"}
                  </Button>
                </CardContent>
              </Card>
            </Box>

            {result && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card sx={{ ...interviewCardSx, mt: 4 }}>
                  <Box
                    sx={{
                      height: 7,
                      background:
                        result.score >= 5
                          ? interviewGradients[1]
                          : interviewGradients[3],
                    }}
                  />

                  <CardContent sx={{ p: 4 }}>
                    <Chip
                      label={`Score: ${result.score}/10`}
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        fontSize: 16,
                        px: 1,
                        py: 2,
                        background:
                          result.score >= 5
                            ? interviewGradients[1]
                            : interviewGradients[3],
                      }}
                    />

                    <Typography
                      sx={{
                        mt: 3,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.8,
                        fontWeight: 600,
                      }}
                    >
                      {result.feedback}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Typography variant="h4" sx={{ fontWeight: 900, mt: 5, mb: 3 }}>
              Interview History
            </Typography>

            {history.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No mock interviews attempted yet.
              </Alert>
            ) : (
              <Box sx={{ display: "grid", gap: 2 }}>
                {history.map((item, index) => (
                  <Box
                    key={item.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <Card sx={interviewCardSx}>
                      <Box
                        sx={{
                          height: 5,
                          background:
                            interviewGradients[
                              index % interviewGradients.length
                            ],
                        }}
                      />

                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          {questionText(item.question_id)}
                        </Typography>

                        <Chip
                          label={`${item.score}/10`}
                          sx={{
                            mt: 2,
                            color: "white",
                            fontWeight: 900,
                            background:
                              item.score >= 5
                                ? interviewGradients[1]
                                : interviewGradients[3],
                          }}
                        />

                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                          {new Date(item.created_at).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}