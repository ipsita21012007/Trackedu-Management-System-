# Trackedu-Management-System
# Edu-Industry Skill Readiness & Compliance Management System

This document outlines the implementation plan for building a full-stack platform that bridges the gap between academic education and industry skill requirements. The system will track students' skills, certifications, and internships, and generate compliance/readiness reports.

## User Review Required

- **Database Credentials:** The backend connects to MySQL. I will use a default setup (`localhost`, `root`, `admin`, database name: `trackedu_db`). Please ensure these match your local MySQL configuration, or let me know if they need to be updated.
- **Project Structure:** We will replace the contents of the existing `backend/server.js` and `frontend/public/index.html` to align with the new requirements.

## Proposed Changes

---

### Database Schema

#### [NEW] [schema.sql](file:///i:/Trackedu_app/backend/schema.sql)
Creates the complete database schema with necessary tables, constraints, a trigger, and sample data.
- **Tables:** `Student`, `Skill_Master`, `Student_Skill`, `Certification_Master`, `Student_Certification`, `Industry_Partner`, `Internship`, `Compliance_Report`.
- **Trigger:** Updates the `Student.academic_status` to 'Industry Engaged' automatically when a new record is added to `Internship`.
- **Sample Data:** Inserts realistic data for students, skills, certifications, and internships.

---

### Backend API (Node.js + Express)

#### [MODIFY] [server.js](file:///i:/Trackedu_app/backend/server.js)
The existing server will be completely overhauled to support the new RESTful endpoints and MySQL operations.
- **Database Connection:** Implement MySQL connection pooling.
- **API Endpoints:**
  - `GET /api/dashboard/stats`: Returns overall statistics.
  - `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id`: Student CRUD.
  - `GET /api/skills`, `POST /api/skills`: Skill master list and creation.
  - `GET /api/students/:id/skills`, `POST /api/students/:id/skills`: Assign/get student skills.
  - `GET /api/certifications`, `POST /api/certifications`: Certification master list and creation.
  - `GET /api/students/:id/certifications`, `POST /api/students/:id/certifications`: Assign/get student certifications.
  - `POST /api/students/:id/internships`: Add internship (which activates the trigger).
  - `GET /api/students/:id/compliance`, `POST /api/students/:id/compliance`: Calculate and retrieve the compliance score based on the 30/40/30 ratio for skills, certs, and internships.
- **Transactions:** Use `SAVEPOINT` and `ROLLBACK` for complex updates (e.g., student assignments).
- **Security:** Use prepared statements for all database queries to prevent SQL injection.

#### [MODIFY] [package.json](file:///i:/Trackedu_app/package.json)
Ensure `express`, `mysql2`, `cors`, and `body-parser` dependencies are present and correctly configured.

---

### Frontend Dashboard

#### [MODIFY] [index.html](file:///i:/Trackedu_app/frontend/public/index.html)
Will contain the complete HTML, embedded CSS, and JavaScript for a responsive Single Page Application.
- **Design:** Dark theme, glassmorphism elements, vibrant gradients, modern typography (Google Fonts).
- **Navigation:** Tabs for Dashboard, Students, Skills, Certifications, and Compliance.
- **Dynamic Content:** AJAX/Fetch calls to the backend APIs to populate tables and cards.
- **Modals & Toasts:** Elegant UI components for creating/editing data and providing user feedback on actions.
- **Compliance Display:** Color-coded readiness level logic (Green > 80, Yellow > 60, Orange > 40, Red < 40).

## Verification Plan

### Automated/Manual Verification
1. Run the `schema.sql` script in MySQL to build the database.
2. Start the backend server (`npm run dev` or `node server.js`).
3. Open `http://localhost:3000` in the browser.
4. Test the full flow:
   - View dashboard statistics.
   - Add/Edit/Delete a student.
   - Assign new skills and certifications to a student.
   - Add an internship to verify the trigger fires and updates `academic_status`.
   - Generate a compliance report and verify the color-coding and breakdown percentages.
