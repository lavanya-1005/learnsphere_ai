import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type Attempt = {
  id: number;
  assessment_id: number;
  score: number;
  percentage: number;
  result: string;
};

type AttemptAnswer = {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  marks_awarded: number;
};

type Question = {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
};

type ReviewItem = {
  answer: AttemptAnswer;
  question?: Question;
};

const reviewGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const reviewCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
};

export default function AttemptReview() {
  const { attemptId } = useParams();

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReview = async () => {
      try {
        const attemptsResponse = await api.get("/users/me/attempts");

        const currentAttempt = attemptsResponse.data.find(
          (item: Attempt) => item.id === Number(attemptId)
        );

        if (!currentAttempt) {
          setError("Attempt not found.");
          return;
        }

        setAttempt(currentAttempt);

        const [answersResponse, questionsResponse] = await Promise.all([
          api.get(`/attempts/${attemptId}/answers`),
          api.get(`/assessments/${currentAttempt.assessment_id}/questions`),
        ]);

        const questions: Question[] = questionsResponse.data;

        setItems(
          answersResponse.data.map((answer: AttemptAnswer) => ({
            answer,
            question: questions.find(
              (question) => question.id === answer.question_id
            ),
          }))
        );
      } catch (requestError: any) {
        setError(
          requestError.response?.data?.detail ||
            "Unable to load answer review."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [attemptId]);

  const getOptionText = (question: Question | undefined, option: string) => {
    if (!question) return option;

    const options: Record<string, string> = {
      A: question.option_a,
      B: question.option_b,
      C: question.option_c,
      D: question.option_d,
    };

    return `${option}. ${options[option] || ""}`;
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Attempt Review"
          subtitle="Review your answers and assessment results."
          backTo="/my-courses"
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
        ) : (
          <>
            {attempt && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card sx={{ ...reviewCardSx, mb: 4 }}>
                  <Box
                    sx={{
                      height: 8,
                      background:
                        attempt.result === "pass"
                          ? reviewGradients[1]
                          : reviewGradients[3],
                    }}
                  />

                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        background:
                          attempt.result === "pass"
                            ? reviewGradients[1]
                            : reviewGradients[3],
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {attempt.percentage.toFixed(2)}%
                    </Typography>

                    <Typography sx={{ mt: 1, fontWeight: 800 }}>
                      Score: {attempt.score} - Result:{" "}
                      {attempt.result.toUpperCase()}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Box sx={{ display: "grid", gap: 3 }}>
              {items.map(({ answer, question }, index) => (
                <Box
                  key={answer.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <Card sx={reviewCardSx}>
                    <Box
                      sx={{
                        height: 5,
                        background: answer.is_correct
                          ? reviewGradients[1]
                          : reviewGradients[3],
                      }}
                    />

                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 3,
                            display: "grid",
                            placeItems: "center",
                            color: "white",
                            flexShrink: 0,
                            background: answer.is_correct
                              ? reviewGradients[1]
                              : reviewGradients[3],
                          }}
                        >
                          {answer.is_correct ? (
                            <CheckCircleIcon />
                          ) : (
                            <CancelIcon />
                          )}
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            {index + 1}.{" "}
                            {question?.question ||
                              `Question ${answer.question_id}`}
                          </Typography>

                          <Typography sx={{ mt: 2 }}>
                            Your answer:{" "}
                            <strong>
                              {getOptionText(
                                question,
                                answer.selected_answer
                              )}
                            </strong>
                          </Typography>

                          {!answer.is_correct && (
                            <Typography sx={{ mt: 1, color: "success.main" }}>
                              Correct answer:{" "}
                              <strong>
                                {getOptionText(
                                  question,
                                  answer.correct_answer
                                )}
                              </strong>
                            </Typography>
                          )}

                          <Chip
                            label={`${answer.marks_awarded} marks awarded`}
                            size="small"
                            sx={{
                              mt: 2,
                              color: "white",
                              fontWeight: 800,
                              background: answer.is_correct
                                ? reviewGradients[1]
                                : "linear-gradient(135deg, #94a3b8, #64748b)",
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}