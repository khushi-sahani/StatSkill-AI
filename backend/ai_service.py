import os
import json
from unittest import result
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)


def ask_gemini(prompt):
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text


def analyze_skill_gap(assessment_results, user_profile):
    prompt = f"""
You are an AI competency assessment expert for India's Official Statistical System.

Analyze the following employee profile and assessment results.

USER PROFILE:
{user_profile}

ASSESSMENT RESULTS:
{assessment_results}

Identify:
1. Strong competencies
2. Weak competencies
3. Critical skill gaps
4. Priority level for each gap
5. A short personalized learning recommendation

Return the answer in this exact structure:

STRONG SKILLS:
- skill

SKILL GAPS:
- skill: priority

CRITICAL GAPS:
- skill

LEARNING PLAN:
1. skill - recommendation
2. skill - recommendation
3. skill - recommendation

Keep the response concise and practical.
"""

    return ask_gemini(prompt)
def recommend_courses(skill_gaps, courses):
    recommendations = []

    for course in courses:
        skill = course["skill"]

        if skill in skill_gaps:
            recommendations.append(course)

    return recommendations

def generate_mcqs(text):
    prompt = f"""
You are an expert trainer for Official Statistics.

Read the training material below and generate exactly 5 multiple-choice questions.

TRAINING MATERIAL:
{text}

Return ONLY valid JSON.
Do not use markdown.
Do not add ```json.
Do not add any text before or after the JSON.

Use exactly this format:

[
  {{
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Option B",
    "explanation": "Short explanation"
  }}
]

Rules:
- Generate exactly 5 questions.
- Each question must have exactly 4 options.
- The answer must exactly match one of the four options.
- Questions must be based only on the training material.
- Keep explanations short and clear.
"""

    result = ask_gemini(prompt)
    return json.loads(result)