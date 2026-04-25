const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend/public')); // Serve frontend

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'schema_project',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Test DB Connection
async function testConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}
testConnection();

// --- DASHBOARD ENDPOINTS ---
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [[{ totalStudents }]] = await promisePool.query('SELECT COUNT(*) AS totalStudents FROM Student');
        const [[{ totalSkills }]] = await promisePool.query('SELECT COUNT(*) AS totalSkills FROM Skill');
        const [[{ totalCerts }]] = await promisePool.query('SELECT COUNT(*) AS totalCerts FROM Certification');
        const [[{ totalInternships }]] = await promisePool.query('SELECT COUNT(*) AS totalInternships FROM Internship');

        // Since compliance_score is not in the new schema, we'll calculate an average dynamically or return a placeholder
        res.json({
            success: true,
            data: {
                totalStudents,
                totalSkills,
                totalCerts,
                totalInternships,
                averageCompliance: 80.50 // Placeholder since the field was removed from schema
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/dashboard/details', async (req, res) => {
    try {
        const [skills] = await promisePool.query(`
            SELECT sk.Skill_Name, sk.Skill_Category, sk.Skill_Level, st.Name as StudentName 
            FROM Skill sk JOIN Student st ON sk.Student_ID = st.Student_ID 
            ORDER BY sk.Skill_Name DESC LIMIT 15
        `);
        const [certs] = await promisePool.query(`
            SELECT c.Certification_Name, c.Issuing_Organization, st.Name as StudentName 
            FROM Certification c JOIN Student st ON c.Student_ID = st.Student_ID 
            ORDER BY c.Certification_ID DESC LIMIT 15
        `);
        const [interns] = await promisePool.query(`
            SELECT i.Organization_Name, i.Duration, i.Verification_Status, st.Name as StudentName 
            FROM Internship i JOIN Student st ON i.Student_ID = st.Student_ID 
            ORDER BY i.Organization_Name DESC LIMIT 15
        `);

        res.json({ success: true, data: { skills, certs, interns } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- STUDENT ENDPOINTS ---
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await promisePool.query(`
            SELECT 
                s.*, 
                (SELECT COUNT(*) FROM Skill WHERE Student_ID = s.Student_ID) as skills_count,
                (SELECT COUNT(*) FROM Certification WHERE Student_ID = s.Student_ID) as certs_count,
                (SELECT COUNT(*) FROM Internship WHERE Student_ID = s.Student_ID) as internships_count
            FROM Student s 
            ORDER BY s.Student_ID DESC
        `);
        // Map to match frontend expectations
        const mappedRows = rows.map(r => ({
            id: r.Student_ID,
            name: r.Name,
            roll_number: r.Roll_Number,
            role_domain: r.Role_Domain,
            mode: r.Mode,
            academic_status: r.Academic_Status,
            skills_count: r.skills_count,
            certs_count: r.certs_count
        }));
        res.json({ success: true, data: mappedRows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    const { name, roll_number, role_domain, mode, mentor_feedback, academic_status } = req.body;
    try {
        // Calculate next ID since there's no AUTO_INCREMENT in the new schema
        const [[{ maxId }]] = await promisePool.query('SELECT MAX(Student_ID) as maxId FROM Student');
        const nextId = (maxId || 0) + 1;

        await promisePool.query(
            'INSERT INTO Student (Student_ID, Name, Roll_Number, Role_Domain, Mode, Mentor_Feedback, Academic_Status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nextId, name, roll_number, role_domain, mode, mentor_feedback || 'No feedback', academic_status || 'Active']
        );
        res.json({ success: true, message: 'Student added successfully!', id: nextId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, roll_number, role_domain, mode } = req.body;
    try {
        await promisePool.query(
            'UPDATE Student SET Name = ?, Roll_Number = ?, Role_Domain = ?, Mode = ? WHERE Student_ID = ?',
            [name, roll_number, role_domain, mode, id]
        );
        res.json({ success: true, message: 'Student updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Dependencies will need manual deletion or ON DELETE CASCADE should be added in schema
        await promisePool.query('DELETE FROM Skill WHERE Student_ID = ?', [id]);
        await promisePool.query('DELETE FROM Certification WHERE Student_ID = ?', [id]);
        await promisePool.query('DELETE FROM Internship WHERE Student_ID = ?', [id]);
        await promisePool.query('DELETE FROM Student WHERE Student_ID = ?', [id]);
        res.json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- SKILLS ENDPOINTS ---
app.get('/api/skills', async (req, res) => {
    try {
        const [rows] = await promisePool.query('SELECT DISTINCT Skill_Name as skill_name, Skill_Category as skill_category FROM Skill');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/students/:id/skills', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await promisePool.query(`
            SELECT Skill_Name as skill_name, Skill_Category as skill_category, Skill_Level as skill_level 
            FROM Skill
            WHERE Student_ID = ?
        `, [id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/students/:id/skills', async (req, res) => {
    const studentId = req.params.id;
    let { skill_name, skill_category, skill_level } = req.body;

    try {
        await promisePool.query(
            'INSERT INTO Skill (Skill_Name, Skill_Category, Skill_Level, Student_ID) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE Skill_Level = ?',
            [skill_name, skill_category || 'General', skill_level, studentId, skill_level]
        );
        res.json({ success: true, message: 'Skill assigned to student!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- CERTIFICATIONS ENDPOINTS ---
app.get('/api/certifications', async (req, res) => {
    try {
        const [rows] = await promisePool.query('SELECT DISTINCT Certification_Name as cert_name, Issuing_Organization as issuing_organization FROM Certification');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/students/:id/certifications', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await promisePool.query(`
            SELECT Certification_Name as cert_name, Issuing_Organization as issuing_organization
            FROM Certification 
            WHERE Student_ID = ?
        `, [id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/students/:id/certifications', async (req, res) => {
    const studentId = req.params.id;
    let { cert_name, issuing_organization } = req.body;

    try {
        const [[{ maxId }]] = await promisePool.query('SELECT MAX(Certification_ID) as maxId FROM Certification');
        const nextId = (maxId || 0) + 1;

        await promisePool.query(
            'INSERT INTO Certification (Certification_ID, Student_ID, Certification_Name, Issuing_Organization) VALUES (?, ?, ?, ?)',
            [nextId, studentId, cert_name, issuing_organization || 'Unknown']
        );

        res.json({ success: true, message: 'Certification assigned to student!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- COMPLIANCE REPORT ENDPOINT ---
app.get('/api/students/:id/compliance', async (req, res) => {
    const { id } = req.params;
    res.json({ success: false, message: 'No compliance report found' });
});

// --- INTERNSHIPS ENDPOINT ---
app.post('/api/students/:id/internships', async (req, res) => {
    const studentId = req.params.id;
    let { organization_name, duration, end_date } = req.body;

    const connection = await promisePool.getConnection(); // start transaction

    try {
        await connection.beginTransaction();

        // Step 1: Insert Internship
        await connection.query(
            `INSERT INTO Internship 
            (Organization_Name, Duration, Expiry_Date, Verification_Status, Academic_Status, Student_ID) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [organization_name, duration, end_date || null, 'Pending', 'Active', studentId]
        );

        // Step 2: Update Student Academic Status (REPLACES TRIGGER)
        await connection.query(
            `UPDATE Student 
             SET Academic_Status = 'Industry Engaged' 
             WHERE Student_ID = ?`,
            [studentId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Internship added & academic status updated successfully!'
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

app.post('/api/students/:id/compliance', async (req, res) => {
    const { id } = req.params;
    try {
        const [[{ count: skillCount }]] = await promisePool.query('SELECT COUNT(*) as count FROM Skill WHERE Student_ID = ?', [id]);
        const [[{ count: certCount }]] = await promisePool.query('SELECT COUNT(*) as count FROM Certification WHERE Student_ID = ?', [id]);
        const [[{ count: internCount }]] = await promisePool.query('SELECT COUNT(*) as count FROM Internship WHERE Student_ID = ?', [id]);

        // Scoring Logic:
        const skillScore = Math.min((skillCount / 5) * 100, 100);
        const certScore = Math.min((certCount / 2) * 100, 100);
        const internScore = Math.min((internCount / 1) * 100, 100);

        const totalScore = (skillScore * 0.3) + (certScore * 0.4) + (internScore * 0.3);

        const [[{ maxId }]] = await promisePool.query('SELECT MAX(Report_ID) as maxId FROM ComplianceReport');
        const nextId = (maxId || 0) + 1;

        await promisePool.query(
            'INSERT INTO ComplianceReport (Report_ID, Skill_Type, Generated_Date, Generated_By, Generated_Reference) VALUES (?, ?, CURDATE(), ?, ?)',
            [nextId, 'Overall Compliance', 'System', `STU-${id}`]
        );

        res.json({
            success: true,
            score: totalScore.toFixed(2),
            breakdown: {
                skills: (skillScore * 0.3).toFixed(2),
                certs: (certScore * 0.4).toFixed(2),
                internships: (internScore * 0.3).toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;