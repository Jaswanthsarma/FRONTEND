import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import QuizListPage from './pages/QuizListPage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyAttemptsPage from './pages/MyAttemptsPage';

// Admin Pages
import AdminAuthPage from './pages/AdminAuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSignupPage from './pages/AdminSignupPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminLogsPage from './pages/AdminLogsPage';

// Faculty Pages
import FacultyDashboardPage from './pages/faculty/FacultyDashboardPage';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import FacultyContentPage from './pages/faculty/FacultyContentPage';
import FacultyQuizzesPage from './pages/faculty/FacultyQuizzesPage';
import FacultyAssignmentsPage from './pages/faculty/FacultyAssignmentsPage';
import FacultySubmissionsPage from './pages/faculty/FacultySubmissionsPage';
import FacultySubmissionDetailPage from './pages/faculty/FacultySubmissionDetailPage';
import FacultyGradeSubmissionPage from './pages/faculty/FacultyGradeSubmissionPage';
import CreateAssignmentPage from './pages/faculty/CreateAssignmentPage';
import FacultyProgressPage from './pages/faculty/FacultyProgressPage';
import FacultyNotificationsPage from './pages/faculty/FacultyNotificationsPage';
import FacultyProfilePage from './pages/faculty/FacultyProfilePage';
import FacultyStudentRequestsPage from './pages/faculty/FacultyStudentRequestsPage';
import FacultyCourseDetailsPage from './pages/faculty/FacultyCourseDetailsPage';
import FacultyQuizViewPage from './pages/faculty/FacultyQuizViewPage';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentCourseDetailsPage from './pages/student/StudentCourseDetailsPage';
import StudentSelectCoursePage from './pages/student/StudentSelectCoursePage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentAssignmentDetailsPage from './pages/student/StudentAssignmentDetailsPage';
import StudentSubmissionViewPage from './pages/student/StudentSubmissionViewPage';
import StudentFeedbackViewPage from './pages/student/StudentFeedbackViewPage';
import StudentQuizzesPage from './pages/student/StudentQuizzesPage';
import StudentQuizAttemptPage from './pages/student/StudentQuizAttemptPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentUploadPdfPage from './pages/student/StudentUploadPdfPage';
import UploadPdfPage from './pages/student/UploadPdfPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/auth" element={<AdminAuthPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/signup" element={<AdminSignupPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/logs" element={<AdminLogsPage />} />
          
          {/* Faculty/Student Login Routes */}
          <Route path="/login/faculty" element={<LoginPage />} />
          <Route path="/login/student" element={<LoginPage />} />
          
          {/* Legacy Routes (for backward compatibility) */}
          <Route path="/admin-signup" element={<SignupPage />} />
          <Route path="/signup/:role" element={<SignupPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/dashboard/:role" element={<DashboardPage />} />
          
          {/* Quiz Routes */}
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quiz/create" element={<CreateQuizPage />} />
          <Route path="/quiz/:quizId" element={<QuizTakingPage />} />
          <Route path="/quiz/:quizId/start" element={<QuizTakingPage />} />
          <Route path="/quiz/:quizId/results/:attemptId" element={<QuizResultsPage />} />
          <Route path="/quiz/edit/:quizId" element={<CreateQuizPage />} />
          <Route path="/my-attempts" element={<MyAttemptsPage />} />
          
          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
          <Route path="/faculty/courses" element={<FacultyCoursesPage />} />
          <Route path="/faculty/courses/:courseId" element={<FacultyCourseDetailsPage />} />
          <Route path="/faculty/content" element={<FacultyContentPage />} />
          <Route path="/faculty/quizzes" element={<FacultyQuizzesPage />} />
          <Route path="/faculty/quizzes/:quizId" element={<FacultyQuizViewPage />} />
          <Route path="/faculty/assignments" element={<FacultyAssignmentsPage />} />
          <Route path="/faculty/assignments/create" element={<CreateAssignmentPage />} />
          <Route path="/faculty/assignments/:assignmentId/submissions" element={<FacultySubmissionsPage />} />
          <Route path="/faculty/assignments/:assignmentId/submissions/:submissionId" element={<FacultySubmissionDetailPage />} />
          <Route path="/faculty/assignments/:assignmentId/submissions/:submissionId/grade" element={<FacultyGradeSubmissionPage />} />
          <Route path="/faculty/progress" element={<FacultyProgressPage />} />
          <Route path="/faculty/notifications" element={<FacultyNotificationsPage />} />
          <Route path="/faculty/profile" element={<FacultyProfilePage />} />
          <Route path="/faculty/student-requests" element={<FacultyStudentRequestsPage />} />
          <Route path="/faculty/change-password" element={<ChangePasswordPage />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/courses/:courseId" element={<StudentCourseDetailsPage />} />
          <Route path="/student/select-course" element={<StudentSelectCoursePage />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentDetailsPage />} />
          <Route path="/student/assignments/:assignmentId/submission" element={<StudentSubmissionViewPage />} />
          <Route path="/student/assignments/:assignmentId/feedback" element={<StudentFeedbackViewPage />} />
          <Route path="/student/quizzes" element={<StudentQuizzesPage />} />
          <Route path="/student/quizzes/:quizId/attempt" element={<StudentQuizAttemptPage />} />
          <Route path="/student/quizzes/:quizId/results/:attemptId" element={<QuizResultsPage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/upload-pdf" element={<UploadPdfPage />} />
          <Route path="/student/change-password" element={<ChangePasswordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
