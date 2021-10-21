<template>
  <v-dialog
    :value="active"
    width="680"
    persistent
    :color="theme.$main_text"
    @keydown.esc="cancelModal"
  >
    <v-card :style="{ background: theme.$main_bg, color: theme.$main_text }" class="card-search">
      <div class="textarea-block">
        <v-text-field
          v-model="search.sid"
          :color="theme.$primary_button"
          :style="{ color: theme.$main_text }"
          class="textarea-item"
          outlined
          label="Имя ИД"
          placeholder="Sid"
          hide-details
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
            >
              <v-icon class="picker-search" :color="theme.$primary_button">
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
              :color="theme.$primary_button"
              :button-color="theme.$primary_button"
              class="dtpicker-search"
            >
              <v-icon class="picker-search" :color="theme.$primary_button">
                {{ pickerIcon }}
              </v-icon>
            </DTPicker>
          </div>
        </div>
        <v-expansion-panels class="expansion-panels">
          <v-expansion-panel
            :style="{
              backgroundColor: theme.$main_bg,
              color: theme.$main_text,
              border: `1px solid ${theme.$main_border}`,
            }"
          >
            <v-expansion-panel-header>Дополнительные параметры</v-expansion-panel-header>
            <v-expansion-panel-content class="order-expansion">
              <v-text-field
                v-model="search.parametrs.timeout"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Timeout"
                hide-details
              />
              <v-text-field
                v-model="search.parametrs.cache_ttl"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Cache_ttl"
                hide-details
              />
              <v-text-field
                v-model="search.parametrs.field_extraction"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Field_extraction"
                hide-details
              />
              <v-text-field
                v-model="search.parametrs.preview"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Preview"
                hide-details
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <v-card-actions class="searchBtn">
        <div
          class="errorMsg"
          :style="{ color: theme.$error_color }"
          :class="{ errorMsgShow: errorMsgShow }"
        >
          {{ errorMsg }}
        </div>
        <v-btn small :color="theme.$primary_button" class="create-btn" @click="addSearch">
          {{ createBtn }}
        </v-btn>
        <v-btn small :color="theme.$primary_button" class="create-btn" @click="cancelModal">
          {{ cancelBtn }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiCalendarMonth } from '@mdi/js'

export default {
  props: {
    idDashFrom: null,
    modalFrom: null,
    dataSearchFrom: null,
    createBtnFrom: null,
  },
  data() {
    return {
      currentSid: null,
      search: {
        sid: null,
        original_otl: null,
        parametrs: {
          tws: 0,
          twf: 0,
          username: 'admin',
          timeout: 60,
          preview: false,
          field_extraction: false,
          cache_ttl: 60,
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
    }
  },
  computed: {
    active: function () {
      // тут понимаем нужно ли открыть окно с созданием или нет
      if (this.modalFrom) {
        this.search = this.dataSearch

        if (this.createBtnFrom === 'edit') {
          this.createBtn = 'Редактировать'
        } else {
          this.createBtn = 'Создать'
        }
      }
      return this.modalFrom
    },
    dataSearch: function () {
      return this.dataSearchFrom
    },
    idDash: function () {
      // получаем id страницы переданного от родителя
      return this.idDashFrom
    },
    theme: function () {
      return this.$store.getters.getTheme
    },
  },
  mounted() {
    console.log(this.dataSearchFrom)
    this.currentSid = this.dataSearchFrom?.sid
  },
  watch: {
    dataSearchFrom() {
      this.currentSid = this.dataSearchFrom?.sid
    },
    tws: function () {
      this.search.parametrs.tws = this.tws
    },
    twf: function () {
      this.search.parametrs.twf = this.twf
    },
  },
  methods: {
    cancelModal: function () {
      if (this.cancelBtn === 'Отмена') {
        this.$emit('cancelModal')
      } else {
        if (this.createBtnFrom === 'edit') {
          this.createBtn = 'Редактировать'
        } else {
          this.createBtn = 'Создать'
        }
        this.cancelBtn = 'Отмена'
        this.errorMsgShow = false
      }
    },
    addSearch: function () {
      if (this.search.sid && this.search.sid !== '') {
        if (
          typeof this.search.parametrs.tws == 'string' &&
          parseInt(new Date(this.search.parametrs.tws).getTime() / 1000)
        ) {
          this.search.parametrs.tws = parseInt(new Date(this.search.parametrs.tws).getTime() / 1000)
        }
        if (
          typeof this.search.parametrs.twf == 'string' &&
          parseInt(new Date(this.search.parametrs.twf).getTime() / 1000)
        ) {
          this.search.parametrs.twf = parseInt(new Date(this.search.parametrs.twf).getTime() / 1000)
        }

        let searches = this.$store.getters.getSearches(this.idDash) // получаем все ИС
        let j = -1
        console.log(searches, this.currentSid, this.dataSearch)
        searches.forEach((item, i) => {
          // пробегаемся по всем ИС
          if (item.sid === this.currentSid) {
            // и если ИС с таким id уже есть
            j = i // меняем переменную
          } else if (item.sid === this.search.sid) {
            j = -100
          }
        })

        if (j !== -1) {
          // если такой ИС уже есть вызовем сообщение с уточнением
          if (this.cancelBtn === 'Отмена') {
            this.errorMsg = 'Такой источник данных существует. Хотите заменить его?'
            this.createBtn = 'Да'
            this.cancelBtn = 'Нет'
            this.errorMsgShow = true
          } else {
            this.$store.commit('setSearch', {
              search: { ...this.search, currentSid: j === -100 ? null : this.currentSid },
              idDash: this.idDash,
              reload: true,
            })
            this.cancelBtn = 'Отмена'
            this.errorMsgShow = false
            this.$emit('cancelModal') // и скрываем окно редактирования ИД
          }
        } else {
          // если нет
          this.$store.commit('setSearch', {
            search: this.search,
            idDash: this.idDash,
            reload: false,
          }) // отправляем в хранилище для создания
          this.$emit('cancelModal') // и скрываем окно редактирования ИС
        }
      } else {
        this.errorMsg = 'Sid источника данных не может быть пустым'
        this.errorMsgShow = true
        setTimeout(() => {
          this.errorMsgShow = false
        }, 2000)
      }
    },
    addLineBreaks: function(event) {
      this.search.original_otl = this.search.original_otl.replaceAll('|', '\n' + '|')
      this.search.original_otl = this.search.original_otl.replace('\n', '')
      this.search.original_otl = this.search.original_otl.replaceAll("\n\n" + '|', '\n' + '|')
    },
  },
}
</script>

<style lang="scss" >
@import '../sass/modalCreateSearch.sass';
</style>