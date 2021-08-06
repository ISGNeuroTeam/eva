<template>
  <v-progress-linear
    class="progress-bar-linear"
    :color="color"
    :height="height"
    :value="calculatedValue"
    :background-color="backColor"
    :style="{ width: `${width}px` }"
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
        <strong v-on="on" v-text="title"/>
      </template>
      <span :style="{ color }" v-text="comment"/>
    </v-tooltip>
    <strong v-else v-text="title"/>
  </v-progress-linear>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    title: {
      type: [String, Number],
      default: '',
    },
    color: {
      type: String,
      default: '#03a9f4',
    },
    width: {
      type: Number,
      default: 50,
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
      let { value } = this;
      if (value <= 0) value = 0;
      if (value >= 100) value = 100;
      return Math.round(value);
    },
  }
};
</script>

<style lang="sass" scoped>
.progress-bar-linear
  min-width: 50px
  border-radius: 5px
</style>
