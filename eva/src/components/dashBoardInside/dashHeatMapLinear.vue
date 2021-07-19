<template>
  <v-progress-linear :value="value" color="amber" height="25" />
</template>

<script>
export default {
  props: {
    value: Number,
  },
};
</script>

<style>
</style>