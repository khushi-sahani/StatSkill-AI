from reportlab.pdfgen import canvas

pdf = canvas.Canvas("statskill_training_material.pdf")

pdf.setFont("Helvetica-Bold", 18)
pdf.drawString(100, 800, "StatSkill AI - Sample Training Material")

pdf.setFont("Helvetica-Bold", 14)
pdf.drawString(50, 750, "Introduction to Official Statistics")

pdf.setFont("Helvetica", 11)

text = [
    "Official statistics are data produced by government agencies",
    "to support policy making, planning, and public decision making.",
    "",
    "Sampling",
    "Sampling is the process of selecting a representative subset",
    "of a population for a statistical study.",
    "",
    "Data Quality",
    "Important dimensions include accuracy, completeness, consistency,",
    "timeliness, and relevance.",
    "",
    "Data Privacy",
    "Data privacy focuses on protecting personal and sensitive information.",
    "",
    "Data Visualization",
    "Charts, graphs, tables, and dashboards help communicate",
    "statistical information clearly."
]

y = 720

for line in text:
    pdf.drawString(50, y, line)
    y -= 20

pdf.save()

print("PDF created successfully!")