<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          small
          text
          v-bind="attrs"
          v-on="on"
        >
          <v-icon
            :style="{ color: theme.$main_text }"
            class="download-icon"
          >
            {{
              mdiFileOutline
            }}
          </v-icon>
          <span
            class="download-btn-text"
            :style="{ color: theme.$main_text }"
          >
            Отчет
          </span>
        </v-btn>
      </template>
      <v-card class="report-card">
        <v-card-title
          class="card-title"
          :style="{ background: theme.$main_bg, color: theme.$main_text }"
        >
          <div>
            <v-icon
              :style="{ color: theme.$main_text }"
              class="download-icon"
            >
              {{ mdiFileOutline }}
            </v-icon>
            Отчет
          </div>
          <div>
            <v-btn
              icon
              :color="theme.$main_text"
              @click="dialog = false"
            >
              <v-icon>{{ mdiClose }}</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text
          class="card-text"
          :style="{ background: theme.$secondary_bg, color: theme.$main_text }"
        >
          В результате поиска найдено событий -
          <span class="card-text-value">{{ length }}</span>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mdiFileOutline, mdiClose } from '@mdi/js';

export default {
  props: {
    length: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      mdiFileOutline,
      mdiClose,
      dialog: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {},
};
</script>

<style lang="sass">
.download-icon
  margin-right: 5px
.report-card
  border-radius: 12px !important
  .card-title
    padding: 10px 16px 10px 16px !important
    display: flex
    justify-content: space-between
  .card-text
    padding: 14px 16px 14px 16px !important
    .card-text-value
      font-weight: bold
</style>
