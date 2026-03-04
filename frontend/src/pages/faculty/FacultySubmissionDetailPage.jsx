import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultySubmissionDetailPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  const { assignmentId, submissionId } = useParams();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    loadSubmission();
  }, [assignmentId, submissionId]);

  const loadSubmission = () => {
    // Sample submission data
    const submissionsData = {
      '1': {
        id: '1',
        assignmentTitle: 'Data Structures Assignment 1',
        course: 'CS201',
        totalMarks: 100,
        studentName: 'Kannaya',
        studentId: 'ST001',
        studentEmail: 'kannaya@student.edu',
        submittedAt: '2026-02-14T10:30:00',
        status: 'submitted',
        submissionText: `
// Binary Search Tree Implementation
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  // Insert a new value into the BST
  insert(value) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    while (true) {
      if (value === current.value) return undefined; // Duplicate value
      
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  // Search for a value in the BST
  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  // Delete a node from the BST
  delete(value) {
    this.root = this.deleteNode(this.root, value);
    return this;
  }

  deleteNode(node, value) {
    if (!node) return null;
    
    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
      return node;
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
      return node;
    } else {
      // Node to delete found
      if (!node.left && !node.right) return null;
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      
      // Node has two children
      let minRight = this.findMin(node.right);
      node.value = minRight.value;
      node.right = this.deleteNode(node.right, minRight.value);
      return node;
    }
  }

  findMin(node) {
    while (node.left) {
      node = node.left;
    }
    return node;
  }

  // In-order traversal
  inOrder(node = this.root, result = []) {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }

  // Pre-order traversal
  preOrder(node = this.root, result = []) {
    if (node) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
    return result;
  }

  // Post-order traversal
  postOrder(node = this.root, result = []) {
    if (node) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
    return result;
  }
}

// Test cases
const bst = new BinarySearchTree();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.insert(3);
bst.insert(7);
bst.insert(12);
bst.insert(17);

console.log("In-order:", bst.inOrder()); // [3, 5, 7, 10, 12, 15, 17]
console.log("Pre-order:", bst.preOrder()); // [10, 5, 3, 7, 15, 12, 17]
console.log("Post-order:", bst.postOrder()); // [3, 7, 5, 12, 17, 15, 10]
console.log("Search 7:", bst.search(7)); // true
console.log("Search 20:", bst.search(20)); // false

bst.delete(5);
console.log("After deleting 5:", bst.inOrder()); // [3, 7, 10, 12, 15, 17]

// Time Complexity Analysis:
// Insert: O(log n) average, O(n) worst case
// Search: O(log n) average, O(n) worst case
// Delete: O(log n) average, O(n) worst case
// Traversals: O(n)
        `,
        fileName: 'bst_implementation.js',
        marks: null,
        feedback: null
      },
      '2': {
        id: '2',
        assignmentTitle: 'Data Structures Assignment 1',
        course: 'CS201',
        totalMarks: 100,
        studentName: 'Rahul Kumar',
        studentId: 'ST002',
        studentEmail: 'rahul@student.edu',
        submittedAt: '2026-02-13T15:45:00',
        status: 'graded',
        submissionText: `
// BST Implementation
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  
  insert(val) {
    // Implementation
  }
  
  search(val) {
    // Implementation
  }
}
        `,
        fileName: 'assignment1.zip',
        marks: 85,
        feedback: 'Good implementation. Code is clean and well-structured. Consider adding more edge case handling and documentation.'
      }
    };

    setSubmission(submissionsData[submissionId] || submissionsData['1']);
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <button
            onClick={() => navigate(`/faculty/assignments/${assignmentId}/submissions`)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Back to Submissions
          </button>
          <h1 className="dashboard-title">Submission Details</h1>
          <p className="dashboard-subtitle">{submission.assignmentTitle}</p>
        </div>

        {/* Student Info */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Student Information</h3>
          </div>
          <div className="widget-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Name</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{submission.studentName}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Student ID</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{submission.studentId}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Email</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{submission.studentEmail}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Submitted</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Content */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Submitted Work</h3>
          </div>
          <div className="widget-content">
            {submission.fileName && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                <p style={{ fontSize: '0.875rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📎</span>
                  <strong>Attached File:</strong> {submission.fileName}
                </p>
              </div>
            )}

            <pre style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              maxHeight: '600px'
            }}>
              {submission.submissionText}
            </pre>
          </div>
        </div>

        {/* Grading Section */}
        {submission.status === 'graded' && (
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Grading</h3>
            </div>
            <div className="widget-content">
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Marks Awarded</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
                  {submission.marks}/{submission.totalMarks}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Feedback</p>
                <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
                  {submission.feedback}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => navigate(`/faculty/assignments/${assignmentId}/submissions/${submissionId}/grade`)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: submission.status === 'graded' ? '#64748b' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {submission.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
          </button>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultySubmissionDetailPage;
