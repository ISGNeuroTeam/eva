<template>
  <v-card :style="{ 'background-color': theme.$secondary_bg }">
    <v-card-title :style="{ color: theme.$title, 'background-color': theme.$main_bg }">
      <v-icon :color="theme.$title" class="pr-2">{{ eyeIcon }}</v-icon
      >Предпросмотр
    </v-card-title>
    <v-card-text :style="{ 'background-color': theme.$secondary_bg }">
      <div :style="{ 'background-color': theme.$main_bg, 'margin-top': '20px' }">
        {{ filterOtlText }}
      </div>
    </v-card-text>
    <div class="d-flex justify-end">
      <v-btn
        style="text-transform: none"
        :color="theme.$primary_button"
        :style="{ color: theme.$secondary_bg }"
        @click="$emit('closeFilterPreviewModal')"
        class="ma-2"
        >Хорошо</v-btn
      >
    </div>
  </v-card>
</template>
<script>
  import { filterCompile } from './utils/filter-otl-compile';
  import { mdiEyeOutline } from '@mdi/js';

  export default {
    name: 'FilterPreviewModal',
    props: ['filter'],
    data() {
      return {
        eyeIcon: mdiEyeOutline,
        filterOtlText: '',
      };
    },
    watch: {
      filter() {
        if (this.filter) this.filterOtlText = filterCompile(this.filter);
      },
    },
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
    },
  };
</script>
