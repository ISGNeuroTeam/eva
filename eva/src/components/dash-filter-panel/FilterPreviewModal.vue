<template>
  <v-card :style="{ 'background-color': theme.$secondary_bg }">
    <v-card-title
      :style="{ color: theme.$title, 'background-color': theme.$main_bg }"
    >
      <v-icon
        :color="theme.$title"
        class="pr-2"
      >
        {{ eyeIcon }}
      </v-icon>Предпросмотр
    </v-card-title>
    <v-card-text :style="{ 'background-color': theme.$secondary_bg }">
      <div
        v-if="filterOtlText !== ''"
        :style="{
          'background-color': theme.$main_bg,
          'margin-top': '20px',
          color: theme.$main_text,
        }"
      >
        {{ filterOtlText }}
      </div>
      <div
        v-else
        :style="{
          'margin-top': '20px',
          color: theme.$main_text,
        }"
      >
        <div class="subtitle-1">
          Фильтр пуст
        </div>
      </div>
    </v-card-text>
    <div class="d-flex justify-end">
      <v-btn
        style="text-transform: none"
        :color="theme.$primary_button"
        :style="{ color: theme.$secondary_bg }"
        class="ma-2"
        @click="$emit('closeFilterPreviewModal')"
      >
        Хорошо
      </v-btn>
    </div>
  </v-card>
</template>
<script>
import { mdiEyeOutline } from '@mdi/js';
import { filterCompile } from './utils/filter-otl-compile';

export default {
  name: 'FilterPreviewModal',
  props: {
    filter: Object,
  },
  data() {
    return {
      eyeIcon: mdiEyeOutline,
      filterOtlText: '',
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    filter: {
      immediate: true,
      handler(filter) {
        if (filter) this.filterOtlText = filterCompile(filter);
      },
    },
  },
};
</script>
