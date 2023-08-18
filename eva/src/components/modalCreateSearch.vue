<template>
  <modal-persistent
    v-model="active"
    width="680"
    :persistent="isChanged"
    :is-confirm="isChanged"
    :theme="theme"
    :color="theme.$main_text"
    @cancelModal="cancelModal"
  >
    <v-card
      :style="{ background: theme.$main_bg, color: theme.$main_text }"
      class="card-search"
    >
      <div class="textarea-block">
        <v-text-field
          v-model="search.sid"
          :color="theme.$primary_button"
          :style="{ color: theme.$main_text }"
          class="textarea-item textarea-item-name"
          outlined
          label="Имя ИД"
          placeholder="Sid"
          hide-details
          @input="isChanged = true"
        />
        <v-textarea
          v-model="search.original_otl"
          :color="theme.$primary_button"
          :style="{ color: theme.$main_text }"
          outlined
          hide-details
          no-resize
          spellcheck="false"
          class="code-search"
          height="180px"
          rows="5"
          placeholder="Origin otl"
          label="Текст ИД"
          @keyup.ctrl.\="addLineBreaks"
          @input="isChanged = true"
        />
        <div class="times-block">
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
        </div>
        <div class="d-flex">
          <v-expansion-panels class="expansion-panels">
            <v-expansion-panel
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
          <div class="limit-block">
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
        </div>
        <v-checkbox
          v-model="search.parametrs.isStartImmediately"
          hide-details
          :color="theme.$primary_button"
        >
          <template v-slot:label>
            <span :style="`color: ${theme.$secondary_text} !important`">
              Запускать ИД при загрузке дашборда
            </span>
          </template>
        </v-checkbox>
        <div>
          <v-checkbox
            v-model="search.parametrs.isNotifyOnFinish"
            hide-details
            :color="theme.$primary_button"
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

export default {
  name: 'ModalCreateSearch',
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
        this.isChanged = false;
      }
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
    }
  },
  methods: {
    setData() {
      this.search = JSON.parse(JSON.stringify(this.dataSearch));
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
@import '../sass/modalCreateSearch.sass';
</style>
