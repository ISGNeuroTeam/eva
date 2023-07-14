<template>
  <v-dialog
    v-model="downloadModal"
    width="350"
  >
    <v-card class="report-card">
      <v-card-title
        class="card-title justify-space-between"
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
            @click="downloadModal = false"
          >
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text
        class="card-text pt-4 d-flex justify-center"
        :style="{ background: theme.$secondary_bg, color: theme.$main_text }"
      >
        <template>
          <v-btn
            small
            text
            @click="exportDataXlsx"
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
            @click="exportDataCSV"
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
</template>

<script>
import { mdiFileOutline, mdiDownload, mdiClose } from '@mdi/js';
import { utils, writeFile } from 'xlsx';

export default {
  name: 'ModalDownload',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    dataObject: {
      type: Object,
      default: () => ({}),
    },
    searchId: {
      type: Number,
      default: 0,
    },
    modalValue: {
      type: Boolean,
      default: false,
    },
    idDash: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      mdiDownload,
      mdiFileOutline,
      mdiClose,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    downloadModal: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
  },
  methods: {
    exportDataCSV() {
      const searchData = this.dataObject[this.searchId].data;
      // задаем кодировку csv файла
      let csvContent = 'data:text/csv;charset=utf-8,';
      // получаем ключи для заголовков столбцов
      const keys = Object.keys(searchData[0]);
      // добавляем ключи в файл
      csvContent += encodeURIComponent(`${keys.join(',')}\n`);
      csvContent += encodeURIComponent(
        searchData.map((item) => Object.values(item).join(',')).join('\n'),
      );
      // создаем ссылку
      const link = document.createElement('a');
      // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('href', csvContent);
      // указываем имя файла
      link.setAttribute('download', `${this.idDash}-${this.searchId}.csv`);
      // жмем на скачку
      link.click();
      // удаляем ссылку
      link.remove();
      this.downloadModal = false;
    },
    exportDataXlsx() {
      const { data = [], schema = {} } = this.dataObject[this.searchId];
      const workSheet = utils.json_to_sheet(data, {
        header: Object.keys(schema),
      });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, workSheet, 'data');
      writeFile(wb, `${this.idDash}-${this.searchId}.xlsx`);
      this.downloadModal = false;
    },
  },
};
</script>

<style scoped lang="sass">
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
.download-icon
  svg
    height: 17px
</style>
