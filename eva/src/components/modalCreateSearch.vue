<template>
  <modal-persistent
    v-model="active"
    width="90%"
    :persistent="isChanged"
    :is-confirm="isChanged"
    :theme="theme"
    :color="theme.$main_text"
    min-height="90vh"
    max-height="90vh"
    add-class="min-width-m"
    @cancelModal="cancelModal"
  >
    <v-card
      :style="{ background: theme.$main_bg, color: theme.$main_text }"
      class="card-search"
    >
      <div
        class="textarea-block grid-container"
      >
        <div style="min-width: 740px;">
          <v-row>
            <v-col>
              <v-text-field
                v-model="search.sid"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item textarea-item-name top"
                outlined
                label="Имя ИД"
                placeholder="Sid"
                hide-details
                @input="isChanged = true"
              />
            </v-col>
            <v-col class="pl-0">
              <div style="height: 40px;">
                <v-expansion-panels
                  v-model="isTimeOutOpen"
                  class="expansion-panels d-inline-block"
                >
                  <v-expansion-panel
                    value="isTimeOutOpen"
                    :style="{
                      backgroundColor: theme.$main_bg,
                      color: theme.$main_text,
                      border: `1px solid ${theme.$main_border}`,
                    }"
                  >
                    <v-expansion-panel-header>
                      Дополнительные параметры
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="order-expansion">
                      <v-text-field
                        v-model="search.parametrs.timeout"
                        :color="theme.$primary_button"
                        :style="{ color: theme.$main_text }"
                        class="textarea-item"
                        outlined
                        label="Timeout"
                        hide-details
                        @input="isChanged = true"
                      />
                      <v-text-field
                        v-model="search.parametrs.cache_ttl"
                        :color="theme.$primary_button"
                        :style="{ color: theme.$main_text }"
                        class="textarea-item"
                        outlined
                        label="Cache_ttl"
                        hide-details
                        @input="isChanged = true"
                      />
                      <v-text-field
                        v-model="search.parametrs.field_extraction"
                        :color="theme.$primary_button"
                        :style="{ color: theme.$main_text }"
                        class="textarea-item"
                        outlined
                        label="Field_extraction"
                        hide-details
                        @input="isChanged = true"
                      />
                      <v-text-field
                        v-model="search.parametrs.preview"
                        :color="theme.$primary_button"
                        :style="{ color: theme.$main_text }"
                        class="textarea-item"
                        outlined
                        label="Preview"
                        hide-details
                        @input="isChanged = true"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-col>
          </v-row>
        </div>

        <div class="code ">
          <div>Текст ИД</div>
          <codemirror
            ref="search"
            v-model="search.original_otl"
            :options="cmOption"
            class="search-block-codemirror"
            style="position:relative; max-height: calc(100% - 24px); height: calc(100% - 24px);"
            @keyup.ctrl.\="addLineBreaks"
            @input="isChanged = true"
            @ready="onCmReady"
          />
        </div>

        <div class="bottom-left ">
          <div class="times-block ">
            <div class="time-block">
              <v-text-field
                v-model="search.parametrs.tws"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Временной интервал: начало"
                placeholder="0"
                hide-details
                @input="isChanged = true"
              />
              <DTPicker
                v-model="tws"
                :no-value-to-custom-elem="true"
                format="YYYY-MM-DD HH:mm"
                :style="{
                  fill: theme.$main_text,
                  background: theme.$main_bg,
                  color: theme.$main_text,
                }"
                :color="theme.$accent_ui_color"
                :button-color="theme.$primary_button"
                class="dtpicker-search"
                transition="fade-transition"
                @input="isChanged = true"
              >
                <v-icon
                  class="picker-search"
                  :color="theme.$primary_button"
                >
                  {{ pickerIcon }}
                </v-icon>
              </DTPicker>
            </div>
            <div class="time-block">
              <v-text-field
                v-model="search.parametrs.twf"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Временной интервал: конец"
                placeholder="0"
                hide-details
                @input="isChanged = true"
              />
              <DTPicker
                v-model="twf"
                :no-value-to-custom-elem="true"
                format="YYYY-MM-DD HH:mm"
                :style="{
                  fill: theme.$main_text,
                  background: theme.$main_bg,
                  color: theme.$main_text,
                }"
                :color="theme.$accent_ui_color"
                :button-color="theme.$primary_button"
                class="dtpicker-search"
                transition="fade-transition"
                @input="isChanged = true"
              >
                <v-icon
                  class="picker-search"
                  :color="theme.$primary_button"
                >
                  {{ pickerIcon }}
                </v-icon>
              </DTPicker>
            </div>

            <div class="limit-block ml-5">
              <v-text-field
                v-model="search.limit"
                :color="theme.$accent_ui_color"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Максимальное кол-во строк"
                hide-details
                @input="isChanged = true"
              />
            </div>
            <v-checkbox
              v-model="search.parametrs.isStartImmediately"
              hide-details
              class="ml-5"
              style="margin-top: 0; padding-top: 0 "
              :color="theme.$primary_button"
            >
              <template v-slot:label>
                <span :style="`color: ${theme.$secondary_text} !important`">
                  Запускать ИД при загрузке дашборда
                </span>
              </template>
            </v-checkbox>
          </div>

          <div class="">
            <v-checkbox
              v-model="search.parametrs.isNotifyOnFinish"
              hide-details
              :color="theme.$primary_button"
              style="padding-top: 0; margin-top: 0; margin-right: 15px; padding-bottom: 20px;"
            >
              <template v-slot:label>
                <span :style="`color: ${theme.$secondary_text} !important`">
                  Показывать уведомление при успешном выполнении
                </span>
              </template>
            </v-checkbox>
            <v-text-field
              v-model="search.parametrs.customMessageOnFinish"
              :color="theme.$primary_button"
              :style="{ color: theme.$main_text }"
              class="textarea-item textarea-item-name"
              outlined
              label="Текст уведомления"
              :placeholder="`Запрос ${search.sid} успешно выполнен`"
              hide-details
              @input="isChanged = true"
            />
          </div>
        </div>
      </div>
      <v-card-actions class="searchBtn">
        <div
          class="errorMsg"
          :style="{ color: theme.$error_color }"
          :class="{ errorMsgShow: errorMsgShow }"
        >
          {{ errorMsg }}
        </div>
        <v-btn
          small
          :color="theme.$primary_button"
          class="create-btn"
          @click="addSearch"
        >
          {{ createBtn }}
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="create-btn"
          @click="cancelModal"
        >
          {{ cancelBtn }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>
import { mdiCalendarMonth } from '@mdi/js';
import { codemirror } from 'vue-codemirror';
// import numberLineModal from '@/components/reportsV2/numberLineModal';

import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/merge/merge.js';

import '../js/codeMirror/codeHighlight.js';
import '../js/codeMirror/token-hover.js';
import '../js/codeMirror/text-hover.js';

export default {
  name: 'ModalCreateSearch',
  components: {
    codemirror,
    // numberLineModal,
  },
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    idDashFrom: {
      type: String,
      required: true,
    },
    dataSearchFrom: {
      type: Object,
      required: true,
    },
    createBtnFrom: {
      type: String,
      required: true,
    },
    modalValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentSid: null,
      search: {
        id: 0,
        sid: null,
        original_otl: null,
        limit: 1000,
        parametrs: {
          tws: 0,
          twf: 0,
          username: 'admin',
          timeout: 60,
          preview: false,
          field_extraction: false,
          cache_ttl: 60,
          isStartImmediately: true,
          isNotifyOnFinish: false,
          customMessageOnFinish: '',
        },
      },
      createText: 'Создать',
      errorMsgShow: false,
      errorMsg: '',
      createBtn: 'Создать',
      cancelBtn: 'Отмена',
      tws: '',
      twf: '',
      pickerIcon: mdiCalendarMonth,
      isChanged: false,
      isTimeOutOpen: ['isTimeOutOpen'],
      // CodeMirrorOptions
      cmOption: {
        tabSize: 4,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        mode: 'text/x-otl',
        hintOptions: {
          completeSingle: false,
        },
        matchBrackets: true,
        showCursorWhenSelecting: true,
        theme: 'eva-dark',
        lineWrapping: false,
        textHover: {
          delay: 400,
        },
      },
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
    dataSearch() {
      return this.dataSearchFrom;
    },
    // получаем id страницы переданного от родителя
    idDash() {
      return this.idDashFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    getSearches() {
      return this.dashFromStore?.searches || [];
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    searchId() {
      if (this.dashFromStore?.searches?.length > 0) {
        return this.dashFromStore.searches.length;
      }
      return 0;
    },
  },
  watch: {
    active(val) {
      // тут понимаем нужно ли открыть окно с созданием или нет
      if (val) {
        this.setData();
      } else {
        if (this.$refs.search) {
          this.$nextTick(() => {
            // eslint-disable-next-line no-underscore-dangle
            this.$refs.search._data.cminstance.doc.clearHistory();
            this.isChanged = false;
          });
        }
        this.isChanged = false;
      }
      this.isTimeOutOpen = undefined;
    },
    dataSearchFrom() {
      this.currentSid = this.dataSearchFrom?.sid;
    },
    tws() {
      this.search.parametrs.tws = this.tws;
    },
    twf() {
      this.search.parametrs.twf = this.twf;
    },
  },
  mounted() {
    this.currentSid = this.dataSearchFrom?.sid;
    if (this.active) {
      this.setData();
      this.isChanged = false;
    }
  },
  methods: {
    onCmReady() {
      this.$refs.search.$el.addEventListener('keypress', (event) => {
        if (event.ctrlKey && event.keyCode === 10) {
          this.launchSearch();
        } else if (event.ctrlKey && event.keyCode === 28) {
          this.addLineBreaks();
        }
      });
    },
    setData() {
      this.search = JSON.parse(JSON.stringify(this.dataSearch));
      if (this.$refs.search) {
        this.$nextTick(() => {
          // eslint-disable-next-line no-underscore-dangle
          this.$refs.search._data.cminstance.doc.clearHistory();
          this.isChanged = false;
        });
      }
      if (this.search.parametrs.isStartImmediately === undefined) {
        this.$set(this.search.parametrs, 'isStartImmediately', true);
      }
      if (this.createBtnFrom === 'edit') {
        this.createBtn = 'Применить';
      } else {
        this.createBtn = 'Создать';
      }
    },
    cancelModal() {
      if (this.cancelBtn === 'Отмена') {
        this.active = false;
      } else {
        if (this.createBtnFrom === 'edit') {
          this.createBtn = 'Применить';
        } else {
          this.createBtn = 'Создать';
        }
        this.cancelBtn = 'Отмена';
        this.errorMsgShow = false;
      }
    },
    checkAllSearchId(id = 0) {
      if (this.getSearches.find((el) => el.id === id)) {
        this.checkAllSearchId(id + 1);
      } else {
        this.$set(this.search, 'id', id);
      }
    },
    addSearch() {
      if (this.search.sid && this.search.sid !== '' && this.search.original_otl) {
        if (
          typeof this.search.parametrs.tws === 'string'
          && parseInt(new Date(this.search.parametrs.tws).getTime() / 1000, 10)
        ) {
          this.search.parametrs.tws = parseInt(
            new Date(this.search.parametrs.tws).getTime() / 1000,
            10,
          );
        }
        if (
          typeof this.search.parametrs.twf === 'string'
          && parseInt(new Date(this.search.parametrs.twf).getTime() / 1000, 10)
        ) {
          this.search.parametrs.twf = parseInt(
            new Date(this.search.parametrs.twf).getTime() / 1000,
            10,
          );
        }
        // получаем все ИС
        const searches = this.getSearches;
        let j = -1;
        // пробегаемся по всем ИС
        searches.forEach((item, i) => {
          // и если ИС с таким id уже есть
          if (item.sid === this.currentSid) {
            // меняем переменную
            j = i;
          } else if (item.sid === this.search.sid) {
            j = -100;
          }
        });

        // если такой ИС уже есть вызовем сообщение с уточнением
        if (j !== -1) {
          if (this.cancelBtn === 'Отмена' && this.currentSid === this.search.sid) {
            this.errorMsg = 'Такой источник данных существует. Хотите заменить его?';
            this.createBtn = 'Да';
            this.cancelBtn = 'Нет';
            this.errorMsgShow = true;
          } else {
            this.$store.commit('setSearch', {
              search: {
                ...this.search,
                currentSid: j === -100 ? null : this.currentSid,
              },
              idDash: this.idDash,
              reload: true,
            });
            this.cancelBtn = 'Отмена';
            this.errorMsgShow = false;
            // и скрываем окно редактирования ИД
            this.active = false;
          }
          // если нет
        } else {
          if (searches?.length > 0) {
            this.checkAllSearchId();
          } else {
            this.$set(this.search, 'id', 0);
          }
          // отправляем в хранилище для создания
          this.$store.commit('setSearch', {
            search: this.search,
            idDash: this.idDash,
            reload: false,
          });
          // и скрываем окно редактирования ИС
          this.active = false;
        }
      } else {
        this.errorMsg = 'Sid источника данных не может быть пустым';
        this.errorMsgShow = true;
        setTimeout(() => {
          this.errorMsgShow = false;
        }, 2000);
      }
    },
    addLineBreaks() {
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|',
        '\n|',
      );
      if (this.search.original_otl[0] === '\n') {
        this.search.original_otl = this.search.original_otl.substring(1);
      }
      this.search.original_otl = this.search.original_otl.replaceAll(
        '\n\n|',
        '\n|',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '|\n',
        '| ',
      );
      this.search.original_otl = this.search.original_otl.replaceAll(
        '| \n',
        '| ',
      );
    },
  },
};
</script>

<style lang="scss">
.card-search .v-input__control .v-icon {
  color: var(--main_text) !important
}
@import 'codemirror/lib/codemirror';
@import '../sass/_colors';
@import '../sass/codeHighlightEva';
@import '../sass/codeHighlightEvaDark';
@import '../sass/modalCreateSearch.sass';

.grid-container {
  height: 90vh;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: min-content calc(100% - 260px) min-content;
  gap: 15px 0;
  grid-template-areas:
    "top top top top"
    "code code code code"
    "bottom-left bottom-left bottom-left bottom-left";
}
.top { grid-area: top; }
.code { grid-area: code;  position: relative}
.bottom-left { grid-area: bottom-left; }
.bottom-right { grid-area: bottom-right; }

.card-search {
  .search-block-codemirror {
    &>.CodeMirror {
      border-radius: 10px;
      border: 1px solid $secondary_border;
      background: $secondary_bg;
      color: $main_text;
      caret-color: $main_text;
      height: 100%;
    }
    .CodeMirror-cursor{
      border-left: 1px solid $main_text;
    }
    .CodeMirror-gutters {
      color: $main_text;
      background: $main_bg;
    }
    .CodeMirror-line {
      padding-left: 20px !important;
      text-indent: -18px;
    }
    .CodeMirror-vscrollbar {
      width: 7px;
      transition: all .3s;
      cursor: pointer;

      &:hover {
        width: 13px;

        &::-webkit-scrollbar-track {
          background: $secondary_border;
        }
      }

      &::-webkit-scrollbar {
        transition: all .3s;
        width: 7px;

        &:hover {
          width: 13px;
        }
      }
    }
    .CodeMirror-hscrollbar {
      height: 7px;
      transition: all .3s;
      cursor: pointer;
      &:hover{
        height: 13px;
        &::-webkit-scrollbar-track {
          background: $secondary_border;
        }
      }
      &::-webkit-scrollbar{
        transition: all .3s;
        height: 7px;
        &:hover {
          height: 13px;
        }
      }
    }
    .CodeMirror-vscrollbar,
    .CodeMirror-hscrollbar {
      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0);
        border-radius: 5px;
        transition: all .3s;
      }
    }
  }
}
.CodeMirror-hover-tooltip {
  position: absolute;
  background-color: infobackground;
  border: 1px solid black;
  border-radius: 4px 4px 4px 4px;
  color: infotext;
  font-family: monospace;
  font-size: 10pt;
  overflow: hidden;
  padding: 2px 5px;
  z-index: 99999;
  max-width: 600px;
  opacity: 0.1;
  transition: opacity .2s;
  -moz-transition: opacity .2s;
  -webkit-transition: opacity .2s;
  -o-transition: opacity .2s;
  -ms-transition: opacity .2s;

  ul {
    padding-left: 20px;
  }
}
</style>
