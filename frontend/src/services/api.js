// Use environment variable for API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API utility functions
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('lms_token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('token', token);
    localStorage.setItem('lms_token', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  }

  // Get user data from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user') || localStorage.getItem('lms_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user data in localStorage
  setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('lms_user', JSON.stringify(user));
  }

  // Make HTTP request with auth header
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async adminSignup(signupData) {
    const response = await this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData)
    });

    // DO NOT auto-login after admin signup - just return the response with credentials
    return response;
  }

  async createUser(userData) {
    return await this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success) {
      this.setAuthToken(response.data.token);
      this.setCurrentUser(response.data.user);
    }

    return response;
  }

  async logout() {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeAuthToken();
    }
  }

  async getProfile() {
    return await this.makeRequest('/auth/profile');
  }

  async changePassword(passwordData) {
    return await this.makeRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // User management methods (Admin only)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  async getUserById(userId) {
    return await this.makeRequest(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return await this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async resetUserPassword(userId) {
    return await this.makeRequest(`/users/${userId}/reset-password`, {
      method: 'PUT'
    });
  }

  async deleteUser(userId) {
    return await this.makeRequest(`/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Assignment methods
  async getAssignments(type = 'faculty', params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/assignments/${type}${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  async getAssignmentById(assignmentId) {
    return await this.makeRequest(`/assignments/${assignmentId}`);
  }

  async createAssignment(assignmentData, file = null) {
    const token = this.getAuthToken();
    const url = `${this.baseURL}/assignments`;
    
    // If file is provided, use FormData
    if (file) {
      const formData = new FormData();
      
      // Append all assignment data fields
      Object.keys(assignmentData).forEach(key => {
        if (assignmentData[key] !== null && assignmentData[key] !== undefined) {
          formData.append(key, assignmentData[key]);
        }
      });
      
      // Append the file
      formData.append('assignmentFile', file);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create assignment');
      }
      
      return data;
    }
    
    // If no file, use regular JSON request
    return await this.makeRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async addQuestionsToAssignment(assignmentId, questions) {
    return await this.makeRequest(`/assignments/${assignmentId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ questions })
    });
  }

  async publishAssignment(assignmentId) {
    return await this.makeRequest(`/assignments/${assignmentId}/publish`, {
      method: 'PUT'
    });
  }

  async getAssignmentSubmissions(assignmentId) {
    return await this.makeRequest(`/assignments/${assignmentId}/submissions`);
  }

  async submitAssignment(assignmentId, answers) {
    return await this.makeRequest(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async evaluateSubmission(submissionId, evaluationData) {
    return await this.makeRequest(`/assignments/submissions/${submissionId}/evaluate`, {
      method: 'PUT',
      body: JSON.stringify(evaluationData)
    });
  }

  async publishResults(assignmentId) {
    return await this.makeRequest(`/assignments/${assignmentId}/publish-results`, {
      method: 'PUT'
    });
  }

  async getMySubmissions() {
    return await this.makeRequest('/assignments/my-submissions');
  }

  // AI Assistant methods
  async chatWithAI(message, context = null) {
    return await this.makeRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    });
  }

  // Health check
  async healthCheck() {
    return await this.makeRequest('/health');
  }

  // Quiz methods
  async getQuizzes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/quizzes${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  async getQuizById(quizId) {
    return await this.makeRequest(`/quizzes/${quizId}`);
  }

  async createQuiz(quizData) {
    return await this.makeRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  }

  async updateQuiz(quizId, quizData) {
    return await this.makeRequest(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  }

  async deleteQuiz(quizId) {
    return await this.makeRequest(`/quizzes/${quizId}`, {
      method: 'DELETE'
    });
  }

  async getQuizStatistics(quizId) {
    return await this.makeRequest(`/quizzes/${quizId}/statistics`);
  }

  // Quiz attempt methods
  async startQuizAttempt(quizId) {
    return await this.makeRequest(`/quiz-attempts/${quizId}/start`, {
      method: 'POST'
    });
  }

  async getQuizQuestions(attemptId) {
    return await this.makeRequest(`/quiz-attempts/${attemptId}/questions`);
  }

  async submitAnswer(attemptId, answerData) {
    return await this.makeRequest(`/quiz-attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify(answerData)
    });
  }

  async submitQuizAttempt(attemptId) {
    return await this.makeRequest(`/quiz-attempts/${attemptId}/submit`, {
      method: 'POST'
    });
  }

  async getMyAttempts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/quiz-attempts/my-attempts${queryString ? `?${queryString}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  async getAttemptResults(attemptId) {
    return await this.makeRequest(`/quiz-attempts/${attemptId}/results`);
  }

  // Get all attempts for a quiz (Faculty only)
  async getQuizAttempts(quizId, status = null) {
    const endpoint = status 
      ? `/quiz-attempts/quiz/${quizId}/attempts?status=${status}`
      : `/quiz-attempts/quiz/${quizId}/attempts`;
    return await this.makeRequest(endpoint);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  // Faculty Request methods
  async createFacultyRequest(facultyId, requestMessage) {
    return await this.makeRequest('/faculty-requests', {
      method: 'POST',
      body: JSON.stringify({ facultyId, requestMessage })
    });
  }

  async getMyFacultyRequests() {
    return await this.makeRequest('/faculty-requests/my-requests');
  }

  async getAvailableFaculty() {
    return await this.makeRequest('/faculty-requests/available-faculty');
  }

  async getStudentRequests(status = null) {
    const endpoint = status 
      ? `/faculty-requests/student-requests?status=${status}`
      : '/faculty-requests/student-requests';
    return await this.makeRequest(endpoint);
  }

  async getFacultyRequestStats() {
    return await this.makeRequest('/faculty-requests/stats');
  }

  async approveFacultyRequest(requestId, responseMessage) {
    return await this.makeRequest(`/faculty-requests/${requestId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ responseMessage })
    });
  }

  async rejectFacultyRequest(requestId, responseMessage) {
    return await this.makeRequest(`/faculty-requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ responseMessage })
    });
  }

  // Course methods
  async createCourse(courseData) {
    return await this.makeRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async getMyCourses() {
    return await this.makeRequest('/courses/my-courses');
  }

  async getCourseById(courseId) {
    return await this.makeRequest(`/courses/${courseId}`);
  }

  async updateCourse(courseId, courseData) {
    return await this.makeRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  }

  async deleteCourse(courseId) {
    return await this.makeRequest(`/courses/${courseId}`, {
      method: 'DELETE'
    });
  }

  async getAvailableCourses(department = null, semester = null, showAll = true) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (semester) params.append('semester', semester);
    if (showAll) params.append('showAll', 'true');
    
    const endpoint = `/courses/available${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.makeRequest(endpoint);
  }

  async getCourseStats() {
    return await this.makeRequest('/courses/stats');
  }

  async getEnrolledCourses() {
    return await this.makeRequest('/courses/enrolled');
  }

  // Course Materials methods
  async uploadCourseMaterial(courseId, formData) {
    const url = `${this.baseURL}/courses/${courseId}/materials`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  async getCourseMaterials(courseId) {
    return await this.makeRequest(`/courses/${courseId}/materials`);
  }

  async deleteCourseMaterial(courseId, materialId) {
    return await this.makeRequest(`/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE'
    });
  }

  getCourseMaterialDownloadUrl(courseId, materialId) {
    const token = this.getAuthToken();
    return `${this.baseURL}/courses/${courseId}/materials/${materialId}/download?token=${token}`;
  }

  async getCourseAssignments(courseId) {
    return await this.makeRequest(`/courses/${courseId}/assignments`);
  }

  // Course Request methods
  async createCourseRequest(courseId, requestMessage = '') {
    return await this.makeRequest('/course-requests', {
      method: 'POST',
      body: JSON.stringify({ courseId, requestMessage })
    });
  }

  async getMyCourseRequests() {
    return await this.makeRequest('/course-requests/my-requests');
  }

  async getCourseRequestStatus(courseId) {
    return await this.makeRequest(`/course-requests/status/${courseId}`);
  }

  async getFacultyCourseRequests(status = null) {
    const endpoint = status 
      ? `/course-requests/faculty-requests?status=${status}`
      : '/course-requests/faculty-requests';
    return await this.makeRequest(endpoint);
  }

  async getCourseRequestStats() {
    return await this.makeRequest('/course-requests/stats');
  }

  async approveCourseRequest(requestId, responseMessage = '') {
    return await this.makeRequest(`/course-requests/${requestId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ responseMessage })
    });
  }

  async rejectCourseRequest(requestId, responseMessage = '') {
    return await this.makeRequest(`/course-requests/${requestId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ responseMessage })
    });
  }

  // Student-specific methods
  async getStudentCourses() {
    return await this.makeRequest('/courses/available');
  }

  async getStudentAssignments() {
    return await this.makeRequest('/assignments/student');
  }

  async getAssignmentById(assignmentId) {
    return await this.makeRequest(`/assignments/${assignmentId}`);
  }

  async submitAssignment(assignmentId, formData) {
    const url = `${this.baseURL}/assignments/${assignmentId}/submit`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Submission failed');
    }

    return data;
  }

  // PDF Upload methods
  async uploadPdf(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/pdf-uploads`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  async getMyPdfUploads() {
    return await this.makeRequest('/pdf-uploads');
  }

  async getPdfUploadById(uploadId) {
    return await this.makeRequest(`/pdf-uploads/${uploadId}`);
  }

  async getPdfQuiz(uploadId) {
    return await this.makeRequest(`/pdf-uploads/${uploadId}/quiz`);
  }

  async submitPdfQuiz(uploadId, answers) {
    return await this.makeRequest(`/pdf-uploads/${uploadId}/submit-quiz`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async getPdfProgress(uploadId) {
    return await this.makeRequest(`/pdf-uploads/${uploadId}/progress`);
  }

  async deletePdfUpload(uploadId) {
    return await this.makeRequest(`/pdf-uploads/${uploadId}`, {
      method: 'DELETE'
    });
  }

  // PDF Processing methods (new simplified API)
  async processPdf(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/pdf/process`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  async submitQuizAnswers(answers, quiz) {
    return await this.makeRequest('/pdf/submit-quiz', {
      method: 'POST',
      body: JSON.stringify({ answers, quiz })
    });
  }

  async checkPdfServiceHealth() {
    return await this.makeRequest('/pdf/health');
  }

  async getPdfHistory() {
    return await this.makeRequest('/pdf/history');
  }

  async getPdfHistoryById(id) {
    return await this.makeRequest(`/pdf/history/${id}`);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;