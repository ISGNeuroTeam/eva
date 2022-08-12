<template>
  <v-row class="align-center">
    <v-col
      v-if="selectLabel"
      :cols="cols"
    >
      <v-select
        v-model="selectValue"
        :items="compare"
        :label="selectLabel"
        @change="changes(title, $event, 'compare')"
      />
    </v-col>
    <v-col
      v-if="textLabel"
      :cols="cols"
    >
      <v-text-field
        v-model="textValue"
        :label="textLabel"
        @change="changes(title, $event, '')"
      />
    </v-col>
    <v-col cols="2">
      <v-tooltip
        bottom
        :color="theme.$accent_ui_color"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            large
            v-bind="attrs"
            class="icon"
            :color="theme.$main_border"
            small
            v-on="on"
            @click="reset(); changes(title, '', '')"
          >
            {{ mdiClose }}
          </v-icon>
        </template>
        <span>Сбросить</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
import { mdiClose } from '@mdi/js';

export default {
  name: 'DashTableFilter',
  props: {
    compare: {
      type: Array,
      default: () => ([]),
    },
    selectLabel: {
      type: String,
      default: '',
    },
    textLabel: {
      type: String,
      default: '',
    },
    title: {
      type: String || Number,
      default: '' || 0,
    },
    cols: {
      type: Number,
      default: 12,
    },
  },
  data() {
    return {
      mdiClose,
      selectValue: '',
      textValue: '',
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    changes(title, event, comp) {
      this.$emit('changes', { title, event, comp });
    },
    reset() {
      this.selectValue = '';
      this.textValue = '';
    },
  },
};
</script>

<style scoped>

</style>
