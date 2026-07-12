LOCAL_KNOWLEDGE = [
    {
        "keywords": ["python", "variable", "variables"],
        "answer": "In Python, variables are names used to store data values. Example: x = 10 stores the value 10 in variable x."
    },
    {
        "keywords": ["python", "loop", "loops", "for loop", "while loop"],
        "answer": "Loops in Python are used to repeat a block of code. A for loop is used to iterate over a sequence, while a while loop runs until a condition becomes false."
    },
    {
        "keywords": ["assessment", "quiz", "score"],
        "answer": "Assessments help students test their understanding. After submitting a quiz, the backend calculates score, percentage, and pass/fail result."
    },
    {
        "keywords": ["certificate", "completion"],
        "answer": "A certificate is generated only after the student completes all lessons and passes all assessments in the course."
    },
    {
        "keywords": ["wallet", "payment", "buy course"],
        "answer": "For paid courses, students must add money to their wallet and buy the course. After successful payment, enrollment is created automatically."
    },
    {
        "keywords": ["lesson", "content", "upload"],
        "answer": "Lessons can contain videos, PDFs, notes, images, or resource files uploaded by the instructor."
    }
]

def search_local_mcp(question: str):
    question_lower = question.lower()

    for item in LOCAL_KNOWLEDGE:
        matched_keywords = [
            keyword
            for keyword in item["keywords"]
            if keyword in question_lower
        ]

        if matched_keywords:
            return {
                "answer": item["answer"],
                "source": "local_mcp",
                "matched_keywords": matched_keywords
            }

    return None