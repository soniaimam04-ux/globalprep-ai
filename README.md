# GlobalPrep AI

**GlobalPrep AI** is a web app that helps students preparing for English competitive exams (IELTS/TOEFL) to study abroad — combining exam practice with AI-powered scholarship discovery in one place.

## The Problem

Students who want to study abroad face two disconnected struggles:
1. Preparing for English competitive exams (IELTS/TOEFL) without access to expensive coaching or tutors
2. Manually searching dozens of scattered websites to find scholarships they're actually eligible for

**GlobalPrep AI** solves both by putting an AI mentor in one place: it grades your writing like an examiner, generates practice questions, and — its flagship feature — matches you to real scholarships based on your own academic profile, with reasoning for why each one fits.

**Who it's for:** Students (like myself) applying to study abroad who don't have access to paid IELTS coaching or a scholarship consultant.

## Live App

https://globalprep-ai.vercel.app

## Features

- AI Essay Grader — paste an IELTS/TOEFL-style essay and get an examiner-style band score (1-9) with a breakdown across Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy, plus strengths, corrections, and one actionable tip
- AI Scholarship Matchmaker (flagship feature) — fill in your field of study, GPA, exam scores, preferred country, and financial need, and the AI returns a ranked shortlist of scholarships with reasoning for why each one fits your profile
- Practice Question Generator — AI-generated vocabulary, grammar, and reading comprehension questions by exam type and difficulty
- Vocabulary Builder — daily word sets with a quiz mode
- Progress Dashboard — tracks essay band scores and quiz history over time
- Clean, distraction-free interface with simple navigation between all sections

## The AI Feature

GlobalPrep AI uses Google Gemini for two AI-driven features.

### 1. Essay Grader — system instructions

You are GlobalPrep AI's Writing Coach, an expert IELTS/TOEFL examiner. When a student submits an essay: identify the exam type (assume IELTS Writing Task 2), score it 1-9 with one decimal precision, give a breakdown across Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy, list 3 strengths, list 3 errors with corrections, and end with one actionable tip. Be honest and specific, never inflate scores, never rewrite the whole essay, keep tone supportive but exam-realistic.

### 2. Scholarship Matchmaker — system instructions

You are GlobalPrep AI's Scholarship Advisor, helping students from Pakistan and South Asia find scholarships to study abroad. Given a student profile (field of study, GPA, exam scores, preferred country, financial need), recommend 5-8 real active scholarships, ranked best-fit to least-fit, each with eligibility criteria, reasoning for why it fits this student, and deadline if known. Never invent a scholarship name or fabricate a deadline. Tone: knowledgeable, honest mentor.

## Tools, Services, and AI Models Used

- App builder: v0.dev by Vercel
- AI model: Google Gemini
- Version control: Git, GitHub
- Hosting/Deployment: Vercel

## How to Run Locally

1. Clone the repository: git clone https://github.com/soniaimam04-ux/globalprep-ai.git
2. Install dependencies: npm install
3. Create a .env.local file and add: GEMINI_API_KEY=your_api_key_here
4. Run: npm run dev
5. Open http://localhost:3000

## Author

Built by Sonia Imam as a final project submission.
