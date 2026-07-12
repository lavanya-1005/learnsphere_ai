import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DownloadIcon from "@mui/icons-material/Download";
import PageHeader from "../components/PageHeader";
import api from "../api/api";

type Certificate = {
  id: number;
  user_id: number;
  course_id: number;
  url: string;
  issued_at: string;
};

type Enrollment = {
  course_id: number;
};

type Course = {
  id: number;
  title: string;
};

type CourseCertificateItem = {
  course: Course;
  certificate?: Certificate;
};

const API_BASE_URL = "http://127.0.0.1:8000";

const certificateGradients = [
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #ef4444, #f97316)",
  "linear-gradient(135deg, #eab308, #84cc16)",
];

const certificateCardSx = {
  borderRadius: 4,
  overflow: "hidden",
  background: "rgba(255,255,255,0.84)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  transition: "0.25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.15)",
  },
};

export default function Certificates() {
  const [items, setItems] = useState<CourseCertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCertificates = async () => {
    try {
      setLoading(true);

      const [enrollmentResponse, certificateResponse] = await Promise.all([
        api.get("/users/me/enrollments"),
        api.get("/certificates/me"),
      ]);

      const enrollments: Enrollment[] = enrollmentResponse.data;
      const certificates: Certificate[] = certificateResponse.data;

      const courseResponses = await Promise.all(
        enrollments.map((enrollment) =>
          api.get(`/courses/${enrollment.course_id}`)
        )
      );

      setItems(
        courseResponses.map((response) => {
          const course: Course = response.data;

          return {
            course,
            certificate: certificates.find(
              (certificate) => certificate.course_id === course.id
            ),
          };
        })
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const generateCertificate = async (courseId: number) => {
    try {
      setGeneratingId(courseId);
      setError("");
      setMessage("");

      await api.post(`/certificates/courses/${courseId}`);

      setMessage("Certificate generated successfully.");
      await loadCertificates();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.detail ||
          "Unable to generate certificate."
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const downloadCertificate = (url: string) => {
    window.open(`${API_BASE_URL}${url}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 5 } }}>
        <PageHeader
          title="Certificates"
          subtitle="Complete every lesson and pass all assessments to earn a certificate."
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

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Enroll in a course to start earning certificates.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 3 }}>
            {items.map(({ course, certificate }, index) => (
              <Box
                key={course.id}
                component={motion.div}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card sx={certificateCardSx}>
                  <Box
                    sx={{
                      height: 6,
                      background:
                        certificateGradients[
                          index % certificateGradients.length
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
                        width: 62,
                        height: 62,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        background: certificate
                          ? certificateGradients[
                              index % certificateGradients.length
                            ]
                          : "linear-gradient(135deg, #cbd5e1, #94a3b8)",
                        color: "white",
                        boxShadow: "0 14px 30px rgba(15, 23, 42, 0.16)",
                      }}
                    >
                      <EmojiEventsIcon />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {course.title}
                      </Typography>

                      <Typography color="text.secondary">
                        {certificate
                          ? `Issued on ${new Date(
                              certificate.issued_at
                            ).toLocaleDateString()}`
                          : "Complete the course to generate your certificate."}
                      </Typography>
                    </Box>

                    {certificate ? (
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => downloadCertificate(certificate.url)}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 800,
                          background:
                            certificateGradients[
                              index % certificateGradients.length
                            ],
                          boxShadow: "0 12px 26px rgba(15, 23, 42, 0.16)",
                        }}
                      >
                        View PDF
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        disabled={generatingId === course.id}
                        onClick={() => generateCertificate(course.id)}
                        sx={{
                          borderRadius: 3,
                          fontWeight: 800,
                          background:
                            "linear-gradient(135deg, #64748b, #334155)",
                        }}
                      >
                        {generatingId === course.id
                          ? "Generating..."
                          : "Generate Certificate"}
                      </Button>
                    )}
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