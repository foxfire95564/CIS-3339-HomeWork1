<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const currentPage = ref('students')

// Student form
const studentName = ref('')
const studentId = ref('')
const studentPhone = ref('')
const studentZip = ref('')

// Student search
const searchName = ref('')
const foundStudent = ref(null)

// Messages
const studentMessage = ref('')
const studentError = ref('')

// Course form
const courseId = ref('')
const courseName = ref('')

// Course list
const courses = ref([])

// Course messages
const courseMessage = ref('')
const courseError = ref('')

// Enrollment form
const enrollmentStudentId = ref('')
const enrollmentCourseId = ref('')
const viewCourseId = ref('')

// Enrollment search results
const enrolledStudents = ref([])

// Enrollment messages
const enrollmentMessage = ref('')
const enrollmentError = ref('')
const removeMessage = ref('')
const removeError = ref('')

async function addStudent() {
  studentMessage.value = ''
  studentError.value = ''

  try {
    const response = await fetch('http://localhost:3000/add-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: studentName.value,
        id: studentId.value,
        phone: studentPhone.value,
        zip: studentZip.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      studentError.value = data.error || 'Unable to add student'
      return
    }

    studentMessage.value = data.message

    studentName.value = ''
    studentId.value = ''
    studentPhone.value = ''
    studentZip.value = ''
  } catch (error) {
    studentError.value = 'Unable to connect to the server'
  }
}

async function findStudent() {
  studentMessage.value = ''
  studentError.value = ''
  foundStudent.value = null

  if (!searchName.value) {
    studentError.value = 'Please enter a student name'
    return
  }

  try {
    const response = await fetch('http://localhost:3000/find-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: searchName.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      studentError.value = data.error || 'Student not found'
      return
    }

    foundStudent.value = data
  } catch (error) {
    studentError.value = 'Unable to connect to the server'
  }
}

async function deleteStudent() {
  studentMessage.value = ''
  studentError.value = ''

  if (!searchName.value) {
    studentError.value = 'Please enter a student name'
    return
  }

  try {
    const response = await fetch('http://localhost:3000/delete-student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: searchName.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      studentError.value = data.error || 'Unable to delete student'
      return
    }

    studentMessage.value = data.message
    foundStudent.value = null
    searchName.value = ''
  } catch (error) {
    studentError.value = 'Unable to connect to the server'
  }
}

async function addCourse() {
  courseMessage.value = ''
  courseError.value = ''

  try {
    const response = await fetch('http://localhost:3000/add-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseId: courseId.value,
        courseName: courseName.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      courseError.value = data.error || 'Unable to add course'
      return
    }

    courseMessage.value = data.message

    courseId.value = ''
    courseName.value = ''

    await loadCourses()
  } catch (error) {
    courseError.value = 'Unable to connect to the server'
  }
}

async function loadCourses() {
  courseError.value = ''

  try {
    const response = await fetch('http://localhost:3000/courses')

    const data = await response.json()

    if (!response.ok) {
      courseError.value = data.error || 'Unable to load courses'
      return
    }

    courses.value = data
  } catch (error) {
    courseError.value = 'Unable to connect to the server'
  }
}

async function deleteCourse(id) {
  courseMessage.value = ''
  courseError.value = ''

  try {
    const response = await fetch(
      `http://localhost:3000/courses/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    )

    const data = await response.json()

    if (!response.ok) {
      courseError.value = data.error || 'Unable to delete course'
      return
    }

    courseMessage.value = data.message

    await loadCourses()
  } catch (error) {
    courseError.value = 'Unable to connect to the server'
  }
}

async function enrollStudent() {
  enrollmentMessage.value = ''
  enrollmentError.value = ''

  try {
    const response = await fetch('http://localhost:3000/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId: enrollmentStudentId.value,
        courseId: enrollmentCourseId.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      enrollmentError.value = data.error || 'Unable to enroll student'
      return
    }

    enrollmentMessage.value = data.message

    enrollmentStudentId.value = ''
    enrollmentCourseId.value = ''
  } catch (error) {
    enrollmentError.value = 'Unable to connect to the server'
  }
}

async function loadEnrolledStudents() {
  enrollmentMessage.value = ''
  enrollmentError.value = ''
  enrolledStudents.value = []

  if (!viewCourseId.value) {
    enrollmentError.value = 'Please enter a course ID'
    return
}

  try {
    const response = await fetch(
      `http://localhost:3000/enrollments/course/${encodeURIComponent(viewCourseId.value)}`
    )

    const data = await response.json()

    if (!response.ok) {
      enrollmentError.value =
        data.error || 'Unable to load enrolled students'
      return
    }

    enrolledStudents.value = data
  } catch (error) {
    enrollmentError.value = 'Unable to connect to the server'
  }
}

async function removeEnrollment(studentId) {
  removeMessage.value = ''
  removeError.value = ''

  try {
    const response = await fetch('http://localhost:3000/enrollments', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId: studentId,
        courseId: viewCourseId.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      removeError.value =
        data.error || 'Unable to remove student from course'
      return
    }

    await loadEnrolledStudents()

    removeMessage.value = data.message

  } catch (error) {
    removeError.value = 'Unable to connect to the server'
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Student Course Management</h1>
      <p>CIS 3339 - Enterprise Applications Development</p>
    </header>

    <nav class="navbar">
      <RouterLink to="/">Students</RouterLink>
      <RouterLink to="/courses">Courses</RouterLink>
      <RouterLink to="/enrollments">Enrollments</RouterLink>
    </nav>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: Arial, sans-serif;
}

.header {
  background-color: #1f3a5f;
  color: white;
  padding: 25px 40px;
}

.header h1 {
  margin: 0;
}

.header p {
  margin: 8px 0 0;
}

.navbar {
  background-color: white;
  padding: 0 40px;
  border-bottom: 1px solid #ddd;
}

.navbar a {
  display: inline-block;
  padding: 16px 22px;
  color: black;
  text-decoration: none;
  font-size: 16px;
}

.navbar a:hover {
  background-color: #f0f0f0;
}

.navbar a.router-link-active {
  color: #1f3a5f;
  font-weight: bold;
  border-bottom: 3px solid #1f3a5f;
}

.content {
  max-width: 1000px;
  margin: 30px auto;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
}

.form-card {
  margin-top: 25px;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
}

.form-card h3 {
  margin-top: 0;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #bbb;
  border-radius: 4px;
  font-size: 15px;
}

.primary-button {
  padding: 10px 18px;
  border: none;
  border-radius: 4px;
  background-color: #1f3a5f;
  color: white;
  cursor: pointer;
  font-size: 15px;
}

.primary-button:hover {
  opacity: 0.9;
}

.success-message {
  margin-top: 15px;
  color: green;
  font-weight: bold;
}

.error-message {
  margin-top: 15px;
  color: #b00020;
  font-weight: bold;
}

.delete-button {
  margin-left: 10px;
  padding: 10px 18px;
  border: none;
  border-radius: 4px;
  background-color: #a61b1b;
  color: white;
  cursor: pointer;
  font-size: 15px;
}

.delete-button:hover {
  opacity: 0.9;
}

.student-result {
  margin-top: 25px;
  padding: 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.student-result h3 {
  margin-top: 0;
}

.student-result p {
  margin: 8px 0;
}

.course-item {
  margin-top: 15px;
  padding: 15px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-item p {
  margin: 5px 0 0 0;
}

.empty-message {
  margin-top: 15px;
  color: #666;
}
</style>