USE schema_project;
CREATE TABLE Student (
    Student_ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Roll_Number VARCHAR(20), 
    Role_Domain VARCHAR(100),
    Mode VARCHAR(50),
    Mentor_Feedback TEXT,
    Academic_Status VARCHAR(50)
);

CREATE TABLE Faculty (
    Faculty_ID INT PRIMARY KEY,
    Name VARCHAR(100),
    Department VARCHAR(100),
    Assigned_Students TEXT  -- Could be normalized into a separate table
);

CREATE TABLE Certification (
Certification_ID INT PRIMARY KEY,
Student_ID INT,
Certification_Name VARCHAR(100),
Issuing_Organization VARCHAR(100),
FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID)
);

CREATE TABLE Skill (
    Skill_Name VARCHAR(100) PRIMARY KEY,
    Skill_Category VARCHAR(100),
    Skill_Level VARCHAR(50),
    Student_ID INT,
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID)
);

CREATE TABLE Internship (
    Organization_Name VARCHAR(200) PRIMARY KEY,
    Duration VARCHAR(100),
    Expiry_Date DATE,
    Verification_Status VARCHAR(50),
    Academic_Status VARCHAR(50),  
    Student_ID INT, 
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID)
);

CREATE TABLE IndustryPartner (
    Industry_ID INT PRIMARY KEY,
    Company_Name VARCHAR(200),
    Industry_Domain VARCHAR(100),
    Contact_Person VARCHAR(100),
    Collaboration_Type VARCHAR(100)
);

CREATE TABLE ComplianceReport (
    Report_ID INT PRIMARY KEY,
    Skill_Type VARCHAR(100),
    Generated_Date DATE,
    Generated_By VARCHAR(100),
    Generated_Reference VARCHAR(200)
);

INSERT INTO Student VALUES
(1, 'Aarav Sharma', 'RA101', 'AI/ML', 'Online', 'Good progress', 'Active'),
(2, 'Diya Patel', 'RA102', 'Web Dev', 'Offline', 'Needs improvement', 'Active'),
(3, 'Rohan Das', 'RA103', 'Data Science', 'Hybrid', 'Excellent', 'Internship Ongoing'),
(4, 'Sneha Iyer', 'RA104', 'Cyber Security', 'Online', 'Average', 'Active'),
(5, 'Karan Mehta', 'RA105', 'Cloud Computing', 'Offline', 'Very Good', 'Placed');

INSERT INTO Faculty VALUES
(101, 'Dr. Mehta', 'CSE', '1,2'),
(102, 'Dr. Rao', 'IT', '3'),
(103, 'Dr. Sharma', 'CSE', '4,5'),
(104, 'Dr. Iyer', 'AI', '1,3'),
(105, 'Dr. Das', 'Data Science', '2,4');

INSERT INTO Certification VALUES
(201, 1, 'Machine Learning', 'Coursera'),
(202, 2, 'Full Stack Development', 'Udemy'),
(203, 3, 'Data Analytics', 'Google'),
(204, 4, 'Ethical Hacking', 'EC-Council'),
(205, 5, 'AWS Cloud Practitioner', 'Amazon');

INSERT INTO Skill VALUES
('Python', 'Programming', 'Advanced', 1),
('JavaScript', 'Web', 'Intermediate', 2),
('SQL', 'Database', 'Advanced', 3),
('Networking', 'Security', 'Beginner', 4),
('AWS', 'Cloud', 'Intermediate', 5);

INSERT INTO Internship VALUES
('TCS', '3 Months', '2026-06-30', 'Verified', 'Internship Ongoing', 1),
('Infosys', '6 Months', '2026-08-15', 'Pending', 'Active', 2),
('Wipro', '2 Months', '2026-05-20', 'Verified', 'Completed', 3),
('HCL', '4 Months', '2026-07-10', 'Verified', 'Internship Ongoing', 4),
('Accenture', '5 Months', '2026-09-01', 'Pending', 'Active', 5);

INSERT INTO IndustryPartner VALUES
(301, 'TCS', 'IT Services', 'Mr. Raj', 'Internships'),
(302, 'Infosys', 'Consulting', 'Ms. Priya', 'Training'),
(303, 'Wipro', 'IT', 'Mr. Arjun', 'Projects'),
(304, 'HCL', 'Technology', 'Ms. Kavya', 'Research'),
(305, 'Accenture', 'Consulting', 'Mr. John', 'Placement');

INSERT INTO ComplianceReport VALUES
(401, 'Technical Skills', '2026-04-01', 'Admin', 'REF001'),
(402, 'Soft Skills', '2026-04-05', 'Admin', 'REF002'),
(403, 'Internship Status', '2026-04-10', 'System', 'REF003'),
(404, 'Certification Tracking', '2026-04-15', 'Admin', 'REF004'),
(405, 'Overall Performance', '2026-04-20', 'System', 'REF005');



