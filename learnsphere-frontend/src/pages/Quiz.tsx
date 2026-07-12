import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import api from "../api/api";
import PageHeader from "../components/PageHeader";

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

type AttemptResult = {
  id: number;
  user_id: number;
  assessment_id: number;
  score: number;
  percentage: number;
  result: string;
  status: string;
  created_at: string;
};

const quizGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const quizCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
};

export default function Quiz() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await api.get(
          `/assessments/${assessmentId}/questions`
        );

        setQuestions(response.data);
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load quiz questions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [assessmentId]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(`/assessments/${assessmentId}/attempt`, {
        answers: questions.map((question) => ({
          question_id: question.id,
          answer: answers[question.id],
        })),
      });

      setResult(response.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to submit assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Course Assessment"
          subtitle="Answer every question before submitting."
          backTo="/my-courses"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {result ? (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card sx={quizCardSx}>
              <Box
                sx={{
                  height: 8,
                  background:
                    result.result === "pass"
                      ? quizGradients[1]
                      : quizGradients[3],
                }}
              />

              <CardContent sx={{ p: 5, textAlign: "center" }}>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  {result.result === "pass" ? "Quiz Passed" : "Quiz Failed"}
                </Typography>

                <Typography
                  variant="h2"
                  sx={{
                    mt: 3,
                    fontWeight: 900,
                    background:
                      result.result === "pass"
                        ? quizGradients[1]
                        : quizGradients[3],
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {result.percentage.toFixed(2)}%
                </Typography>

                <Typography sx={{ mt: 2, fontWeight: 800 }}>
                  Score: {result.score}
                </Typography>

                <Button
                  variant="contained"
                  sx={{
                    mt: 4,
                    borderRadius: 3,
                    fontWeight: 900,
                    background: quizGradients[0],
                  }}
                  onClick={() => navigate("/my-courses")}
                >
                  Return to My Courses
                </Button>

                <Button
                  variant="outlined"
                  sx={{ mt: 4, ml: 2, borderRadius: 3, fontWeight: 800 }}
                  onClick={() => navigate(`/attempts/${result.id}/review`)}
                >
                  Review Answers
                </Button>
              </CardContent>
            </Card>
          </Box>
        ) : questions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No questions are available.
          </Alert>
        ) : (
          <>
            <Box sx={{ display: "grid", gap: 3 }}>
              {questions.map((question, index) => (
                <Box
                  key={question.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <Card sx={quizCardSx}>
                    <Box
                      sx={{
                        height: 5,
                        background: quizGradients[index % quizGradients.length],
                      }}
                    />

                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {index + 1}. {question.question}
                      </Typography>

                      <FormControl sx={{ mt: 2, width: "100%" }}>
                        <RadioGroup
                          value={answers[question.id] || ""}
                          onChange={(event) =>
                            handleAnswer(question.id, event.target.value)
                          }
                        >
                          {[
                            { value: "A", label: question.option_a },
                            { value: "B", label: question.option_b },
                            { value: "C", label: question.option_c },
                            { value: "D", label: question.option_d },
                          ].map((option) => {
                            const selected =
                              answers[question.id] === option.value;

                            return (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                                sx={{
                                  mb: 1,
                                  px: 1.5,
                                  py: 0.7,
                                  borderRadius: 3,
                                  background: selected
                                    ? "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.12))"
                                    : "rgba(248,250,252,0.8)",
                                  border: selected
                                    ? "1px solid rgba(124,58,237,0.28)"
                                    : "1px solid rgba(148,163,184,0.16)",
                                }}
                              />
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={submitting}
              onClick={submitQuiz}
              sx={{
                mt: 4,
                py: 1.4,
                borderRadius: 3,
                fontWeight: 900,
                background: quizGradients[0],
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.16)",
              }}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}