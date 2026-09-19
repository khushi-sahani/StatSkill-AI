from ai_service import analyze_skill_gap

user_profile = {
    "designation": "Statistical Officer",
    "department": "MoSPI",
    "experience": 3,
    "role": "Data Analyst"
}

assessment_results = {
    "Sampling": 90,
    "Python": 50,
    "SQL": 60,
    "Data Visualization": 30,
    "AI/ML": 20
}

result = analyze_skill_gap(
    assessment_results,
    user_profile
)

print(result)