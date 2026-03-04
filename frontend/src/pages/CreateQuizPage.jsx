import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import apiService from '../services/api';
import './CreateQuizPage.css';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    course: '', // Add course field
    duration: 30,
    allowedAttempts: 1,
    showResults: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    questions: [
      {
        questionText: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        points: 1,
        explanation: ''
      }
    ]
  });

  // Load faculty courses on mount
  React.useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await apiService.getMyCourses();
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((question, index) => 
        index === questionIndex 
          ? { ...question, [field]: value }
          : question
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((question, qIndex) => 
        qIndex === questionIndex 
          ? {
              ...question,
              options: question.options.map((option, oIndex) => 
                oIndex === optionIndex 
                  ? { ...option, [field]: value }
                  : field === 'isCorrect' && value ? { ...option, isCorrect: false } : option
              )
            }
          : question
      )
    }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          points: 1,
          explanation: ''
        }
      ]
    }));
  };

  const removeQuestion = (questionIndex) => {
    if (quizData.questions.length > 1) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex)
      }));
    }
  };

  const addOption = (questionIndex) => {
    const question = quizData.questions[questionIndex];
    if (question.options.length < 6) {
      handleQuestionChange(questionIndex, 'options', [
        ...question.options,
        { text: '', isCorrect: false }
      ]);
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const question = quizData.questions[questionIndex];
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      handleQuestionChange(questionIndex, 'options', newOptions);
    }
  };

  const validateQuiz = () => {
    // Clear previous error
    setError('');
    
    if (!quizData.title.trim()) {
      setError('❌ Quiz title is required');
      return false;
    }
    
    if (!quizData.course) {
      setError('❌ Please select a course');
      return false;
    }
    
    if (!quizData.subject.trim()) {
      setError('❌ Subject is required');
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      
      if (!question.questionText.trim()) {
        setError(`❌ Question ${i + 1}: Question text is required`);
        return false;
      }

      const correctAnswers = question.options.filter(option => option.isCorrect);
      if (correctAnswers.length !== 1) {
        setError(`❌ Question ${i + 1}: Please select exactly one correct answer (click the radio button)`);
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          setError(`❌ Question ${i + 1}, Option ${j + 1}: Option text is required`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateQuiz()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createQuiz(quizData);
      
      if (response.success) {
        navigate('/quizzes');
      }
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/quizzes');
  };

  return (
    <div className="create-quiz-page">
      <Header />
      <main className="create-quiz-main">
        <div className="create-quiz-container">
          <div className="page-header">
            <h1 className="page-title">Create New Quiz</h1>
            <p className="page-description">
              Create an engaging quiz for your students
            </p>
          </div>

          <form className="quiz-form" onSubmit={handleSubmit}>
            {/* Basic Quiz Information */}
            <div className="form-section">
              <h3 className="section-title">Quiz Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quiz Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={quizData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter quiz title..."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Course *</label>
                  {loadingCourses ? (
                    <div style={{ padding: '0.75rem', color: '#64748b' }}>Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <div style={{ padding: '0.75rem', color: '#dc2626' }}>
                      No courses found. Please create a course first.
                    </div>
                  ) : (
                    <select
                      name="course"
                      value={quizData.course}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      style={{ padding: '0.75rem' }}
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.code} - {course.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={quizData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Mathematics, Science..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={quizData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Brief description of the quiz..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={quizData.duration}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    max="300"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Allowed Attempts</label>
                  <input
                    type="number"
                    name="allowedAttempts"
                    value={quizData.allowedAttempts}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="showResults"
                      checked={quizData.showResults}
                      onChange={handleInputChange}
                    />
                    Show results to students
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="shuffleQuestions"
                      checked={quizData.shuffleQuestions}
                      onChange={handleInputChange}
                    />
                    Shuffle questions
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="shuffleOptions"
                      checked={quizData.shuffleOptions}
                      onChange={handleInputChange}
                    />
                    Shuffle options
                  </label>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Questions ({quizData.questions.length})</h3>
                <button
                  type="button"
                  className="add-question-btn"
                  onClick={addQuestion}
                >
                  Add Question
                </button>
              </div>

              {quizData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="question-card">
                  <div className="question-header">
                    <h4 className="question-title">Question {questionIndex + 1}</h4>
                    {quizData.questions.length > 1 && (
                      <button
                        type="button"
                        className="remove-question-btn"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Question Text *</label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                      className="form-textarea"
                      placeholder="Enter your question..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Points</label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => handleQuestionChange(questionIndex, 'points', parseFloat(e.target.value))}
                      className="form-input points-input"
                      min="0.5"
                      max="10"
                      step="0.5"
                    />
                  </div>

                  <div className="options-section">
                    <div className="options-header">
                      <label className="form-label">Options *</label>
                      {question.options.length < 6 && (
                        <button
                          type="button"
                          className="add-option-btn"
                          onClick={() => addOption(questionIndex)}
                        >
                          Add Option
                        </button>
                      )}
                    </div>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="option-row">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(questionIndex, optionIndex, 'isCorrect', true)}
                          className="correct-radio"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                          className="option-input"
                          placeholder={`Option ${optionIndex + 1}...`}
                          required
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            className="remove-option-btn"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Explanation (Optional)</label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                      className="form-textarea"
                      placeholder="Explain the correct answer..."
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateQuizPage;