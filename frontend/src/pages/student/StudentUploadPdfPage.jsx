import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';
import './StudentUploadPdfPage.css';

const StudentUploadPdfPage = () => {
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, detail, quiz, progress
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchUploads();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUploads = async () => {
    try {
      const response = await apiService.getMyPdfUploads();
      if (response.success) {
        setUploads(response.data);
      }
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await apiService.uploadPdf(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setSuccess('PDF uploaded and processed successfully!');
        setSelectedFile(null);
        await fetchUploads();
        
        // Auto-select the new upload
        setTimeout(() => {
          const newUpload = uploads.find(u => u.sessionId === response.data.sessionId) || response.data;
          handleViewDetails(newUpload);
        }, 1000);
      }
    } catch (error) {
      setError(error.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSuccess('');
      }, 3000);
    }
  };

  const handleViewDetails = async (upload) => {
    setSelectedUpload(upload);
    setViewMode('detail');
    setQuizSubmitted(false);
    setQuizResult(null);
    
    // Fetch progress data
    try {
      const response = await apiService.getPdfProgress(upload._id || upload.uploadId);
      if (response.success) {
        setProgressData(response.data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const response = await apiService.getPdfQuiz(selectedUpload._id || selectedUpload.uploadId);
      if (response.success) {
        setQuizData(response.data);
        setQuizAnswers({});
        setViewMode('quiz');
      }
    } catch (error) {
      setError('Failed to load quiz');
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.entries(quizAnswers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
      timeTaken: 30 // Default time
    }));

    if (answers.length !== quizData.totalQuestions) {
      setError('Please answer all questions');
      return;
    }

    try {
      const response = await apiService.submitPdfQuiz(selectedUpload._id || selectedUpload.uploadId, answers);
      if (response.success) {
        setQuizResult(response.data);
        setQuizSubmitted(true);
        setSuccess('Quiz submitted successfully!');
        
        // Refresh progress data
        const progressResponse = await apiService.getPdfProgress(selectedUpload._id || selectedUpload.uploadId);
        if (progressResponse.success) {
          setProgressData(progressResponse.data);
        }
      }
    } catch (error) {
      setError('Failed to submit quiz');
    }
  };

  const handleViewProgress = () => {
    setViewMode('progress');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUpload(null);
    setQuizData(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }

    try {
      const response = await apiService.deletePdfUpload(uploadId);
      if (response.success) {
        setSuccess('Upload deleted successfully');
        await fetchUploads();
        if (selectedUpload && selectedUpload._id === uploadId) {
          handleBackToList();
        }
      }
    } catch (error) {
      setError('Failed to delete upload');
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <StudentLayout user={user}>
      <div className="upload-pdf-page">
        <div className="page-header">
          <h1>📄 Upload Study Material</h1>
          <p>Upload PDF files to get AI-powered summaries, quizzes, and track your progress</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>✕</button>
          </div>
        )}

        {viewMode === 'list' && (
          <>
            {/* Upload Section */}
            <div className="upload-section">
              <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icon">📄</div>
                <h3>Drag & Drop PDF Here</h3>
                <p>or</p>
                <label className="file-input-label">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  <span className="btn btn-primary">Choose File</span>
                </label>
                {selectedFile && (
                  <div className="selected-file">
                    <span>📄 {selectedFile.name}</span>
                    <span className="file-size">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p>Processing... {uploadProgress}%</p>
                </div>
              )}

              {selectedFile && !uploading && (
                <button className="btn btn-primary btn-upload" onClick={handleUpload}>
                  Upload & Process
                </button>
              )}
            </div>

            {/* Previous Uploads */}
            <div className="uploads-list">
              <h2>📚 My Uploaded Materials</h2>
              {uploads.length === 0 ? (
                <div className="empty-state">
                  <p>No uploads yet. Upload your first PDF to get started!</p>
                </div>
              ) : (
                <div className="uploads-grid">
                  {uploads.map(upload => (
                    <div key={upload._id} className="upload-card">
                      <div className="card-header">
                        <span className="file-icon">📄</span>
                        <h3>{upload.fileName}</h3>
                      </div>
                      <div className="card-body">
                        <p className="upload-date">
                          Uploaded: {new Date(upload.uploadDate).toLocaleDateString()}
                        </p>
                        <p className="topics-count">
                          {upload.keyTopics?.length || 0} Key Topics
                        </p>
                        <p className="quiz-count">
                          {upload.quiz?.totalQuestions || 0} Quiz Questions
                        </p>
                        {upload.quizAttempts && upload.quizAttempts.length > 0 && (
                          <p className="attempts-count">
                            {upload.quizAttempts.length} Attempt(s)
                          </p>
                        )}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleViewDetails(upload)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUpload(upload._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'detail' && selectedUpload && (
          <div className="detail-view">
            <button className="btn btn-back" onClick={handleBackToList}>
              ← Back to List
            </button>

            <div className="detail-content">
              <h2>📄 {selectedUpload.fileName}</h2>

              {/* Summary Section */}
              <div className="section summary-section">
                <h3>📝 Summary</h3>
                <div className="summary-box">
                  <h4>Short Summary</h4>
                  <p>{selectedUpload.summary?.short}</p>
                  <h4>Detailed Summary</h4>
                  <p className="detailed-summary">{selectedUpload.summary?.detailed}</p>
                </div>
              </div>

              {/* Key Topics */}
              <div className="section topics-section">
                <h3>🎯 Key Topics</h3>
                <div className="topics-list">
                  {selectedUpload.keyTopics?.map((topic, index) => (
                    <span key={index} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>

              {/* Quiz Section */}
              <div className="section quiz-section">
                <h3>📝 Quiz</h3>
                <p>{selectedUpload.quiz?.totalQuestions} questions available</p>
                <button className="btn btn-primary" onClick={handleStartQuiz}>
                  Start Quiz
                </button>
              </div>

              {/* Progress Section */}
              {progressData && progressData.hasAttempts && (
                <div className="section progress-section">
                  <h3>📊 Your Progress</h3>
                  <div className="progress-summary">
                    <div className="stat">
                      <span className="stat-label">Latest Score</span>
                      <span className="stat-value">
                        {progressData.latestAttempt.score}/{progressData.latestAttempt.totalQuestions}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Percentage</span>
                      <span className="stat-value">{progressData.latestAttempt.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total Attempts</span>
                      <span className="stat-value">{progressData.totalAttempts}</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary" onClick={handleViewProgress}>
                    View Detailed Progress
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'quiz' && quizData && (
          <div className="quiz-view">
            <button className="btn btn-back" onClick={() => setViewMode('detail')}>
              ← Back to Details
            </button>

            {!quizSubmitted ? (
              <>
                <h2>📝 Quiz</h2>
                <div className="quiz-questions">
                  {quizData.questions.map((question, index) => (
                    <div key={question.id} className="question-card">
                      <h3>Question {index + 1}</h3>
                      <p className="question-text">{question.question}</p>
                      <p className="question-topic">Topic: {question.topic}</p>
                      <div className="options">
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="option-label">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={quizAnswers[question.id] === option}
                              onChange={() => handleAnswerSelect(question.id, option)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-submit-quiz"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length !== quizData.totalQuestions}
                >
                  Submit Quiz
                </button>
              </>
            ) : (
              <div className="quiz-result">
                <h2>🎉 Quiz Results</h2>
                <div className="result-summary">
                  <div className="result-score">
                    <span className="score-value">{quizResult.percentage}%</span>
                    <span className="score-label">
                      {quizResult.score}/{quizResult.totalQuestions} Correct
                    </span>
                  </div>
                  <div className="result-details">
                    {quizResult.weakTopics && quizResult.weakTopics.length > 0 && (
                      <div className="weak-topics">
                        <h4>📌 Topics to Review</h4>
                        {quizResult.weakTopics.map((topic, index) => (
                          <span key={index} className="topic-tag weak">{topic}</span>
                        ))}
                      </div>
                    )}
                    {quizResult.strongTopics && quizResult.strongTopics.length > 0 && (
                      <div className="strong-topics">
                        <h4>✅ Strong Topics</h4>
                        {quizResult.strongTopics.map((topic, index) => (
                          <span key={index} className="topic-tag strong">{topic}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="result-actions">
                  <button className="btn btn-secondary" onClick={() => setViewMode('detail')}>
                    Back to Details
                  </button>
                  <button className="btn btn-primary" onClick={handleViewProgress}>
                    View Progress
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'progress' && progressData && (
          <div className="progress-view">
            <button className="btn btn-back" onClick={() => setViewMode('detail')}>
              ← Back to Details
            </button>

            <h2>📊 Learning Progress</h2>

            {progressData.hasAttempts ? (
              <>
                <div className="progress-stats">
                  <div className="stat-card">
                    <h3>Latest Performance</h3>
                    <div className="progress-circle">
                      <span className="percentage">{progressData.latestAttempt.percentage.toFixed(1)}%</span>
                    </div>
                    <p>{progressData.latestAttempt.score}/{progressData.latestAttempt.totalQuestions} Correct</p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Attempts</h3>
                    <span className="big-number">{progressData.totalAttempts}</span>
                  </div>
                </div>

                <div className="topics-analysis">
                  {progressData.latestAttempt.weakTopics && progressData.latestAttempt.weakTopics.length > 0 && (
                    <div className="topics-box weak">
                      <h3>📌 Topics Needing Revision</h3>
                      <ul>
                        {progressData.latestAttempt.weakTopics.map((topic, index) => (
                          <li key={index}>{topic}</li>
                        ))}
                      </ul>
                      <div className="mentor-suggestions">
                        <h4>💡 Study Suggestions</h4>
                        <ul>
                          <li>Review the summary for these topics</li>
                          <li>Retake the quiz to improve understanding</li>
                          <li>Focus on weak areas before moving forward</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {progressData.latestAttempt.strongTopics && progressData.latestAttempt.strongTopics.length > 0 && (
                    <div className="topics-box strong">
                      <h3>✅ Topics Understood</h3>
                      <ul>
                        {progressData.latestAttempt.strongTopics.map((topic, index) => (
                          <li key={index}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="attempts-history">
                  <h3>📈 Attempt History</h3>
                  <div className="attempts-list">
                    {progressData.allAttempts.map((attempt, index) => (
                      <div key={index} className="attempt-item">
                        <span className="attempt-number">Attempt {index + 1}</span>
                        <span className="attempt-score">{attempt.percentage.toFixed(1)}%</span>
                        <span className="attempt-date">
                          {new Date(attempt.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No quiz attempts yet. Take the quiz to see your progress!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentUploadPdfPage;
