<script setup>
import { ref } from 'vue'
import StatusMessage from '@/components/StatusMessage.vue'

// Student form
const studentName = ref('')
const studentId = ref('')
const studentPhone = ref('')
const studentZip = ref('')

// Student search
const searchName = ref('')
const foundStudent = ref(null)

// Student messages
const studentMessage = ref('')
const studentError = ref('')
const isLoading = ref(false)

async function addStudent() {
  studentMessage.value = ''
  studentError.value = ''
  isLoading.value = true

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
  } finally {
    isLoading.value = false
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

  isLoading.value = true

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
  } finally {
    isLoading.value = false
  }
}

async function deleteStudent() {
  studentMessage.value = ''
  studentError.value = ''
  foundStudent.value = null

  if (!searchName.value) {
    studentError.value = 'Please enter a student name'
    return
  }

  isLoading.value = true

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
    searchName.value = ''
  } catch (error) {
    studentError.value = 'Unable to connect to the server'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section>
    <h2>Student Management</h2>
    <p>Add, find, and delete students.</p>

    <div class="form-card">
      <h3>Add Student</h3>

      <form @submit.prevent="addStudent">
        <div class="form-group">
          <label for="student-name">Name</label>
          <input
            id="student-name"
            v-model="studentName"
            type="text"
            placeholder="Enter student name"
            required
          />
        </div>

        <div class="form-group">
          <label for="student-id">Student ID</label>
          <input
            id="student-id"
            v-model="studentId"
            type="text"
            placeholder="Enter student ID"
            required
          />
        </div>

        <div class="form-group">
          <label for="student-phone">Phone</label>
          <input
            id="student-phone"
            v-model="studentPhone"
            type="text"
            placeholder="Enter phone number"
            required
          />
        </div>

        <div class="form-group">
          <label for="student-zip">ZIP Code</label>
          <input
            id="student-zip"
            v-model="studentZip"
            type="text"
            placeholder="Enter ZIP code"
            required
          />
        </div>

        <button
          class="primary-button"
          type="submit"
          :disabled="isLoading"
        >
          Add Student
        </button>
      </form>

      <p v-if="isLoading" class="empty-message">
        Processing...
      </p>

      <StatusMessage :message="studentMessage" />
      <StatusMessage :message="studentError" type="error" />
    </div>

    <div class="form-card">
      <h3>Find / Delete Student</h3>

      <div class="form-group">
        <label for="search-student-name">Student Name</label>
        <input
          id="search-student-name"
          v-model="searchName"
          type="text"
          placeholder="Enter student name"
        />
      </div>

      <button
        class="primary-button"
        type="button"
        :disabled="isLoading"
        @click="findStudent"
      >
        Find Student
      </button>

      <button
        class="delete-button"
        type="button"
        :disabled="isLoading"
        @click="deleteStudent"
      >
        Delete Student
      </button>

      <div v-if="foundStudent" class="student-result">
        <h3>Student Information</h3>

        <p><strong>Name:</strong> {{ foundStudent.name }}</p>
        <p><strong>Student ID:</strong> {{ foundStudent.studentId }}</p>
        <p><strong>Phone:</strong> {{ foundStudent.phone }}</p>
        <p><strong>ZIP Code:</strong> {{ foundStudent.zip }}</p>
      </div>
    </div>
  </section>
</template>