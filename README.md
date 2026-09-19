# StatSkill AI

**AI-powered competency assessment and personalized learning platform**

StatSkill AI is a full-stack application designed to assess user competencies, identify skill gaps, and provide personalized learning support using AI.

## Features

* 📝 **Competency Assessment**

  * Assess skills across multiple competency areas.

* 🤖 **AI-Powered MCQ Generation**

  * Generates exactly 5 questions.
  * Each question contains 4 options.
  * Answers are matched to the provided options.
  * Questions are generated based only on the provided training material.
  * Includes short and clear explanations.

* 📊 **Skill Gap Analysis**

  * Identifies areas where the learner needs improvement based on assessment performance.

* 📚 **Personalized Learning**

  * Provides learning recommendations based on identified competency gaps.

* 📄 **Training Material**

  * Uses structured training material as the basis for AI-generated assessment content.

## Tech Stack

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
* REST API

### AI

* Google Gemini API

### Development Tools

* Git
* GitHub
* VS Code

## Project Structure

```text
StatSkill-AI/
│
├── backend/
│   ├── main.py
│   ├── ai_service.py
│   ├── assessment.py
│   ├── competencies.py
│   ├── courses.py
│   ├── database.py
│   ├── models.py
│   ├── pdf_service.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/khushi-sahani/StatSkill-AI.git
cd StatSkill-AI
```

### Backend

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install the required Python packages according to the project's backend dependencies.

Create a `.env` file inside `backend/` and add your Gemini API configuration.

**Never commit API keys or other secrets to GitHub.**

Start the FastAPI server:

```bash
cd backend
uvicorn main:app --reload
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The development server will normally run at:

```text
http://localhost:5173
```

## AI MCQ Generation

The AI assessment system uses the provided training material to generate structured multiple-choice questions.

The generation rules require:

* 5 questions per generation
* 4 options per question
* The correct answer must match one of the options
* Questions must be based only on the training material
* Short explanations for answers

The generated response is parsed as JSON before being returned by the backend.

## API

The backend exposes REST API endpoints for application functionality such as:

* Competency assessment
* MCQ generation
* Skill-gap analysis
* Learning recommendations

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Security

Sensitive configuration such as API keys should be stored in environment variables and excluded from Git using `.gitignore`.

## Future Improvements

* User authentication
* Cloud database integration
* Learning progress tracking
* Improved personalization
* Advanced learner analytics
* Production deployment
* Expanded competency areas

## Project Status

**In Development**

StatSkill AI is being developed as a full-stack AI-powered competency assessment and personalized learning platform.

## Author

**Khushi Sahani**

B.Tech Computer Science & Engineering

GitHub: https://github.com/khushi-sahani
