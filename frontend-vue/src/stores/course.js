import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCourseStore = defineStore('course', () => {
  const courses = ref([])

  async function loadCourses() {
    const response = await fetch('http://localhost:3000/api/courses')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load courses')
    }

    courses.value = data
  }

  return {
    courses,
    loadCourses
  }
})