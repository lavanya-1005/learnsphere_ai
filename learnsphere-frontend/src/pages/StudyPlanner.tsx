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
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type Course = {
  id: number;
  title: string;
};

type StudyPlan = {
  id: number;
  user_id: number;
  course_id: number;
  title: string;
  target_date: string;
  daily_minutes: number;
  status: string;
  created_at: string;
};

const plannerGradients = [
  "linear-gradient(135deg, #7c3aed, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #8b5cf6, #06b6d4)",
];

const plannerCardSx = {
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

export default function StudyPlanner() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState("30");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [enrollmentResponse, plansResponse] = await Promise.all([
        api.get("/users/me/enrollments"),
        api.get("/study-plans/me"),
      ]);

      const courseResponses = await Promise.all(
        enrollmentResponse.data.map((enrollment: { course_id: number }) =>
          api.get(`/courses/${enrollment.course_id}`)
        )
      );

      setCourses(
        courseResponses.map((response) => ({
          id: response.data.id,
          title: response.data.title,
        }))
      );

      setPlans(plansResponse.data);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load study plans."
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createPlan = async () => {
    if (!courseId || !title.trim() || !targetDate) {
      setError("Complete all study-plan fields.");
      return;
    }

    try {
      setError("");

      await api.post("/study-plans/", {
        course_id: Number(courseId),
        title: title.trim(),
        target_date: targetDate,
        daily_minutes: Number(dailyMinutes),
      });

      setTitle("");
      setTargetDate("");
      setDailyMinutes("30");
      setMessage("Study plan created successfully.");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to create study plan."
      );
    }
  };

  const completePlan = async (planId: number) => {
    try {
      await api.put(`/study-plans/${planId}`, {
        status: "completed",
      });

      setMessage("Study plan marked as completed.");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to update study plan."
      );
    }
  };

  const deletePlan = async (planId: number) => {
    try {
      await api.delete(`/study-plans/${planId}`);
      setMessage("Study plan deleted.");
      await loadData();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to delete study plan."
      );
    }
  };

  const getCourseTitle = (id: number) =>
    courses.find((course) => course.id === id)?.title || `Course ${id}`;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Study Planner"
          subtitle="Organize your learning schedule and study goals."
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
          <Card sx={{ ...plannerCardSx, mb: 4 }}>
            <Box
              sx={{
                height: 8,
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",              }}
            />

            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>
                Create Study Plan
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  select
                  label="Course"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Plan title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />

                <TextField
                  type="date"
                  label="Target date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                  type="number"
                  label="Daily study minutes"
                  value={dailyMinutes}
                  onChange={(event) => setDailyMinutes(event.target.value)}
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={createPlan}
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #f97316, #ec4899)",
                  boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                }}
              >
                Create Study Plan
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>
          My Plans
        </Typography>

        {plans.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No study plans created yet.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {plans.map((plan, index) => (
              <Box
                key={plan.id}
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card sx={plannerCardSx}>
                  <Box
                    sx={{
                      height: 6,
                      background:
                        plannerGradients[index % plannerGradients.length],
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      alignItems: { xs: "flex-start", md: "center" },
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {plan.title}
                      </Typography>

                      <Typography color="text.secondary">
                        {getCourseTitle(plan.course_id)}
                      </Typography>

                      <Typography sx={{ mt: 1 }}>
                        Target:{" "}
                        {new Date(plan.target_date).toLocaleDateString()} ·{" "}
                        {plan.daily_minutes} minutes/day
                      </Typography>

                      <Chip
                        label={plan.status.toUpperCase()}
                        size="small"
                        sx={{
                          mt: 2,
                          fontWeight: 800,
                          color: "white",
                          background:
                            plan.status === "completed"
                              ? "linear-gradient(135deg, #22c55e, #14b8a6)"
                              : plannerGradients[
                                  index % plannerGradients.length
                                ],
                        }}
                      />
                    </Box>

                    {plan.status !== "completed" && (
                      <Button
                        variant="contained"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => completePlan(plan.id)}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 800,
                          background:
                            "linear-gradient(135deg, #22c55e, #14b8a6)",
                        }}
                      >
                        Complete
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deletePlan(plan.id)}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                      }}
                    >
                      Delete
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