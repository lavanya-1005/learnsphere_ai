import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type InterviewQuestion = {
  id: number;
  category: string;
  question: string;
  difficulty: string;
  created_at: string;
};

const interviewQuestionGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
];

const interviewQuestionCardSx = {
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

export default function InterviewQuestions() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQuestions = async () => {
    try {
      const response = await api.get("/interviews/questions");
      setQuestions(response.data);
    } catch {
      setError("Unable to load interview questions.");
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const createQuestion = async () => {
    if (category.trim().length < 2 || question.trim().length < 5) {
      setError("Enter a valid category and question.");
      return;
    }

    try {
      setError("");

      await api.post("/interviews/questions", {
        category: category.trim(),
        question: question.trim(),
        difficulty,
      });

      setCategory("");
      setQuestion("");
      setDifficulty("easy");
      setMessage("Interview question created.");
      await loadQuestions();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to create interview question."
      );
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Interview Question Bank"
          subtitle="Create and manage questions for mock interviews."
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
          <Card sx={interviewQuestionCardSx}>
            <Box
              sx={{
                height: 7,
                background: interviewQuestionGradients[0],
              }}
            />

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Create Interview Question
              </Typography>

              <TextField
                fullWidth
                label="Category"
                placeholder="Java, Python, MongoDB..."
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                sx={{ mt: 3 }}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                sx={{ mt: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </TextField>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={createQuestion}
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 900,
                  background: interviewQuestionGradients[0],
                  boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                }}
              >
                Add Question
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mt: 5, mb: 3 }}>
          Question Bank
        </Typography>

        {questions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No interview questions created yet.
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
                <Card sx={interviewQuestionCardSx}>
                  <Box
                    sx={{
                      height: 5,
                      background:
                        interviewQuestionGradients[
                          index % interviewQuestionGradients.length
                        ],
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          color: "white",
                          fontWeight: 800,
                          background:
                            interviewQuestionGradients[
                              index % interviewQuestionGradients.length
                            ],
                        }}
                      />

                      <Chip
                        label={item.difficulty}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {item.question}
                    </Typography>
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