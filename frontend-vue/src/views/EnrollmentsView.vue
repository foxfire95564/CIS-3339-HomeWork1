<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCourseStore } from '@/stores/course'
import StatusMessage from '@/components/StatusMessage.vue'

const enrollmentStudentId = ref('')
const enrollmentCourseId = ref('')

const students = ref([])

const courseStore = useCourseStore()
const { courses } = storeToRefs(courseStore)

const viewCourseId = ref('')
const enrolledStudents = ref([])

const enrollmentMessage = ref('')
const enrollmentError = ref('')

const removeMessage = ref('')
const removeError = ref('')

const isLoadingOptions = ref(false)
const isLoadingRoster = ref(false)
const isSubmitting = ref(false)

async function loadStudents() {
  try {
    const response = await fetch('http://localhost:3000/api/students')
    const data = await response.json()

    if (!response.ok) {
      enrollmentError.value = data.error || 'Unable to load students'
      return
    }

    students.value = data
  } catch (error) {
    enrollmentError.value = 'Unable to connect to the server'
  }
}

onMounted(async () => {
  isLoadingOptions.value = true

  try {
    await courseStore.loadCourses()
    await loadStudents()
  } catch (error) {
    enrollmentError.value = error.message
  } finally {
    isLoadingOptions.value = false
  }
})

async function enrollStudent() {
  enrollmentMessage.value = ''
  enrollmentError.value = ''
  isSubmitting.value = true

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
  } finally {
    isSubmitting.value = false
  }
}

async function loadEnrolledStudents() {
  enrollmentError.value = ''
  enrolledStudents.value = []

  if (!viewCourseId.value) {
    enrollmentError.value = 'Please select a course'
    return
  }

  isLoadingRoster.value = true

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
  } finally {
    isLoadingRoster.value = false
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

      <p v-if="isLoadingOptions" class="empty-message">
        Loading students and courses...
      </p>

      <form @submit.prevent="enrollStudent">
        <div class="form-group">
          <label for="enrollment-student">Student</label>
          <select
            id="enrollment-student"
            v-model="enrollmentStudentId"
            required
          >
            <option value="" disabled>Select a student</option>
            <option
              v-for="student in students"
              :key="student._id"
              :value="student.studentId"
            >
              {{ student.name }} - {{ student.studentId }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="enrollment-course">Course</label>
          <select
            id="enrollment-course"
            v-model="enrollmentCourseId"
            required
          >
            <option value="" disabled>Select a course</option>
            <option
              v-for="course in courses"
              :key="course._id"
              :value="course.courseId"
            >
              {{ course.courseId }} - {{ course.courseName }}
            </option>
          </select>
        </div>

        <button
          class="primary-button"
          type="submit"
          :disabled="isSubmitting || isLoadingOptions"
        >
          {{ isSubmitting ? 'Enrolling...' : 'Enroll Student' }}
        </button>
      </form>

      <p
        v-if="!isLoadingOptions && students.length === 0"
        class="empty-message"
      >
        No students available.
      </p>

      <p
        v-if="!isLoadingOptions && courses.length === 0"
        class="empty-message"
      >
        No courses available.
      </p>

      <StatusMessage :message="enrollmentMessage" />
      <StatusMessage :message="enrollmentError" type="error" />
    </div>

    <!-- View Students by Course -->
    <div class="form-card">
      <h3>View Students by Course</h3>

      <div class="form-group">
        <label for="view-course">Course</label>
        <select
          id="view-course"
          v-model="viewCourseId"
        >
          <option value="" disabled>Select a course</option>
          <option
            v-for="course in courses"
            :key="course._id"
            :value="course.courseId"
          >
            {{ course.courseId }} - {{ course.courseName }}
          </option>
        </select>
      </div>

      <button
        class="primary-button"
        type="button"
        :disabled="isLoadingRoster"
        @click="loadEnrolledStudents"
      >
        {{ isLoadingRoster ? 'Loading...' : 'Load Students' }}
      </button>

      <StatusMessage :message="removeMessage" />
      <StatusMessage :message="removeError" type="error" />

      <p
        v-if="
          viewCourseId &&
          !isLoadingRoster &&
          enrolledStudents.length === 0
        "
        class="empty-message"
      >
        No students are enrolled in this course.
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