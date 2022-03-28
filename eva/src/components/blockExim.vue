<template>
  <div
    ref="blockExim"
    class="block-exim"
    :class="{ openexim: openexim }"
    :style="{
      boxShadow: `0px 0px 3px 0 ${color.border}`,
      background: color.back,
      color: color.text,
    }"
  >
    <v-btn
      small
      :color="color.controls"
      class="export-btn"
      @click="exportDash"
    >
      Экспортировать дашборд
    </v-btn>
    <p
      class="msgExp"
      :style="{ color: color[msgExp.color], opacity: msgExp.opacity }"
    >
      {{ msgExp.text }}
    </p>
    <div
      class="divider"
      :style="{ backgroundColor: color.border, opacity: '0,3' }"
    />
    <v-file-input
      :prepend-icon="fileImg"
      :color="color.controls"
      class="file-itself"
      hide-details
      outlined
      label="Выбрать файл дашборда"
      @change="file = $event"
    />
    <v-btn
      small
      :color="color.controls"
      class="import-btn"
      @click="importDash"
    >
      Импортировать дашборд
    </v-btn>
    <p
      class="msgImp"
      :style="{ color: color[msgImp.color], opacity: msgImp.opacity }"
    >
      {{ msgImp.text }}
    </p>
  </div>
</template>

<script>
import { mdiFileOutline } from '@mdi/js';

export default {
  props: {
    color: {
      type: Object,
      required: true,
    },
    openexim: {
      type: Boolean,
      required: true,
    },
    idDash: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      msgExp: {
        text: 'Успешно',
        color: 'controls',
        opacity: '0',
      },
      msgImp: {
        text: 'Успешно',
        color: 'controls',
        opacity: '0',
      },
      file: '',
      fileImg: mdiFileOutline,
    };
  },
  computed: {},
  methods: {
    async exportDash() {
      const response = await this.$store.dispatch('exportDash', this.idDash);
      if (response.status != 200) {
        this.msgExp.text = 'Экспортировать не удалось';
        this.msgExp.color = 'controlsActive';
        this.msgExp.opacity = '1';
      } else {
        this.msgExp.text = 'Экспорт прошел успешно';
        this.msgExp.color = 'controls';
        this.msgExp.opacity = '1';
        this.downloadDash('../dist/images/notfound.gif');
      }
      setTimeout(() => {
        this.msgExp.opacity = '0';
      }, 2000);
    },
    async importDash() {
      if (this.file === '' || this.file === undefined) {
        this.msgImp.text = 'Выберите файл для импорта';
        this.msgImp.color = 'controlsActive';
        this.msgImp.opacity = '1';
      } else {
        const response = await this.$store.dispatch('importDash', {
          idDash: this.idDash,
          file: this.file,
        });
        if (response.status != 200) {
          this.msgImp.text = 'Импортировать не удалось';
          this.msgImp.color = 'controlsActive';
          this.msgImp.opacity = '1';
        } else {
          this.msgImp.text = 'Импорт прошел успешно';
          this.msgImp.color = 'controls';
          this.msgImp.opacity = '1';
        }
        this.uploadDash();
      }
      setTimeout(() => {
        this.msgImp.opacity = '0';
      }, 2000);
    },
    uploadDash() {
      const reader = new FileReader();

      reader.readAsText(this.file);

      reader.onload = () => {
        this.$store.commit('updateDash', {
          dash: { id: this.idDash, body: reader.result },
          modified: '',
        });
        this.$store.dispatch('auth/putLog', `Импортирован дашборд ${this.idDash}`);
        this.$emit('closeExim');
      };

      reader.onerror = function () {
        console.error(reader.error);
      };
    },
    downloadDash(url) {
      const link = this.$refs.blockExim.appendChild(document.createElement('a'));
      link.setAttribute('href', url);
      link.setAttribute('download', url);
      link.click();
      link.remove();
    },
  },
};
</script>

<style lang="scss">
// настройки стилей в файле dashPanelBoard.sass
</style>
