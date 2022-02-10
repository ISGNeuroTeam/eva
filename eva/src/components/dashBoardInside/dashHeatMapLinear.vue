<template>
  <v-progress-linear
    v-if="value !== null"
    class="progress-bar-linear"
    background-color="#dadada"
    :height="50"
    :color="calculatedColor"
    :value="calculatedValue"
  >
    <span
      v-if="!comment"
      class="title-text"
      v-text="title"
    />
    <v-tooltip
      v-else
      bottom
      nudge-top="15"
      content-class="elevation-2"
      transition="fade-transition"
      :color="theme.$secondary_bg"
    >
      <template v-slot:activator="{ on }">
        <span
          class="title-text"
          v-on="on"
          v-text="title"
        />
      </template>
      <span
        :style="{ color: calculatedColor }"
        v-text="comment"
      />
    </v-tooltip>
  </v-progress-linear>
  <div
    v-else
    class="empty-value"
  >
    <span
      v-if="!comment"
      class="title-text"
      v-text="title"
    />
    <v-tooltip
      v-else
      bottom
      nudge-top="15"
      content-class="elevation-2"
      transition="fade-transition"
      :color="theme.$secondary_bg"
    >
      <template v-slot:activator="{ on }">
        <span
          v-on="on"
          v-text="title"
        />
      </template>
      <span
        :style="{ color: calculatedColor }"
        v-text="comment"
      />
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: [String, Number], default: '' },
    value: { type: Number, default: null },
    color: { type: String, default: '' },
    comment: { type: String, default: '' },
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },

    calculatedColor() {
      return !this.color ? this.theme.$accent_ui_color : this.color;
    },

    calculatedValue() {
      const value = this.value <= 0 ? 0 : this.value;
      return Math.round(value >= 100 ? 100 : value);
    },
  },
};
</script>

<style lang="sass" scoped>
.progress-bar-linear
  min-width: 200px
  border-radius: 6px

  .title-text
    color: #060606
    font-weight: 600
.empty-value
  height: 50px
  display: flex
  justify-content: center
  align-items: center
</style>
