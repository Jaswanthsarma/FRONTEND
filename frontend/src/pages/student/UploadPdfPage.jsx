import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';
import './UploadPdfPage.css';

const UploadPdfPage = () => {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // History state
  const [pdfHistory, setPdfHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Results state
  const [results, setResults] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false); // NEW: Track if quiz has started
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const timerInterval = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchPdfHistory();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Timer effect - only runs when quiz is started
  useEffect(() => {
    if (results && quizStarted && !quizSubmitted && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleAutoSubmit();
        return;
      }
      
      timerInterval.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      };
    }
  }, [results, quizStarted, quizSubmitted, timeRemaining]);

  const fetchPdfHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await apiService.getPdfHistory();
      if (response.success) {
        setPdfHistory(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch PDF history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadHistoryItem = async (historyId) => {
    try {
      const response = await apiService.getPdfHistoryById(historyId);
      if (response.success) {
        setResults({
          filename: response.data.filename,
          summary: response.data.summary,
          quiz: response.data.quiz
        });
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizResults(null);
        setQuizStarted(false); // Quiz not started yet
        
        // Don't start timer yet - wait for user to click "Start Quiz"
        
        setSuccess('Previous PDF loaded successfully!');
        
        // Scroll to top to show quiz
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setError('Failed to load PDF history');
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
    setResults(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await apiService.processPdf(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setSuccess(response.message || 'PDF processed successfully!');
        setResults(response.data);
        setSelectedFile(null);
        setQuizStarted(false); // Quiz not started yet
        
        // Don't start timer yet - wait for user to click "Start Quiz"
        
        // Refresh history
        fetchPdfHistory();
        
        // Scroll to top to show quiz
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setError(error.message || 'Failed to process PDF');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const validateQuizAnswers = () => {
    const totalQuestions = results.quiz.questions.length;
    const answeredQuestions = Object.keys(quizAnswers).length;
    
    if (answeredQuestions < totalQuestions) {
      const unanswered = totalQuestions - answeredQuestions;
      setError(`Please answer all questions. ${unanswered} question(s) remaining.`);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleAutoSubmit = async () => {
    if (quizSubmitted) return;
    
    setError('Time is up! Quiz auto-submitted.');
    await submitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!validateQuizAnswers()) {
      return;
    }
    
    await submitQuiz();
  };

  const submitQuiz = async () => {
    const answers = Object.entries(quizAnswers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer
    }));

    try {
      setError('');
      
      // Calculate time spent
      const timeSpent = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;
      
      const response = await apiService.submitQuizAnswers(answers, results.quiz);
      
      if (response.success) {
        setQuizResults(response.data);
        setQuizSubmitted(true);
        setSuccess('Quiz submitted successfully!');
        
        // Stop timer
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
        setTimeRemaining(null);
      }
    } catch (error) {
      setError('Failed to submit quiz');
    }
  };

  const handleReset = () => {
    setResults(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    setSelectedFile(null);
    setError('');
    setSuccess('');
    setTimeRemaining(null);
    setQuizStartTime(null);
    setQuizStarted(false); // Reset quiz started state
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // Scroll to top to show upload section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuiz = () => {
    if (!results || !results.quiz) return;
    
    // Start the quiz
    setQuizStarted(true);
    
    // Start the timer
    if (results.quiz.timeLimit) {
      setTimeRemaining(results.quiz.timeLimit);
      setQuizStartTime(Date.now());
    }
    
    console.log('🎯 Quiz started! Timer is now running.');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!timeRemaining || !results?.quiz?.timeLimit) return '#10b981';
    const percentage = (timeRemaining / results.quiz.timeLimit) * 100;
    if (percentage > 50) return '#10b981'; // green
    if (percentage > 25) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  if (!user) {
    return null;
  }

  return (
    <StudentLayout user={user}>
      <div className="upload-pdf-page">
        <div className="page-header">
          <h1>📤 Upload PDF</h1>
          <p>Upload PDF files to get AI-powered summaries, quizzes, and learning insights</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* PRIMARY SECTION: Upload New PDF - Always visible when no results */}
        {!results && (
          <div className="upload-section-primary">
            <div className="section-header-primary">
              <h2>📤 Upload New PDF</h2>
              <p className="section-description">Select a PDF file to generate AI-powered quiz and insights</p>
            </div>
            
            <div className="upload-card">
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
                    style={{ display: 'none' }}
                  />
                  <button className="btn-primary" onClick={(e) => {
                    e.preventDefault();
                    e.target.previousElementSibling.click();
                  }}>
                    Choose File
                  </button>
                </label>
                
                {selectedFile && (
                  <div className="selected-file">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}

              <button
                className="btn-upload"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Processing...' : 'Upload & Process'}
              </button>
            </div>
          </div>
        )}

        {/* SECONDARY SECTION: Previously Uploaded PDFs - Always visible when no results */}
        {!results && (
          <div className="pdf-history-section-secondary">
            <div className="section-header-secondary">
              <h2>📚 Previously Uploaded PDFs</h2>
              <p className="section-description">Access your previous uploads and retake quizzes</p>
            </div>
            
            <div className="history-container">
              {loadingHistory ? (
                <div className="loading-state">Loading history...</div>
              ) : pdfHistory.length > 0 ? (
                <div className="history-grid">
                  {pdfHistory.map((item) => (
                    <div 
                      key={item._id} 
                      className="history-card"
                      onClick={() => loadHistoryItem(item._id)}
                    >
                      <div className="history-icon">📄</div>
                      <div className="history-details">
                        <h3>{item.filename}</h3>
                        <p className="history-date">
                          {new Date(item.uploadDate).toLocaleDateString()} at{' '}
                          {new Date(item.uploadDate).toLocaleTimeString()}
                        </p>
                        <span className={`history-status ${item.status}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="history-stats">
                        <span>{item.quiz?.totalQuestions || 0} Questions</span>
                        <span>{item.summary?.topics?.length || 0} Topics</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No previous uploads found</p>
                  <p className="empty-hint">Upload your first PDF above to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="results-section">
            <div className="results-header">
              <h2>📄 {results.filename}</h2>
              <button className="btn-secondary" onClick={handleReset}>
                Upload Another PDF
              </button>
            </div>

            {/* Summary Section */}
            <div className="summary-section">
              <h3>📋 Summary</h3>
              <div className="summary-card">
                <p>{results.summary.short}</p>
              </div>

              <h4>Key Points</h4>
              <ul className="key-points">
                {results.summary.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>

              <h4>Topics Covered</h4>
              <div className="topics-list">
                {results.summary.topics.map((topic, index) => (
                  <span key={index} className="topic-tag">{topic}</span>
                ))}
              </div>
            </div>

            {/* Timer Display - Shows after summary, before quiz */}
            {timeRemaining !== null && !quizSubmitted && quizStarted && (
              <div className="quiz-timer" style={{ borderColor: getTimerColor() }}>
                <span className="timer-icon">⏱️</span>
                <span className="timer-label">Time Remaining:</span>
                <span className="timer-value" style={{ color: getTimerColor() }}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            {/* Quiz Section */}
            {!quizSubmitted && (
              <div className="quiz-section">
                {!quizStarted ? (
                  // Show "Start Quiz" button before quiz begins
                  <div className="quiz-start-container">
                    <div className="quiz-start-card">
                      <h3>📝 Ready to Start the Quiz?</h3>
                      <p className="quiz-info">
                        This quiz has <strong>{results.quiz.totalQuestions} questions</strong> and you'll have{' '}
                        <strong>{Math.floor(results.quiz.timeLimit / 60)} minutes</strong> to complete it.
                      </p>
                      <p className="quiz-info">
                        ⏱️ The timer will start as soon as you click the button below.
                      </p>
                      <p className="quiz-info">
                        ⚠️ You must answer all questions before submitting.
                      </p>
                      <button 
                        className="btn-start-quiz"
                        onClick={handleStartQuiz}
                      >
                        🚀 Start Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show quiz questions after starting
                  <>
                    <div className="quiz-header">
                      <h3>📝 Quiz ({results.quiz.totalQuestions} Questions)</h3>
                      <p className="quiz-instruction">
                        ⚠️ You must answer all questions before submitting
                      </p>
                    </div>

                    {results.quiz.questions.map((question, index) => (
                  <div key={question.id} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                    </div>
                    <p className="question-text">{question.question}</p>
                    
                    <div className="options-list">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`option-label ${
                            quizAnswers[question.id] === option ? 'selected' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={quizAnswers[question.id] === option}
                            onChange={() => handleAnswerSelect(question.id, option)}
                          />
                          <span className="option-text">{option}</span>
                        </label>
                      ))}
                    </div>
                    
                    {!quizAnswers[question.id] && (
                      <div className="question-status unanswered">
                        ⚠️ Not answered yet
                      </div>
                    )}
                  </div>
                ))}

                    <div className="quiz-actions">
                      <div className="quiz-progress">
                        Answered: {Object.keys(quizAnswers).length} / {results.quiz.totalQuestions}
                      </div>
                      <button
                        className="btn-submit-quiz"
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < results.quiz.totalQuestions}
                      >
                        Submit Quiz
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quiz Results Section */}
            {quizSubmitted && quizResults && (
              <div className="quiz-results-section">
                <div className="results-card">
                  <h3>🎯 Quiz Results</h3>
                  
                  <div className="score-display">
                    <div className="score-circle">
                      <span className="score-value">
                        {quizResults.progress.score}/{quizResults.progress.totalQuestions}
                      </span>
                      <span className="score-percentage">
                        {quizResults.progress.percentage}%
                      </span>
                    </div>
                    <div className="score-level">
                      Level: <strong>{quizResults.progress.level}</strong>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${quizResults.progress.percentage}%` }}
                    />
                  </div>

                  {quizResults.progress.strongTopics.length > 0 && (
                    <div className="topics-performance">
                      <h4>✅ Strong Topics</h4>
                      <div className="topics-list">
                        {quizResults.progress.strongTopics.map((topic, index) => (
                          <span key={index} className="topic-tag strong">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {quizResults.progress.weakTopics.length > 0 && (
                    <div className="topics-performance">
                      <h4>⚠️ Topics Needing Attention</h4>
                      <div className="topics-list">
                        {quizResults.progress.weakTopics.map((topic, index) => (
                          <span key={index} className="topic-tag weak">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mentor Suggestions */}
                <div className="mentor-suggestions">
                  <h4>💡 Mentor Suggestions</h4>
                  
                  {quizResults.mentorSuggestions.revisionTopics.length > 0 && (
                    <div className="suggestion-section">
                      <h5>Topics to Revise</h5>
                      <ul>
                        {quizResults.mentorSuggestions.revisionTopics.map((topic, index) => (
                          <li key={index}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="suggestion-section">
                    <h5>Study Strategy</h5>
                    <ul>
                      {quizResults.mentorSuggestions.studyStrategy.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="suggestion-section">
                    <h5>Recommendations</h5>
                    <ul>
                      {quizResults.mentorSuggestions.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Professional Mentor Guidance */}
                  {quizResults.mentorSuggestions.mentorGuidance && 
                   quizResults.mentorSuggestions.mentorGuidance.length > 0 && (
                    <div className="suggestion-section mentor-guidance">
                      <h5>📋 Detailed Guidance</h5>
                      {quizResults.mentorSuggestions.mentorGuidance.map((guidance, index) => (
                        <div key={index} className="guidance-item">
                          <div className="guidance-topic">
                            <strong>{guidance.topic}</strong>
                          </div>
                          <div className="guidance-explanation">
                            {guidance.explanation}
                          </div>
                          <div className="guidance-recommendation">
                            <span className="recommendation-label">Recommended Action:</span>
                            {guidance.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Clean Learning Resources */}
                  {quizResults.mentorSuggestions.learningResources && 
                   quizResults.mentorSuggestions.learningResources.length > 0 && (
                    <div className="suggestion-section learning-resources-clean">
                      <h5>📚 Learning Resources</h5>
                      <p className="resources-intro-clean">
                        Strengthen your understanding with these curated resources for each topic:
                      </p>
                      
                      {quizResults.mentorSuggestions.learningResources.map((resource, index) => (
                        <div key={index} className="resource-item-clean">
                          <div className="resource-topic-clean">
                            <strong>📌 {resource.topic}</strong>
                          </div>
                          <div className="resource-links-clean">
                            <a 
                              href={resource.youtubeLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="resource-link-clean youtube-link-clean"
                            >
                              <span className="link-icon-clean">▶️</span>
                              <span>Watch YouTube Tutorials</span>
                            </a>
                            <a 
                              href={resource.googleArticleLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="resource-link-clean google-link-clean"
                            >
                              <span className="link-icon-clean">📖</span>
                              <span>Read Articles & Guides</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default UploadPdfPage;
