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
              mdiDownload
            }}
          </v-icon>
          <span
            class="download-btn-text"
            :style="{ color: theme.$main_text }"
          >
            Скачать
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
          <template>
            <v-btn
              small
              text
              @click="exportDataxlsx()"
            >
              <v-icon
                :style="{ color: theme.$main_text }"
                class="download-icon"
              >
                {{ mdiDownload }}
              </v-icon>
              <span
                class="download-btn-text"
                :style="{ color: theme.$main_text }"
              >
                Скачать xlsx
              </span>
            </v-btn>
            <v-btn
              small
              text
              @click="exportDataCSV()"
            >
              <v-icon
                :style="{ color: theme.$main_text }"
                class="download-icon"
              >
                {{ mdiDownload }}
              </v-icon>
              <span
                class="download-btn-text"
                :style="{ color: theme.$main_text }"
              >
                Скачать CSV
              </span>
            </v-btn>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mdiDownload, mdiClose } from '@mdi/js';
import { utils, writeFileXLSX } from 'xlsx';

export default {
  props: {
    data: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      mdiDownload,
      mdiClose,
      dialog: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    exportDataCSV() {
      const searchData = this.data;
      // const searchData = this.dataObject[searchName].data
      let csvContent = 'data:text/csv;charset=utf-8,'; // задаем кодировку csv файла
      const keys = Object.keys(searchData[0]); // получаем ключи для заголовков столбцов
      csvContent += encodeURIComponent(`${keys.join(',')}\n`); // добавляем ключи в файл
      csvContent += encodeURIComponent(
        searchData.map((item) => Object.values(item).join(',')).join('\n'),
      );

      const link = document.createElement('a'); // создаем ссылку
      link.setAttribute('href', csvContent); // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', 'report.csv'); // указываем имя файла
      link.click(); // жмем на скачку
      link.remove(); // удаляем ссылку
    },
    exportDataxlsx() {
      const workSheet = utils.json_to_sheet(this.data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, workSheet, 'data');
      writeFileXLSX(wb, 'report.xlsx');
    },
  },
};
</script>

<style lang="scss"></style>
