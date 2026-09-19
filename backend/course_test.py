from ai_service import recommend_courses
from courses import COURSES

skill_gaps = [
    "Python",
    "Data Visualization",
    "SQL"
]

recommendations = recommend_courses(
    skill_gaps,
    COURSES
)

for course in recommendations:
    print(course)