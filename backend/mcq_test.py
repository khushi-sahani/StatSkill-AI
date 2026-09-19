from pdf_service import extract_text_from_pdf
from ai_service import generate_mcqs

text = extract_text_from_pdf("statskill_training_material.pdf")

result = generate_mcqs(text)

print(result)