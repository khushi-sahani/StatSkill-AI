from sqlalchemy.orm import Session
from assessment import QUESTIONS

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pdf_service import extract_text_from_pdf
from ai_service import generate_mcqs, ask_gemini

from pydantic import BaseModel

from database import Base, engine, SessionLocal
from models import User

import random
import json


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="StatSkill AI",
    description="AI-powered competency and personalized learning platform",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Welcome to StatSkill AI",
        "status": "running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================================================
# PDF BASED MCQ GENERATION
# =========================================================

@app.post("/generate-mcqs")
async def generate_mcqs_from_pdf(
    file: UploadFile = File(...)
):

    file_path = f"temp_{file.filename}"

    try:

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        text = extract_text_from_pdf(file_path)

        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF."
            )

        mcqs = generate_mcqs(text)

        return {
            "filename": file.filename,
            "mcqs": mcqs
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"MCQ generation failed: {str(e)}"
        )


# =========================================================
# RANDOM COMPETENCY ASSESSMENT
# =========================================================

@app.get("/assessment")
def get_assessment():

    competency_questions = {}

    for question in QUESTIONS:

        competency = question["competency"]

        if competency not in competency_questions:
            competency_questions[competency] = []

        competency_questions[competency].append(question)

    selected_questions = []

    for competency in competency_questions:

        selected_question = random.choice(
            competency_questions[competency]
        )

        selected_questions.append(
            selected_question
        )

    random.shuffle(selected_questions)

    questions_for_frontend = []

    for question in selected_questions:

        questions_for_frontend.append({
            "id": question["id"],
            "competency": question["competency"],
            "question": question["question"],
            "options": question["options"]
        })

    return {
        "total_questions": len(questions_for_frontend),
        "questions": questions_for_frontend
    }


# =========================================================
# SUBMIT COMPETENCY ASSESSMENT
# =========================================================

class AssessmentAnswer(BaseModel):
    question_id: int
    answer: int


class AssessmentSubmission(BaseModel):
    answers: list[AssessmentAnswer]


@app.post("/assessment/submit")
def submit_assessment(submission: AssessmentSubmission):

    # Create a quick lookup:
    # question_id -> question
    question_map = {
        question["id"]: question
        for question in QUESTIONS
    }

    score = 0

    competency_correct = {}
    competency_total = {}

    submitted_questions = []

    # -----------------------------------------------------
    # CHECK EACH SUBMITTED ANSWER
    # -----------------------------------------------------

    for submitted in submission.answers:

        question_id = submitted.question_id
        user_answer = submitted.answer

        question = question_map.get(question_id)

        # Ignore invalid question IDs
        if question is None:
            continue

        submitted_questions.append(question)

        competency = question["competency"]

        # Initialize competency counters
        if competency not in competency_total:
            competency_total[competency] = 0

        if competency not in competency_correct:
            competency_correct[competency] = 0

        competency_total[competency] += 1

        # Correct answer
        correct_answer = question["answer"]

        if user_answer == correct_answer:

            score += 1
            competency_correct[competency] += 1

    # -----------------------------------------------------
    # OVERALL SCORE
    # -----------------------------------------------------

    total = len(submitted_questions)

    percentage = (
        (score / total) * 100
        if total > 0
        else 0
    )

    # -----------------------------------------------------
    # COMPETENCY ANALYSIS
    # -----------------------------------------------------

    competency_analysis = {}

    strengths = []
    skill_gaps = []
    recommendations = []

    recommendation_map = {

        "Sampling":
            "Revise sampling methods, population, sample, and sampling techniques.",

        "Python":
            "Practice Python fundamentals, functions, lists, dictionaries, loops, and problem solving.",

        "SQL":
            "Practice SQL queries including SELECT, WHERE, GROUP BY, JOIN, UPDATE, DELETE, and aggregate functions.",

        "Data Privacy":
            "Learn data privacy principles, personal data protection, consent, encryption, and secure data handling.",

        "Communication":
            "Practice clear communication, active listening, presentations, teamwork, and explaining technical concepts."
    }

    for competency in competency_total:

        correct = competency_correct[competency]

        total_competency = competency_total[competency]

        competency_percentage = (
            (correct / total_competency) * 100
            if total_competency > 0
            else 0
        )

        # Determine competency level
        if competency_percentage >= 80:

            level = "Strong"

            strengths.append(competency)

        elif competency_percentage >= 60:

            level = "Good"

        elif competency_percentage >= 40:

            level = "Needs Improvement"

            skill_gaps.append(competency)

        else:

            level = "Weak"

            skill_gaps.append(competency)

        recommendation = recommendation_map.get(
            competency,
            f"Continue learning and practicing {competency}."
        )

        competency_analysis[competency] = {

            "correct": correct,

            "total": total_competency,

            "percentage": round(competency_percentage, 2),

            "level": level,

            "recommendation": recommendation
        }

        # Add recommendation only for weak areas
        if competency in skill_gaps:

            recommendations.append({

                "competency": competency,

                "recommendation": recommendation
            })

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {

        "score": score,

        "total_questions": total,

        "percentage": round(percentage, 2),

        "competency_scores": competency_correct,

        "competency_analysis": competency_analysis,

        "strengths": strengths,

        "skill_gaps": skill_gaps,

        "recommendations": recommendations
    }
# =========================================================
# TOPIC QUIZ REQUEST MODEL
# =========================================================

class TopicQuizRequest(BaseModel):

    topic: str

    competency: str


# =========================================================
# GENERATE AI QUIZ FROM LEARNING TOPIC
# =========================================================

@app.post("/generate-topic-quiz")
def generate_topic_quiz(
    request: TopicQuizRequest
):

    topic = request.topic.strip()
    competency = request.competency.strip()

    if not topic:

        raise HTTPException(
            status_code=400,
            detail="Topic is required."
        )

    if not competency:

        raise HTTPException(
            status_code=400,
            detail="Competency is required."
        )

    prompt = f"""
You are an expert trainer for India's Official Statistical System.

Create a short beginner-friendly learning quiz.

COMPETENCY:
{competency}

TOPIC:
{topic}

Generate exactly 5 multiple-choice questions.

The questions should test understanding of the topic,
not just memorization.

Return ONLY valid JSON.

Do not use markdown.
Do not use ```json.
Do not add any text before or after the JSON.

Use exactly this structure:

[
  {{
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Option A",
    "explanation": "Short and simple explanation"
  }}
]

Rules:

1. Generate exactly 5 questions.
2. Every question must have exactly 4 options.
3. The answer must exactly match one option.
4. Explanations must be short and beginner-friendly.
5. Questions must be related to the selected topic.
6. Avoid ambiguous questions.
7. Avoid duplicate questions.
8. Use simple English.
"""

    try:

        response = ask_gemini(prompt)

        response = response.strip()

        if response.startswith("```"):

            response = response.replace(
                "```json",
                ""
            )

            response = response.replace(
                "```",
                ""
            )

            response = response.strip()

        quiz = json.loads(response)

        if not isinstance(quiz, list):

            raise ValueError(
                "Gemini returned invalid quiz format."
            )

        if len(quiz) != 5:

            raise ValueError(
                "Gemini did not generate exactly 5 questions."
            )

        for question in quiz:

            if "question" not in question:
                raise ValueError(
                    "Question text missing."
                )

            if "options" not in question:
                raise ValueError(
                    "Options missing."
                )

            if "answer" not in question:
                raise ValueError(
                    "Answer missing."
                )

            if "explanation" not in question:
                raise ValueError(
                    "Explanation missing."
                )

            if len(question["options"]) != 4:
                raise ValueError(
                    "Each question must have 4 options."
                )

            if question["answer"] not in question["options"]:
                raise ValueError(
                    "Correct answer does not match an option."
                )

        return {

            "competency": competency,

            "topic": topic,

            "total_questions": 5,

            "questions": quiz
        }

    except json.JSONDecodeError:

        raise HTTPException(

            status_code=500,

            detail="Gemini returned invalid JSON."
        )

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"AI quiz generation failed: {str(e)}"
        )


# =========================================================
# QUIZ SUBMISSION MODEL
# =========================================================

class QuizQuestion(BaseModel):

    question: str

    answer: str

    explanation: str


class QuizSubmission(BaseModel):

    questions: list[QuizQuestion]

    answers: list[str]


# =========================================================
# SUBMIT AI QUIZ
# =========================================================

@app.post("/quiz/submit")
def submit_quiz(
    submission: QuizSubmission
):

    total = len(submission.questions)

    if len(submission.answers) != total:

        raise HTTPException(

            status_code=400,

            detail="Number of answers does not match questions."
        )

    correct = 0

    results = []

    for i in range(total):

        question = submission.questions[i]

        user_answer = submission.answers[i]

        correct_answer = question.answer

        if user_answer == correct_answer:

            correct += 1

            is_correct = True

        else:

            is_correct = False

        results.append({

            "question": question.question,

            "user_answer": user_answer,

            "correct_answer": correct_answer,

            "is_correct": is_correct,

            "explanation": question.explanation
        })

    percentage = (

        (correct / total) * 100

        if total > 0

        else 0
    )

    return {

        "total_questions": total,

        "correct": correct,

        "wrong": total - correct,

        "percentage": percentage,

        "results": results
    }


# =========================================================
# CREATE USER
# =========================================================

@app.post("/users")
def create_user(

    name: str,

    designation: str,

    department: str,

    experience: int,

    role: str,

    db: Session = Depends(get_db)
):

    user = User(

        name=name,

        designation=designation,

        department=department,

        experience=experience,

        role=role
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return {

        "message": "User created successfully",

        "user_id": user.id,

        "name": user.name
    }


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )