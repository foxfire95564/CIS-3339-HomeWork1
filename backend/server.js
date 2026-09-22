const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend-vue/dist');
app.use(express.static(frontendPath));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });



// Endpoint to search for a student by name
app.post('/find-student', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({
                error: 'Student name is required'
            });
        }

        const student = await Student.findOne({ name: name });

        if (!student) {
            return res.status(404).send({
                error: 'Student not found'
            });
        }

        res.send(student);
    } catch (error) {
        console.error('Error finding student:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ studentId: 1 });
        res.send(students);
    } catch (error) {
        console.error('Error loading students:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to save a student
app.post('/add-student', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body;

        if (!name || !id || !phone || !zip) {
            return res.status(400).send({
                error: 'All fields (name, id, phone, zip) are required'
            });
        }

        const newStudent = new Student({
            name,
            studentId: id,
            phone,
            zip
        });

        await newStudent.save();

        res.status(201).send({
            message: 'Student added successfully',
            student: newStudent
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).send({
                error: 'Student ID already exists'
            });
        }

        console.error('Error adding student:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to delete a student by name
app.post('/delete-student', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).send({
                error: 'Student name is required'
            });
        }

        const deletedStudent = await Student.findOneAndDelete({ name: name });

        if (!deletedStudent) {
            return res.status(404).send({
                error: 'Student not found'
            });
        }

        // Delete all enrollments associated with this student
        await Enrollment.deleteMany({
            student: deletedStudent._id
        });

        res.send({
            message: 'Student deleted successfully',
            student: deletedStudent
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to add a course
app.post('/add-course', async (req, res) => {
    try {
        const { courseId, courseName } = req.body;

        if (!courseId || !courseName) {
            return res.status(400).send({
                error: 'Course ID and course name are required'
            });
        }

        const newCourse = new Course({
            courseId,
            courseName
        });

        await newCourse.save();

        res.status(201).send({
            message: 'Course added successfully',
            course: newCourse
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).send({
                error: 'Course ID already exists'
            });
        }

        console.error('Error adding course:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to list all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ courseId: 1 });
        res.send(courses);
    } catch (error) {
        console.error('Error retrieving courses:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to delete a course
app.delete('/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;

        const deletedCourse = await Course.findOneAndDelete({ courseId });

        if (!deletedCourse) {
            return res.status(404).send({
                error: 'Course not found'
            });
        }

        // Delete all enrollments associated with this course
        await Enrollment.deleteMany({
            course: deletedCourse._id
        });

        res.send({
            message: 'Course deleted successfully',
            course: deletedCourse
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to enroll a student in a course
app.post('/enrollments', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).send({
                error: 'Student ID and course ID are required'
            });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).send({
                error: 'Student not found'
            });
        }

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).send({
                error: 'Course not found'
            });
        }

        const enrollment = new Enrollment({
            student: student._id,
            course: course._id
        });

        await enrollment.save();

        res.status(201).send({
            message: 'Student enrolled successfully',
            enrollment
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).send({
                error: 'Student is already enrolled in this course'
            });
        }

        console.error('Error creating enrollment:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to list students enrolled in a course
app.get('/enrollments/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findOne({ courseId });

        if (!course) {
            return res.status(404).send({
                error: 'Course not found'
            });
        }

        const enrollments = await Enrollment.find({
            course: course._id
        }).populate('student');

        const students = enrollments.map((enrollment) => enrollment.student);

        res.send(students);
    } catch (error) {
        console.error('Error retrieving enrollments:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Endpoint to remove a student from a course
app.delete('/enrollments', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).send({
                error: 'Student ID and course ID are required'
            });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).send({
                error: 'Student not found'
            });
        }

        const course = await Course.findOne({ courseId });
        if (!course) {
            return res.status(404).send({
                error: 'Course not found'
            });
        }

        const deletedEnrollment = await Enrollment.findOneAndDelete({
            student: student._id,
            course: course._id
        });

        if (!deletedEnrollment) {
            return res.status(404).send({
                error: 'Student is not enrolled in this course'
            });
        }

        res.send({
            message: 'Student removed from course successfully'
        });
    } catch (error) {
        console.error('Error removing enrollment:', error);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

// Serve the Vue application for client-side routes
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
