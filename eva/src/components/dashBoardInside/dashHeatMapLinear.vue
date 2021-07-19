<template>
  <v-progress-linear
    :value="calculatedValue"
    :color="calculatedColor"
    :background-color="backColor"
    height="30"
  >
    <strong>{{ calculatedValue }}%</strong>
  </v-progress-linear>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    }
  },
  data: () => ({
    color: 'green',
    backColor: '#dadada',
  }),
  computed: {
    calculatedValue() {
      return this.value < 0 ? 0 : Math.round(this.value);
    },

    calculatedColor() {
      // yellow
      let color = '#ffe26c';
      // green
      if (this.calculatedValue > 50) color = '#7ae072';
      // red
      if (this.calculatedValue > 100) color = '#ea564e';
      return color;
    },
  }
};
</script>
