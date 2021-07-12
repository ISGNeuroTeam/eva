<template>
  <v-dialog
    v-model="showModal"
    persistent
    width="400px"
  >
    <div class="themes-modal-wrapper">
      <v-card :style="{backgroundColor: theme.$secondary_bg, borderRadius: '12px'}">
        <v-toolbar :style="{backgroundColor: theme.$main_bg, color:theme.$title}">
          <v-icon
            :color="theme.$title"
          >
            {{ mdiCompare }}
          </v-icon>
          <v-card-title>Настройки темы</v-card-title>
        </v-toolbar>
        <v-card-text
          v-if="!createMode"
          :style="{color: theme.$main_text, fontSize:'15px'}"
        >
          Выберете тему
          <v-select
            v-model="select"
            :color="theme.$accent_ui_color"
            hide-details
            outlined
            :items="themeTitles"
            item-text="name"
            item-value="name"
          />
          <div
            v-if="admin"
            :style="{color:theme.$accent_ui_color, width:'170px'}"
            class="add-theme-button"
            @click="addNewTheme"
          >
            <v-icon
              :color="theme.$accent_ui_color"
              :style="{marginRight:'5px'}"
            >
              {{ mdiPlusCircleOutline }}
            </v-icon>
            Создать свою тему
          </div>
        </v-card-text>
        <v-card-text
          v-else
          :style="{color: theme.$main_text, fontSize:'15px'}"
        >
          Название темы
          <v-text-field
            v-model="newTitle"
            :style="{color:theme.$secondary_bg}"
            :background-color="theme.$secondary_bg"
            :color="theme.$primary_button"
            outlined
            hide-details
          />
          <p>Руководство по настройке темы</p>
          <v-row
            v-for="row in fields"
            :key="row"
          >
            <v-col cols="6">
              {{ row.leftTitle }}
              <v-row justify="space-between">
                <v-col cols="2">
                  <div class="color-box" :style="{ backgroundColor: row.leftValue ? '#'+row.leftValue: '#8F8F9C'}" />
                </v-col>
                <v-col cols="9" :style="{paddingLeft:'3px'}">
                  <v-text-field
                    v-model="row.leftValue"
                    outlined
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="6">
              {{ row.rightTitle }}
              <v-row justify="space-between">
                <v-col cols="2">
                  <div class="color-box" :style="{ backgroundColor: row.rightValue ? '#'+row.rightValue: '#8F8F9C'}" />
                </v-col>
                <v-col cols="9" :style="{paddingLeft:'3px'}">
                  <v-text-field
                    v-model="row.rightValue"
                    outlined
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <p>Фоновое изображение (необязательно)</p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :color="theme.$primary_button"
            :style="{color:'#FFF'}"
            @click="closeModal"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import {  mdiCompare, mdiPlusCircleOutline } from '@mdi/js'
export default {
  props: {
    show: Boolean,
    admin: Boolean,
  },
  data() {
    return {
      mdiCompare: mdiCompare,
      mdiPlusCircleOutline: mdiPlusCircleOutline,
      themeTitles: [
        {name: 'dark'},
        {name: 'light'}
      ],
      newTitle: '',
      fields: [
        {
          leftTitle: 'Основной фон',
          leftProp: '$main_bg',
          leftValue: null,
          rightTitle: 'Дополнительный фон',
          rightValue: null,
          rightProp: '$secondary_bg'
        },
        {
          leftTitle: 'Основные линии',
          leftProp: '$main_border',
          leftValue: null,
          rightTitle: 'Дополнительные линии',
          rightValue: null,
          rightProp: '$secondary_border'
        },
        {
          leftTitle: 'Основной текст',
          leftProp: '$main_text',
          leftValue: null,
          rightTitle: 'Дополнительный текст',
          rightValue: null,
          rightProp: '$secondary_text'
        },
        {
          leftTitle: 'Заголовки',
          leftProp: '$title',
          leftValue: null,
          rightTitle: 'Иконки и акценты',
          rightValue: null,
          rightProp: '$accent_ui_color'
        },
        {
          leftTitle: 'Взаимодейтсвия',
          leftProp: '$primary_button',
          leftValue: null,
          rightTitle: 'Взаимодейтсвия (доп.)',
          rightValue: null,
          rightProp: '$primary_button_hover'
        }
      ],
      createMode: false,
    }
  },
  computed: {
    showModal(){
      return this.show;
    },
    theme() {
      return this.$store.getters.getTheme
    },
    select: {
      get: function () {
        return this.$store.getters.getThemeTitle
      },
      set: function(value) {
        this.$store.commit('setTheme', value);
      }
    }
  },
  methods: {
    closeModal(){
      this.createMode = false;
      this.$emit('closeModal')
    },
    addNewTheme(){
      this.createMode = true;
    },
  }
}
</script>

<style lang="sass">

    @import '../sass/modalThemes.sass'

</style>