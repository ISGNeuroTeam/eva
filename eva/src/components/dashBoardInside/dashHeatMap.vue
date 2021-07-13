<template>
  <div class="heatmap-header">
    <!-- <v-select></v-select> -->
  </div>
</template>

<script>
export default {
  props: {
    idFrom: {
      type: String,
      default: '',
    },
    idDashFrom: {
      type: String,
      default: '',
    },
    widthFrom: {
      type: Number,
      default: 0,
    },
    heightFrom: {
      type: Number,
      default: 0,
    },
    colorFrom: {
      type: Object,
      default: () => ({}),
    },
    dataRestFrom: {
      type: Array,
      default: () => [],
    },
    dataReport: null,
    dataLoadingFrom: null,
  },
  data: () => ({
    test: '123qwerty'
  }),
  mounted () {

  },
  methods: {

  },
};
</script>

<style scoped>
.heatmap-header {
  background-color: red;
}
</style>
