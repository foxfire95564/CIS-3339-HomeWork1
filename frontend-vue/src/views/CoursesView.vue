<script setup>
import { ref } from 'vue'

const courseId = ref('')
const courseName = ref('')
const courses = ref([])

const courseMessage = ref('')
const courseError = ref('')

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

async function deleteCourse(courseId) {
  courseMessage.value = ''
  courseError.value = ''

  try {
    const response = await fetch(
      `http://localhost:3000/courses/${encodeURIComponent(courseId)}`,
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

</script>

<template>
  <section>
    <h2>Course Management</h2>
    <p>Add, view, and delete courses.</p>

    <div class="form-card">
      <h3>Add Course</h3>

      <form @submit.prevent="addCourse">
        <div class="form-group">
          <label>Course ID</label>
          <input
            v-model="courseId"
            type="text"
            placeholder="Enter course ID"
            required
          />
        </div>

        <div class="form-group">
          <label>Course Name</label>
          <input
            v-model="courseName"
            type="text"
            placeholder="Enter course name"
            required
          />
        </div>

        <button class="primary-button" type="submit">
          Add Course
        </button>
      </form>

      <p v-if="courseMessage" class="success-message">
        {{ courseMessage }}
      </p>

      <p v-if="courseError" class="error-message">
        {{ courseError }}
      </p>
    </div>

    <div class="form-card">
      <h3>Courses</h3>

      <button
        class="primary-button"
        type="button"
        @click="loadCourses"
      >
        Load Courses
      </button>

      <p v-if="courses.length === 0" class="empty-message">
        No courses loaded.
      </p>

      <div
        v-for="course in courses"
        :key="course._id"
        class="course-item"
      >
        <div>
          <strong>{{ course.courseId }}</strong>
          <p>{{ course.courseName }}</p>
        </div>

        <button
          class="delete-button"
          type="button"
          @click="deleteCourse(course.courseId)"
        >
          Delete
        </button>
      </div>
    </div>
  </section>
</template>