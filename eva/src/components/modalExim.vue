<template>
  <modal-persistent
    ref="confirmModal"
    v-model="active"
    width="500"
    :theme="theme"
    :is-confirm="isChanged"
    :persistent="isChanged"
    @cancelModal="closeModal"
  >
    <div class="exin-modal-block">
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div
            class="exin-title"
            :style="{ color: theme.$title, borderColor: theme.$main_border }"
          >
            Экспорт / Импорт
          </div>
        </v-card-text>
        <div
          ref="blockExim"
          class="block-exim"
        >
          <v-select
            v-model="selected"
            :prepend-icon="selectImg"
            :style="{ color: theme.$main_text, fill: theme.$main_text }"
            :items="elements[element]"
            multiple
            :color="theme.$accent_ui_color"
            hide-details
            outlined
            class="select-exp"
            :label="labelExp[element]"
          />
          <v-btn
            small
            :color="theme.$primary_button"
            class="export-btn"
            @click="exportDash"
          >
            Экспортировать
          </v-btn>
          <p
            class="msgExp"
            :style="{ opacity: msgExp.opacity }"
          >
            {{ msgExp.text }}
          </p>
          <div
            class="divider"
            :style="{ backgroundColor: theme.$main_border, opacity: '0,3' }"
          />
          <v-file-input
            :prepend-icon="fileImg"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text, fill: theme.$main_text }"
            class="file-itself"
            hide-details
            outlined
            label="Выберите файл"
            @change="file = $event"
          />
          <v-btn
            small
            :color="theme.$primary_button"
            class="import-btn"
            @click="importDash"
          >
            Импортировать
          </v-btn>
          <p
            class="msgImp"
            :style="{ opacity: msgImp.opacity }"
          >
            {{ msgImp.text }}
          </p>
        </div>
        <v-card-actions class="exim-action">
          <v-spacer />
          <v-btn
            small
            :color="theme.$primary_button"
            class="close-btn"
            @click="closeModal"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </modal-persistent>
</template>

<script>
import { mdiFileOutline, mdiFormatListBulleted } from '@mdi/js';

export default {
  name: 'ModalExim',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    dashboards: {
      type: Array,
      default: () => ([]),
    },
    groups: {
      type: Array,
      default: () => ([]),
    },
    element: {
      type: String,
      required: true,
    },
    curName: {
      type: String,
      default: '',
    },
    modalValue: {
      type: Boolean,
      default: false,
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
      selectImg: mdiFormatListBulleted,
      labelExp: {
        group: 'Выберите группы',
        dash: 'Выберите дашборды',
      },
      elements: {
        group: [],
        dash: [],
      },
      selected: [],
      isChanged: false,
    };
  },
  computed: {
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    theme() {
      // document.documentElement.style.setProperty('--main_bg', currentTheme.$main_bg);
      // document.documentElement.style.setProperty('--text_color', currentTheme.$main_text);
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    selected(selected) {
      this.isChanged = true;
      if (selected.includes('Выбрать все')) {
        let list = [];
        if (this.element === 'dash') {
          list = this.dashboards.map((item) => item.name);
        } else {
          list = this.groups.map((item) => item.name);
        }
        this.selected = list;
        list = [...[], ...list];
        list.unshift('Очистить все');
        this.$set(this.elements, this.element, list);
      } else if (selected.includes('Очистить все')) {
        let list = [];
        if (this.element === 'dash') {
          list = this.dashboards.map((item) => item.name);
        } else {
          list = this.groups.map((item) => item.name);
        }
        this.selected = [];
        list.unshift('Выбрать все');
        this.$set(this.elements, this.element, list);
      }
    },
    file() {
      this.isChanged = true;
    },
  },
  created() {
    if (this.element === 'group') {
      this.updateLocalGroupList();
    }
    if (this.element === 'dash') {
      this.updateLocalDashboardsList();
    }
  },
  methods: {
    updateLocalDashboardsList() {
      const list = this.dashboards.map((item) => item.name);
      list.unshift('Выбрать все');
      this.$set(this.elements, 'dash', list);
    },
    updateLocalGroupList() {
      const list = this.groups.map((item) => item.name);
      list.unshift('Выбрать все');
      this.$set(this.elements, 'group', list);
    },
    async exportDash() {
      const ids = [];
      if (this.selected.length === 0) {
        const itemName = (this.element === 'dash') ? 'дашборды' : 'группы';
        this.msgExp.text = `Выберите ${itemName} для экспорта`;
        this.msgExp.opacity = '1';
        setTimeout(() => {
          this.msgExp.opacity = '0';
        }, 2000);
        return;
      }
      if (this.element === 'dash') {
        this.dashboards.forEach((item) => {
          if (this.selected.includes(item.name)) {
            ids.push(item.id);
          }
        });
      } else {
        this.groups.forEach((item) => {
          if (this.selected.includes(item.name)) {
            ids.push(item.id);
          }
        });
      }

      const response = await this.$store.dispatch('exportDash', {
        element: this.element,
        ids: ids.join(','),
      });
      if (response === '') {
        this.msgExp.text = 'Экспортировать не удалось';
        this.msgExp.color = 'controlsActive';
        this.msgExp.opacity = '1';
      } else {
        this.isChanged = false;
        this.msgExp.text = 'Экспорт прошел успешно';
        this.msgExp.color = 'controls';
        this.msgExp.opacity = '1';
        this.downloadDash(response);
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
        let extantion = this.file.name.split('.');
        extantion = extantion[extantion.length - 1];
        if (extantion !== this.element) {
          if (this.element === 'group') {
            this.msgImp.text = 'Выберите файл c группами';
          } else {
            this.msgImp.text = 'Выберите файл c дашбордами';
          }
          this.msgImp.color = 'controlsActive';
          this.msgImp.opacity = '1';
        } else {
          const formData = new FormData();
          if (this.element === 'dash') {
            formData.append('group', this.curName);
          }
          formData.append('body', this.file);
          await this.$store.dispatch('importDash', {
            element: this.element,
            formData,
          }).then(() => {
            if (this.element === 'dash') {
              this.$emit('update:dashboards');
            }
            if (this.element === 'group') {
              this.$emit('update:groups');
            }
          });
          try {
            // тут проверяем может ли распарситься ответ от сервера
            // let res = JSON.parse(response);
            this.msgImp.text = 'Импорт прошел успешно';
            this.msgImp.color = 'controls';
            this.msgImp.opacity = '1';
            this.isChanged = false;
          } catch {
            this.msgImp.text = 'Импортировать не удалось';
            this.msgImp.color = 'controlsActive';
            this.msgImp.opacity = '1';
          }
        }
      }
      setTimeout(() => {
        this.msgImp.opacity = '0';
      }, 2000);
    },
    downloadDash(url) {
      const link = this.$refs.blockExim.appendChild(document.createElement('a'));
      link.setAttribute('href', `/${url}`);
      link.click();
      link.remove();
    },
    closeModal() {
      this.active = false;
    },
    // changeColor: function() {
    //   document.querySelectorAll('.v-menu__content').forEach( item => {
    //     item.style.background = this.theme.$secondary_bg;
    //     item.style.color = this.theme.$main_text;
    //     item.style.border = `1px solid ${this.theme.$main_border}`;
    //   })
    // },
  },
};
</script>

<style lang="scss">
@import '../sass/modalExin.sass';
</style>
