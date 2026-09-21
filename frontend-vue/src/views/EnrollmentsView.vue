<script setup>
import { ref } from 'vue'

const enrollmentStudentId = ref('')
const enrollmentCourseId = ref('')

const viewCourseId = ref('')
const enrolledStudents = ref([])

const enrollmentMessage = ref('')
const enrollmentError = ref('')

const removeMessage = ref('')
const removeError = ref('')

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
      enrollmentError.value = data.error || 'Unable to load students'
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
      removeError.value = data.error || 'Unable to remove student'
      return
    }

    removeMessage.value = data.message

    await loadEnrolledStudents()
  } catch (error) {
    removeError.value = 'Unable to connect to the server'
  }
}
</script>

<template>
  <div>
    <h2>Enrollment Management</h2>
    <p>Enroll students and view students enrolled in a course.</p>

    <!-- Enroll Student -->
    <div class="form-card">
      <h3>Enroll Student</h3>

      <form @submit.prevent="enrollStudent">
        <div class="form-group">
          <label>Student ID</label>
          <input
            v-model="enrollmentStudentId"
            type="text"
            placeholder="Enter student ID"
            required
          />
        </div>

        <div class="form-group">
          <label>Course ID</label>
          <input
            v-model="enrollmentCourseId"
            type="text"
            placeholder="Enter course ID"
            required
          />
        </div>

        <button class="primary-button" type="submit">
          Enroll Student
        </button>
      </form>

      <p v-if="enrollmentMessage" class="success-message">
        {{ enrollmentMessage }}
      </p>

      <p v-if="enrollmentError" class="error-message">
        {{ enrollmentError }}
      </p>
    </div>

    <!-- View Students by Course -->
    <div class="form-card">
      <h3>View Students by Course</h3>

      <div class="form-group">
        <label>Course ID</label>
        <input
          v-model="viewCourseId"
          type="text"
          placeholder="Example: CIS 3339"
        />
      </div>

      <button
        class="primary-button"
        type="button"
        @click="loadEnrolledStudents"
      >
        Load Students
      </button>

      <p v-if="removeMessage" class="success-message">
        {{ removeMessage }}
      </p>

      <p v-if="removeError" class="error-message">
        {{ removeError }}
      </p>

      <div
        v-for="student in enrolledStudents"
        :key="student._id"
        class="student-result"
      >
        <p><strong>Name:</strong> {{ student.name }}</p>
        <p><strong>Student ID:</strong> {{ student.studentId }}</p>
        <p><strong>Phone:</strong> {{ student.phone }}</p>
        <p><strong>ZIP Code:</strong> {{ student.zip }}</p>

        <button
          class="delete-button"
          type="button"
          @click="removeEnrollment(student.studentId)"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</template>