<template>
  <div
      class="dash-map"
      ref="container"
  >
    <div v-if="needSetField">
      <v-select
          v-model="dataField"
          :dark="isDarkTheme"
          :items="fieldList"
          label="Столбец данных"
          outlined
          class="mt-6"
      ></v-select>
    </div>
    <div
      v-else
      class="flex flex-grow-1 justify-center align-center mt-6"
      :class="{row: vertical}"
    >
      <div class="flex-grow-0">
        <v-slider
            :class="{'slider-vertical': vertical}"
            :dark="isDarkTheme"
            :disabled="loading || values.length === 0"
            v-model="sliderValue"
            :min="0"
            :max="values.length -1"
            :vertical="vertical"
            :color="theme.$primary_button"
            ticks="always"
            @change="onChangeSlider"
        >
        </v-slider>
      </div>
      <div class="pt-4">
        <v-progress-circular
            :rotate="360"
            :size="circularSize"
            :width="15"
            :value="percentValue"
            :color="loading ? theme.$secondary_border : theme.$primary_button"
        >
          <div v-if="!loading">
            <span class="text-h4">{{ value }}%</span>
          </div>
        </v-progress-circular>
        <div class="pa-4">
          <div>
            <v-btn
                :dark="isDarkTheme"
                :color="theme.$primary_button"
                color="primary"
                small
                :disabled="isMinimumValue"
                @click="addValue(-1)">
              <v-icon>{{ icons.minus }}</v-icon>
            </v-btn>
            <v-btn
                :dark="isDarkTheme"
                :color="theme.$primary_button"
                color="primary"
                small
                class="ml-2"
                :disabled="isMaximumValue"
                @click="addValue(1)">
              <v-icon>{{ icons.plus }}</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mdiMinus, mdiPlus} from "@mdi/js";

export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null, // цветовые переменные
    dataModeFrom: null, // включена ли шапка
    loading: null,
  },
  data() {
    return {
      vertical: true,
      circularSize: 200,
      icons: {
        plus: mdiPlus,
        minus: mdiMinus,
      },
      actions: [
        {
          name: 'change',
          capture: []
        },
      ],
      sliderValue: 0,
      dataField: null,
      value: 0,
    }
  },
  computed: {
    needSetField() {
      return !this.dataField && !this.loading
    },
    theme: function() {
      return this.colorFrom
    },
    values(){ // значения слайдера
      if (!this.dataField && this.dataRestFrom.length) {
        const keys = Object.keys(this.dataRestFrom[0]).filter(key => key[0] !== '_');
        if (keys.length === 1) {
          this.dataField = keys[0];
        }
      }
      const list = this.dataRestFrom
        .map(row => Number.parseFloat(row[this.dataField]))
        .sort();
      return list.filter((item, pos) => list.indexOf(item) === pos) // filter duplicates
    },
    minValue(){
      return this.values ? this.values[0] : 0;
    },
    maxValue(){
      return this.values ? this.values[this.values.length -1] : 0
    },
    fractionalValue() {
      return (this.value - this.minValue) / (this.maxValue - this.minValue)
    },
    percentValue() {
      return this.fractionalValue *100
    },
    isMinimumValue() {
      return this.sliderValue <= 0
    },
    isMaximumValue() {
      return this.sliderValue >= this.values.length -1
    },
    isDarkTheme(){
      return this.$store.getters.getThemeTitle.indexOf('light') === -1
    },
    fieldList(){
      if (!this.dataRestFrom.length) {
        return []
      }
      return Object.keys(this.dataRestFrom[0])
    }
  },
  watch: {
    values(list) {
      let rowNumber = 0
      list.forEach(item => {
        if (item < this.value) {
          rowNumber++
        }
      })
      this.sliderValue = rowNumber;
      if (this.value === '' && list.length) {
        this.value = list[rowNumber]
      }
    },
    sliderValue(value) {
      if (!this.loading && this.values.length > 0) {
        this.value = this.values[value];
      }
    },
    dataField(value) {
      value !== '' && this.$store.commit('setSelected', {
        element: 'elem',
        idDash: this.idDashFrom,
        id: this.idFrom,
        value,
      });
    }
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDashFrom,
      id: this.idFrom
    });
    this.loadSelectedValue()
  },
  methods: {
    addValue(val) { // +/- buttons
      this.sliderValue += val
      this.changeValue()
    },
    onChangeSlider(){
      this.changeValue()
    },
    changeValue() {
      this.$nextTick(() => {
        this.setToken()
        this.storeValue()
      })
    },
    storeValue() {
      this.$store.commit('setSelected', {
        element: 'elemDeep',
        idDash: this.idDashFrom,
        id: this.idFrom,
        value: this.value,
      });
    },
    setToken() {
      this.$store.getters.getTockens(this.idDashFrom).forEach(token => {
        if (token.elem === this.idFrom && token.action === 'change') {
          this.$store.commit('setTocken', {
            tocken: {
              name: token.name,
              action: 'change',
              capture: '',
            },
            idDash: this.idDashFrom,
            value: this.value,
          })
        }
      })
    },
    loadSelectedValue() {
      let selected = this.$store.getters.getSelected({
        idDash: this.idDashFrom,
        id: this.idFrom
      });
      this.dataField = selected.elem
      this.value = selected.elemDeep
    }
  },
}
</script>

<style lang="sass">
.dash-map
  color: var(--main_text) !important

  .v-input__append-inner
    margin-top: 16px

  .slider-vertical
    height: 100%
    padding-right: 60px

    .v-slider--vertical
      min-height: 220px
</style>