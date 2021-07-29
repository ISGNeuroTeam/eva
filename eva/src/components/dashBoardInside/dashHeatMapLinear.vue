<template>
  <v-progress-linear
    :value="calculatedValue"
    :color="calculatedColor"
    :background-color="backColor"
    :height="height"
  >
    <v-tooltip
      v-if="comment"
      bottom
      nudge-top="15"
      color="var(--secondary_bg)"
      content-class="elevation-2"
      transition="fade-transition"
    >
      <template v-slot:activator="{ on }">
        <strong
          v-on="on"
          v-text="calculatedValue + '%'"
        />
      </template>
      <span
        :style="{ color: calculatedColor }"
        v-text="comment"
      />
    </v-tooltip>
    <strong
      v-else
      v-text="calculatedValue + '%'"
    />
  </v-progress-linear>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 30,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  data: () => ({
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
