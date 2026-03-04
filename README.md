# 🎓 Learning Management System (LMS)

A full-stack Learning Management System with AI-powered features, built with React, Node.js, and Python.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Python 3.8+
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
git clone <your-repo-url>
cd LMS_NEW
```

2. **Backend setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed:admin
npm start
```

3. **Frontend setup:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. **AI Agents setup (optional):**
```bash
cd smart_lms
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python run.py
```

### Default Credentials
- **Username:** admin
- **Password:** admin123
- **Role:** admin

## 📁 Project Structure

```
LMS_NEW/
├── backend/          # Node.js/Express API
├── frontend/         # React/Vite UI
├── smart_lms/        # Python AI agents
└── docs/             # Documentation
```

## 🌐 Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **AI Agents:** http://localhost:5001 (if running)

## 📚 Features

### For Administrators
- User management (create, edit, delete users)
- Course approval workflow
- System settings configuration
- Activity logs monitoring
- Analytics dashboard

### For Faculty
- Create and manage quizzes
- Upload course materials (PDF)
- AI-powered quiz generation
- Student progress tracking
- Assignment management

### For Students
- Take quizzes and assignments
- View course materials
- Track personal progress
- AI tutor assistance
- Adaptive learning paths

## 🔧 Technology Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- PDF parsing

### Frontend
- React 19
- React Router
- Vite
- Tailwind CSS
- Axios

### AI Agents
- Python + Flask
- Google Gemini API
- Groq API
- LangChain
- PDF processing

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [Architecture](docs/ARCHITECTURE.md) - System design and data flow
- [API Reference](docs/API.md) - API endpoints documentation
- [Features](docs/FEATURES.md) - Feature documentation
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and fixes

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- CORS protection
- Input validation
- File upload restrictions
- Environment variable protection

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Python tests
cd smart_lms
pytest
```

## 📝 Scripts

### Backend
```bash
npm start              # Start production server
npm run dev            # Start development server
npm run seed:admin     # Create admin user
npm run seed:users     # Create test users
npm run reset:admin    # Reset admin password
```

### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run linter
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC License

## 👥 Authors

Your Team Name

## 🐛 Known Issues

See [PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md) for current issues and cleanup tasks.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note:** This project is under active development. See PROJECT_ANALYSIS_REPORT.md for cleanup recommendations.
