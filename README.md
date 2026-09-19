# 📊 StatSkill AI

**AI-powered competency assessment and personalized learning platform**

StatSkill AI is a full-stack learning platform designed to assess a user's competencies, identify skill gaps, and provide personalized learning recommendations.

The platform combines **AI-powered assessment, skill-gap analysis, MCQ generation, and personalized course recommendations** in a single application.

---

## 🚀 Features

* 📝 **Competency Assessment**

  * Assess knowledge across areas such as Python, SQL, Sampling, Data Privacy, and Communication.

* 🤖 **AI-Powered Skill Gap Analysis**

  * Analyze assessment performance.
  * Identify areas that need improvement.
  * Prioritize skill gaps.

* 🧠 **AI-Generated MCQs**

  * Generate practice questions based on selected topics.

* 📚 **Personalized Learning Recommendations**

  * Recommend relevant learning resources based on identified skill gaps.

* 📄 **Training Material**

  * Generate and use structured training material for learning and assessment.

* 🌐 **Full-Stack Architecture**

  * React frontend connected with a FastAPI backend.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* REST APIs

### AI

* Google Gemini API

### Tools

* Git
* GitHub
* VS Code

---

## 🏗️ Project Structure

```text
StatSkill-AI/
│
├── backend/
│   ├── main.py
│   ├── assessment.py
│   ├── competencies.py
│   ├── courses.py
│   ├── database.py
│   ├── models.py
│   ├── ai_service.py
│   ├── pdf_service.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/khushi-sahani/StatSkill-AI.git
cd StatSkill-AI
```

---

## 🔧 Backend Setup

Open a terminal inside the project directory.

### Create virtual environment

```bash
python -m venv .venv
```

### Activate the environment

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

### Install dependencies

If a `requirements.txt` file is present:

```bash
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file inside the `backend` directory:

```text
GEMINI_API_KEY=your_api_key_here
```

**Do not commit your API key to GitHub.**

### Run the backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

---

## 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔌 API

The backend provides REST API endpoints for functionality such as:

* Assessment
* MCQ generation
* Skill-gap analysis
* Course recommendations
* Training material

FastAPI also provides interactive API documentation.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

---

## 🔐 Security

API keys and other sensitive configuration values are stored using environment variables and are excluded from version control using `.gitignore`.

---

## 🔮 Future Improvements

* User authentication and profiles
* Persistent cloud database
* Improved AI-based competency evaluation
* Learning progress dashboard
* More personalized course recommendations
* Deployment of frontend and backend
* Advanced analytics and progress tracking

---

## 👩‍💻 Author

**Khushi Sahani**

B.Tech — Computer Science & Engineering

GitHub: https://github.com/khushi-sahani

---

## ⭐ Project Status

**In Development**

StatSkill AI is being actively developed as a full-stack AI-powered learning and competency assessment project.
