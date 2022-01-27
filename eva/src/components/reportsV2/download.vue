<template>
  <v-btn small text @click="exportDataCSV()">
    <v-icon :style="{color: theme.$main_text}" class="download-icon">{{ mdiDownload  }}</v-icon>
    <span class="download-btn-text" :style="{color: theme.$main_text}">
      Скачать
    </span>
  </v-btn>
</template>


<script>
import { mdiDownload } from '@mdi/js'

export default {
  props: {
    data: [],
  },
  data () {
    return {
      mdiDownload: mdiDownload,
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
  },
  methods: {
    exportDataCSV() {
      const searchData = this.data
      // const searchData = this.dataObject[searchName].data
      let csvContent = 'data:text/csv;charset=utf-8,' // задаем кодировку csv файла
      let keys = Object.keys(searchData[0]) // получаем ключи для заголовков столбцов
      csvContent += encodeURIComponent(keys.join(',') + '\n') // добавляем ключи в файл
      csvContent += encodeURIComponent(
          searchData.map((item) => Object.values(item).join(',')).join('\n')
      )

      const link = document.createElement('a') // создаем ссылку
      link.setAttribute('href', csvContent) // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('download', 'report.csv') // указываем имя файла
      link.click() // жмем на скачку
      link.remove() // удаляем ссылку
    },
  },
}


</script>

<style lang="scss" >

</style>