<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success'
  }
})
</script>

<template>
  <p
    v-if="message"
    :class="type === 'error' ? 'error-message' : 'success-message'"
  >
    {{ message }}
  </p>
</template>