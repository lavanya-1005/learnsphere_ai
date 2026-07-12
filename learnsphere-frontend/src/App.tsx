import type { ReactElement } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import AITutor from "./pages/AITutor";

import Wallet from "./pages/Wallet";
import PaymentHistory from "./pages/PaymentHistory";
import MyCourses from "./pages/MyCourses";
import Learning from "./pages/Learning";
import Assessments from "./pages/Assessments";
import Quiz from "./pages/Quiz";
import AttemptReview from "./pages/AttemptReview";
import Progress from "./pages/Progress";
import Certificates from "./pages/Certificates";
import Recommendations from "./pages/Recommendations";
import StudyPlanner from "./pages/StudyPlanner";
import MockInterview from "./pages/MockInterview";

import InstructorKYC from "./pages/InstructorKYC";
import InstructorCourses from "./pages/InstructorCourses";
import ManageCourse from "./pages/ManageCourse";
import ManageAssessment from "./pages/ManageAssessment";
import InstructorAnalytics from "./pages/InstructorAnalytics";

import AdminKYC from "./pages/AdminKYC";
import AdminUsers from "./pages/AdminUsers";
import AdminCourses from "./pages/AdminCourses";

import InterviewQuestions from "./pages/InterviewQuestions";

function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Shared authenticated layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Shared routes */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route path="profile" element={<Profile />} />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route path="courses" element={<Courses />} />

          <Route
            path="courses/:courseId"
            element={<CourseDetails />}
          />

          <Route
            path="ai-tutor"
            element={<AITutor />}
          />

          {/* Student routes */}
          <Route
            path="wallet"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Wallet />
              </RoleRoute>
            }
          />

          <Route
            path="payment-history"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <PaymentHistory />
              </RoleRoute>
            }
          />

          <Route
            path="my-courses"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <MyCourses />
              </RoleRoute>
            }
          />

          <Route
            path="learn/:courseId"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Learning />
              </RoleRoute>
            }
          />

          <Route
            path="courses/:courseId/assessments"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Assessments />
              </RoleRoute>
            }
          />

          <Route
            path="assessments/:assessmentId/quiz"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Quiz />
              </RoleRoute>
            }
          />

          <Route
            path="attempts/:attemptId/review"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <AttemptReview />
              </RoleRoute>
            }
          />

          <Route
            path="progress"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Progress />
              </RoleRoute>
            }
          />

          <Route
            path="certificates"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Certificates />
              </RoleRoute>
            }
          />

          <Route
            path="recommendations"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <Recommendations />
              </RoleRoute>
            }
          />

          <Route
            path="study-planner"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <StudyPlanner />
              </RoleRoute>
            }
          />

          <Route
            path="mock-interview"
            element={
              <RoleRoute allowedRoles={["student"]}>
                <MockInterview />
              </RoleRoute>
            }
          />

          {/* Instructor routes */}
          <Route
            path="instructor/kyc"
            element={
              <RoleRoute allowedRoles={["instructor"]}>
                <InstructorKYC />
              </RoleRoute>
            }
          />

          <Route
            path="instructor/courses"
            element={
              <RoleRoute allowedRoles={["instructor"]}>
                <InstructorCourses />
              </RoleRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId"
            element={
              <RoleRoute allowedRoles={["instructor"]}>
                <ManageCourse />
              </RoleRoute>
            }
          />

          <Route
            path="instructor/assessments/:assessmentId"
            element={
              <RoleRoute allowedRoles={["instructor"]}>
                <ManageAssessment />
              </RoleRoute>
            }
          />

          <Route
            path="instructor/analytics"
            element={
              <RoleRoute allowedRoles={["instructor"]}>
                <InstructorAnalytics />
              </RoleRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="admin/kyc"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminKYC />
              </RoleRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </RoleRoute>
            }
          />

          <Route
            path="admin/courses"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminCourses />
              </RoleRoute>
            }
          />

          {/* Instructor and Admin */}
          <Route
            path="interview-questions"
            element={
              <RoleRoute
                allowedRoles={["instructor", "admin"]}
              >
                <InterviewQuestions />
              </RoleRoute>
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}