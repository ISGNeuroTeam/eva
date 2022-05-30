<template>
  <div class="arrow-block">
    <v-icon
      v-if="!state"
      class="arrow-down arrows-select"
      :color="theme.$primary_button"
      @click="$emit('toggle')"
    >
      {{ downIcon }}
    </v-icon>
    <v-icon
      v-if="state"
      class="arrow-up arrows-select"
      :color="theme.$main_text"
      @click="$emit('toggle')"
    >
      {{ upIcon }}
    </v-icon>
  </div>
</template>

<script>
import {
  mdiArrowDownBoldBoxOutline, mdiArrowUpBoldBoxOutline,
} from '@mdi/js';

export default {
  name: 'ArrowBlock',
  props: {
    state: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    downIcon: mdiArrowDownBoldBoxOutline,
    upIcon: mdiArrowUpBoldBoxOutline,
  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
};
</script>

<style lang="scss" scoped>
   .arrow-block {
    margin-right: 10px;
  }
</style>
