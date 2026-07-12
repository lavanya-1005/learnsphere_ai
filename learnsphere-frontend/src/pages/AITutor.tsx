import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PageHeader from "../components/PageHeader";
import api from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Chat = {
  id: number;
  user_id: number;
  course_id: number | null;
  message: string;
  response: string;
  source: "local_mcp" | "groq_ai" | "restricted";
  created_at: string;
};

type Enrollment = {
  course_id: number;
};

type CourseOption = {
  id: number;
  title: string;
};

const tutorGradients = [
  "linear-gradient(135deg, #7c3aed, #06b6d4)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
];

export default function AITutor() {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [chatResponse, enrollmentResponse] = await Promise.all([
        api.get("/ai/chats"),
        api.get("/users/me/enrollments"),
      ]);

      const enrollments: Enrollment[] = enrollmentResponse.data;

      const courseResponses = await Promise.all(
        enrollments.map((item) => api.get(`/courses/${item.course_id}`))
      );

      setCourses(
        courseResponses.map((response) => ({
          id: response.data.id,
          title: response.data.title,
        }))
      );

      setChats([...chatResponse.data].reverse());
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail || "Unable to load AI Tutor."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = async () => {
    if (!message.trim()) {
      setError("Enter a question.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await api.post("/ai/chat", {
        course_id: courseId ? Number(courseId) : null,
        message: message.trim(),
      });

      setChats((current) => [...current, response.data]);
      setMessage("");
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to get AI Tutor response."
      );
    } finally {
      setSending(false);
    }
  };

  const sourceColor = (source: Chat["source"]) => {
    if (source === "local_mcp") return "success";
    if (source === "groq_ai") return "primary";
    return "warning";
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 950,
          mx: "auto",
          p: { xs: 2, md: 4 },
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageHeader
          title="AI Tutor"
          subtitle="Ask questions and get help with your enrolled courses."
          backTo="/dashboard"
        />

        <TextField
          select
          label="Course context"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
          sx={{
            mb: 2,
            background: "rgba(255,255,255,0.86)",
            borderRadius: 3,
          }}
        >
          <MenuItem value="">General learning question</MenuItem>

          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.title}
            </MenuItem>
          ))}
        </TextField>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 3 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          sx={{
            flexGrow: 1,
            minHeight: 480,
            maxHeight: "65vh",
            overflowY: "auto",
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            background: "rgba(255,255,255,0.84)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          }}
        >
          {loading ? (
            <Box sx={{ display: "grid", placeItems: "center", height: 400 }}>
              <CircularProgress />
            </Box>
          ) : chats.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: 4,
                  mx: "auto",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  background: tutorGradients[0],
                  boxShadow: "0 18px 38px rgba(124, 58, 237, 0.25)",
                }}
              >
                <SmartToyIcon sx={{ fontSize: 44 }} />
              </Box>

              <Typography variant="h5" sx={{ mt: 2, fontWeight: 900 }}>
                Ask your first question
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Try: "Explain Java inheritance with an example."
              </Typography>
            </Box>
          ) : (
            chats.map((chat, index) => (
              <Box
                key={chat.id}
                component={motion.div}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                sx={{ mb: 4 }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Box
                    sx={{
                      maxWidth: "75%",
                      p: 2,
                      borderRadius: "18px 18px 4px 18px",
                      background: tutorGradients[index % tutorGradients.length],
                      color: "white",
                      fontWeight: 700,
                      boxShadow: "0 14px 30px rgba(15, 23, 42, 0.16)",
                    }}
                  >
                    {chat.message}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "82%",
                      p: 2.5,
                      borderRadius: "18px 18px 18px 4px",
                      background:
                        "linear-gradient(135deg, rgba(240,253,250,0.95), rgba(245,243,255,0.95))",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                    }}
                  >
                    <Box
                      sx={{
                        lineHeight: 1.7,
                        "& h1, & h2, & h3": {
                          color: "#0f172a",
                          fontWeight: 900,
                          mt: 2,
                          mb: 1,
                        },
                        "& p": { my: 1.2 },
                        "& ul, & ol": { pl: 3, my: 1.5 },
                        "& li": { mb: 0.7 },
                        "& pre": {
                          background: "#0f172a",
                          color: "#e2e8f0",
                          p: 2,
                          borderRadius: 2,
                          overflowX: "auto",
                          my: 2,
                        },
                        "& pre code": {
                          background: "transparent",
                          color: "inherit",
                          p: 0,
                        },
                        "& code": {
                          background: "#e0f2fe",
                          color: "#7c3aed",
                          px: 0.7,
                          py: 0.2,
                          borderRadius: 1,
                          fontFamily: "Consolas, monospace",
                        },
                        "& strong": { color: "#7c3aed" },
                        "& blockquote": {
                          borderLeft: "4px solid #06b6d4",
                          ml: 0,
                          pl: 2,
                          color: "#475569",
                        },
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {chat.response}
                      </ReactMarkdown>
                    </Box>

                    <Chip
                      label={chat.source.replace("_", " ").toUpperCase()}
                      color={sourceColor(chat.source)}
                      size="small"
                      sx={{ mt: 2, fontWeight: 800 }}
                    />
                  </Box>
                </Box>
              </Box>
            ))
          )}

          <div ref={bottomRef} />
        </Paper>

        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask a course-related question..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            sx={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 3,
            }}
          />

          <Button
            variant="contained"
            disabled={sending}
            onClick={sendMessage}
            sx={{
              minWidth: 110,
              borderRadius: 3,
              fontWeight: 900,
              background: tutorGradients[0],
              boxShadow: "0 14px 30px rgba(124, 58, 237, 0.22)",
            }}
            endIcon={<SendIcon />}
          >
            {sending ? "Sending" : "Send"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}