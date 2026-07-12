Copy-paste this as your `README.md` in the main project folder.

```md
# LearnSphere AI

LearnSphere AI is an AI-powered EdTech learning platform designed to provide a complete online learning experience for students, instructors, and administrators. The platform supports course learning, lesson management, assessments, certificates, wallet payments, AI Tutor support, study planning, mock interviews, notifications, and admin control.

The project is developed using React for the frontend, FastAPI for the backend, SQLite for database storage, and AWS services for deployment.

---

## Project Overview

LearnSphere AI provides a single platform where students can learn from online courses, instructors can create and manage learning content, and admins can control users, courses, and instructor verification.

The system includes AI-based doubt solving through an AI Tutor, role-based access control, course enrollment, assessments, progress tracking, wallet-based payment, certificate generation, and AWS cloud deployment.

---

## Key Features

### Student Features

- Register and login
- Browse free and paid courses
- Enroll in courses
- Access lessons and uploaded content
- Mark lessons as completed
- Attempt assessments and quizzes
- Review assessment answers
- Track course progress
- Generate and view certificates
- Use AI Tutor for doubt solving
- Create and manage study plans
- Attempt mock interviews
- View notifications
- Wallet top-up and payment history

### Instructor Features

- Register as instructor
- Submit KYC document
- Create and manage courses
- Create free and paid courses
- Upload lesson content
- Edit and delete lessons
- Create and manage assessments
- Add, edit, and delete questions
- View course analytics

### Admin Features

- View admin dashboard
- Manage users
- View user details
- Update user roles
- Manage all courses
- Review instructor KYC requests
- Approve or reject KYC
- Monitor platform data

---

## User Roles

The system supports three main user roles:

| Role | Description |
|---|---|
| Student | Learns through courses, attempts assessments, uses AI Tutor, and generates certificates |
| Instructor | Creates courses, uploads lessons, and manages assessments |
| Admin | Manages users, courses, KYC requests, and platform activities |

---

## Tech Stack

### Frontend

- React
- TypeScript
- Material UI
- React Router
- Axios
- Framer Motion
- Vite

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Uvicorn

### Database

- SQLite

### AI Integration

- Groq API / OpenAI-compatible client

### Cloud and Deployment

- AWS EC2
- AWS S3
- AWS CloudFront
- AWS CloudWatch
- IAM
- Terraform

---

## Project Architecture

```text
Users
(Student / Instructor / Admin)
        |
        v
React Frontend
(Material UI + React Router + Axios)
        |
        v
FastAPI Backend
(Authentication + APIs + Business Logic)
        |
        +----------------------+
        |                      |
        v                      v
SQLite Database           AI Tutor Service
(Users, Courses,          Groq API /
Lessons, Payments,        OpenAI-compatible API
Assessments, etc.)
```

---

## Project Structure

```text
learnsphere/
├── learnsphere-backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── mcps/
│   │   └── main.py
│   ├── uploads/
│   ├── requirements.txt
│   └── .env
│
├── learnsphere-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── index.html
│
├── terraform/
├── README.md
└── .gitignore
```

---

## Frontend Setup

Go to the frontend folder:

```bash
cd learnsphere-frontend
```

Install dependencies:

```bash
npm install
```

Run frontend locally:

```bash
npm run dev
```

Build frontend for production:

```bash
npm run build
```

The production build will be created in:

```text
dist/
```

---

## Backend Setup

Go to the backend folder:

```bash
cd learnsphere-backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment:

For Windows:

```bash
venv\Scripts\activate
```

For Linux / Ubuntu:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend locally:

```bash
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Environment Variables

Create a `.env` file inside the backend folder:

```env
DATABASE_URL=sqlite:///./learnsphere.db
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GROQ_API_KEY=your_groq_api_key_here
```

Do not upload `.env` to GitHub.

---

## API Modules

The backend provides APIs for the following modules:

- Authentication
- Users
- Courses
- Enrollments
- Uploads
- Lessons
- Lesson Progress
- Assessments
- Attempts
- Wallet and Payments
- Certificates
- Notifications
- AI Tutor
- Study Plans
- Recommendations
- Mock Interviews
- Admin
- Backend for Frontend Dashboard APIs

---

## Database

The project uses SQLite during deployment.

Main tables include:

- users
- courses
- lessons
- enrollments
- assessments
- questions
- attempts
- attempt_answers
- wallets
- payments
- certificates
- notifications
- study_plans
- ai_chats
- mock_interviews
- interview_questions

To view database tables on EC2:

```bash
cd ~/learnsphere/learnsphere-backend
sqlite3 learnsphere.db ".tables"
```

To view users:

```bash
sqlite3 -header -column learnsphere.db "SELECT * FROM users;"
```

---

## AWS Deployment

The project is deployed on AWS using the following services:

| AWS Service | Purpose |
|---|---|
| EC2 | Hosts FastAPI backend |
| S3 | Stores React frontend build files |
| CloudFront | Provides public HTTPS frontend URL |
| CloudWatch | Monitors backend logs |
| IAM | Provides permissions for services |
| Security Groups | Controls inbound and outbound traffic |

### Backend Deployment

The backend runs on EC2 using Uvicorn and systemd service.

Example backend URL:

```text
http://EC2_PUBLIC_IP:8000/docs
```

### Frontend Deployment

Frontend is built using:

```bash
npm run build
```

Then uploaded to S3:

```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

CloudFront cache is cleared using:

```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## CloudWatch Logs

CloudWatch Agent is configured on EC2 to send backend logs to CloudWatch.

Log group:

```text
/learnsphere/backend
```

Logs can be viewed in:

```text
AWS Console → CloudWatch → Logs → Log groups
```

Example logs include:

```text
POST /auth/login
POST /auth/register
GET /users/me
GET /courses/
```

---

## Public Links

Frontend public URL:

```text
https://YOUR_CLOUDFRONT_DOMAIN
```

Backend Swagger URL:

```text
http://YOUR_EC2_PUBLIC_IP:8000/docs
```

---

## Authentication and Authorization

LearnSphere AI uses JWT-based authentication.

- Access token is generated after login
- Refresh token is used to renew sessions
- Protected APIs require token authorization
- Role-based access is used for student, instructor, and admin features
- Passwords are stored as hashed values

---

## Frontend-Backend Integration

The frontend communicates with the backend using Axios.

API requests include the JWT token in the request header:

```text
Authorization: Bearer access_token
```

Axios interceptors are used to attach tokens and handle authentication errors.

---

## File Upload Support

Instructors can upload lesson content.

Allowed file types:

```text
.mp4
.pdf
.jpg
.jpeg
.png
.txt
.docx
```

Uploaded files are stored in:

```text
uploads/content
```

---

## Future Enhancements

- Live class integration
- Discussion forum
- Mobile application
- Real payment gateway integration
- Cloud file storage using S3
- Advanced AI Tutor
- Gamification features
- Advanced analytics dashboard
- Email and SMS notifications
- Instructor revenue management

---

## Conclusion

LearnSphere AI is a complete EdTech platform that combines online learning, course management, assessments, payments, AI Tutor support, certificates, and admin control. The project demonstrates full-stack development, REST API integration, role-based authentication, database management, and AWS cloud deployment.
```

## Project Technical Documentation

The complete project technical documentation is available here:

[Download LearnSphere AI Project Technical Report](docs/LearnSphere_AI_Technical_Document 1)