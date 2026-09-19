from ai_service import ask_gemini

prompt = """
You are an AI competency assessment expert.

For a Statistical Officer working in India's Official Statistical System,
identify 3 important technical skills they should develop.

Return only the skill names as a numbered list.
"""

result = ask_gemini(prompt)

print(result)