<template>
  <div
    ref="container"
    class="dash-map"
    :class="{ 'full-screen': isFullScreen || circularResize, 'min-size': minSize }"
    :style="{ zoom: needSetField ? 1 : htmlZoom }"
  >
    <div v-if="needSetField">
      <v-select
        v-model="dataField"
        :dark="isDarkTheme"
        :items="fieldList"
        label="Столбец данных"
        outlined
        class="mt-6"
      />
    </div>
    <div
      v-else
      class="flex flex-grow-1 justify-center align-center"
      :class="{ row: vertical, 'mt-6': !minSize}"
    >
      <div class="flex-grow-0">
        <v-slider
          v-model="sliderValue"
          :class="{ 'slider-vertical': vertical }"
          :dark="isDarkTheme"
          :disabled="loading || values.length === 0"
          :min="0"
          :max="values.length - 1"
          :vertical="vertical"
          :color="theme.$primary_button"
          ticks="always"
          @change="onChangeSlider"
        />
      </div>
      <div class="pt-4">
        <v-progress-circular
          :rotate="360"
          :size="circularSize"
          :width="circularWidth"
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
              :disabled="isMinimumValue"
              @click="addValue(-1)"
            >
              <v-icon>{{ icons.minus }}</v-icon>
            </v-btn>
            <v-btn
              :dark="isDarkTheme"
              :color="theme.$primary_button"
              class="ml-2"
              :disabled="isMaximumValue"
              @click="addValue(1)"
            >
              <v-icon>{{ icons.plus }}</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mdiMinus, mdiPlus } from '@mdi/js';
import { mapActions, mapMutations } from 'vuex';

export default {
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    dataModeFrom: {
      type: Boolean,
      required: true,
    }, // включена ли шапка
    loading: {
      type: Boolean,
      default: false,
    },
    widthFrom: {
      type: Number,
      required: true,
    }, // ширина родительского компонента
    heightFrom: {
      type: Number,
      required: true,
    }, // высота родительского компонента
  },
  data() {
    return {
      vertical: true,
      icons: {
        plus: mdiPlus,
        minus: mdiMinus,
      },
      actions: [
        {
          name: 'change',
          capture: [],
        },
      ],
      sliderValue: 0,
      dataField: null, // поле с данными
      value: '',
    };
  },
  computed: {
    circularSize() {
      if (this.widthFrom > 775 && this.heightFrom > 775) {
        return this.heightFrom - 177;
      }
      if (this.widthFrom > 200 && this.heightFrom > 200) {
        if (this.widthFrom < this.heightFrom) {
          return this.widthFrom - 147;
        } else {
          return this.heightFrom - 147;
        }
      } else {
        return 60;
      }
    },
    circularWidth() {
      return this.circularSize / 10;
    },
    circularResize() {
      return this.circularSize > 400 && this.heightFrom > 775 && this.widthFrom > 775;
    },
    minSize() {
      return this.widthFrom < 300 || this.heightFrom < 300;
    },
    htmlZoom() {
      const size = this.$attrs.heightFrom < this.$attrs.widthFrom
        ? this.$attrs.heightFrom
        : this.$attrs.widthFrom;
      return size / 370;
    },
    isFullScreen() {
      return this.$attrs['is-full-screen'];
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    getElementSelected() {
      return this.dashFromStore?.selected;
    },
    storedElement() {
      // TODO: разобраться для чего это здесь
      // eslint-disable-next-line no-unused-expressions
      this.isFullScreen; // << dont remove
      return this.dashFromStore;
    },
    needSetField() {
      return !this.dataField && !this.loading;
    },
    theme() {
      return this.colorFrom;
    },
    values() {
      if (!this.dataField) {
        return [];
      }
      const list = this.dataRestFrom
        .map((row) => {
          const num = Number.parseFloat(row[this.dataField]);
          return Number.isNaN(num) ? 0 : num;
        })
        .sort((a, b) => a - b);
      return list.filter((item, pos) => list.indexOf(item) === pos); // filter duplicates
    },
    minValue() {
      return this.values ? this.values[0] : 0;
    },
    maxValue() {
      return this.values ? this.values[this.values.length - 1] : 0;
    },
    fractionalValue() {
      return (this.value - this.minValue) / (this.maxValue - this.minValue);
    },
    percentValue() {
      return this.fractionalValue * 100;
    },
    isMinimumValue() {
      return this.sliderValue <= 0;
    },
    isMaximumValue() {
      return this.sliderValue >= this.values.length - 1;
    },
    isDarkTheme() {
      return this.$store.getters.getThemeTitle.indexOf('light') === -1;
    },
    fieldList() {
      if (!this.dataRestFrom.length) {
        return [];
      }
      return Object.keys(this.dataRestFrom[0]).filter((key) => key[0] !== '_');
    },
    changedInputData() {
      return this.$store.state[this.idDashFrom][this.idFrom]?.switch;
    },
  },
  watch: {
    storedElement(element) {
      if (
        element?.selected !== undefined
        && this.value !== element.selected.elemDeep
      ) {
        this.loadSelectedValue();
      }
    },
    getElementSelected(selected) {
      this.value = selected.elemDeep;
    },
    changedInputData() {
      this.dataField = null;
      this.value = '';
      this.$store.commit('setSelected', {
        element: 'elemDeep',
        idDash: this.idDashFrom,
        id: this.idFrom,
        value: '',
      });
    },
    values(list) {
      this.detectSliderValue(list);
    },
    sliderValue(value) {
      if (!this.loading && this.values.length > 0) {
        this.value = this.values[value];
      }
    },
    dataRestFrom(dataRestFrom) {
      if (!this.dataField && dataRestFrom.length) {
        const keys = Object.keys(dataRestFrom[0]).filter(
          (key) => key[0] !== '_',
        );
        if (keys.length === 1) {
          [this.dataField] = keys;
        }
      }
    },
    dataField(value) {
      this.$nextTick(() => {
        if (typeof value !== 'undefined') {
          this.$store.commit('setSelected', {
            element: 'elem',
            idDash: this.idDashFrom,
            id: this.idFrom,
            value,
          });
          this.changeValue();
        }
      });
    },
    percentValue() {
      this.detectSliderValue(this.values);
    },
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDashFrom,
      id: this.idFrom,
    });
    this.$nextTick(() => {
      this.circularSizeNew();
      this.loadSelectedValue();
    });
  },
  methods: {
    ...mapActions(['actionGetElementSelected']),
    ...mapMutations(['setElementSelected']),
    circularSizeNew() {
      if (this.$attrs['is-full-screen']) {
        this.circularWidth = 40;
        this.circularSize = 450;
      }
    },
    addValue(val) {
      // +/- buttons
      this.sliderValue += val;
      this.changeValue();
    },
    onChangeSlider() {
      this.changeValue();
    },
    changeValue() {
      this.$nextTick(() => {
        this.setToken();
        this.storeValue();
      });
    },
    storeValue() {
      this.setElementSelected({
        element: 'elemDeep',
        idDash: this.idDashFrom,
        id: this.idFrom,
        value: this.value || 0,
      });
    },
    setToken() {
      this.$store.state[this.idDashFrom]?.tockens?.forEach((token) => {
        if (token.elem === this.idFrom && token.action === 'change') {
          this.$store.commit('setTocken', {
            token: {
              name: token.name,
              action: 'change',
              capture: '',
            },
            idDash: this.idDashFrom,
            value: this.value,
          });
        }
      });
    },
    loadSelectedValue() {
      this.actionGetElementSelected({
        idDash: this.idDashFrom,
        id: this.idFrom,
      }).then((selected) => {
        if (selected) {
          this.dataField = selected?.elem || null;
          this.value = selected?.elemDeep !== '' ? selected?.elemDeep : '';
        }
      });
      this.detectSliderValue();
    },
    detectSliderValue(values = this.values) {
      this.sliderValue = values.findIndex((item) => item === this.value);
      if (this.value === '' && values?.length > 0) {
        console.log('values[this.sliderValue]', values[this.sliderValue]);
        this.value = values[this.sliderValue];
      }
    },
  },
};
</script>

<style lang="sass">
.dash-map
  color: var(--main_text) !important
  min-width: 360px
  height: calc(100% - 50px)
  display: flex
  justify-content: center
  align-items: center

  .v-input__append-inner
    margin-top: 16px

  .slider-vertical
    height: 100%
    padding-right: 60px

    .v-slider--vertical
      min-height: 220px

  &.full-screen
    min-width: 690px
    .v-input__slot
      height: 100%
    .v-slider--vertical
      min-height: 470px
    .text-h4
      font-size: 62px !important
    .v-size--default
      padding: 25px 48px
  &.min-size
    min-width: 210px
    .slider-vertical
      padding-right: 10px
      .v-slider--vertical
        min-height: 105px
    .v-btn:not(.v-btn--round).v-size--default
      height: 26px
      min-width: 47px
      padding: 0 6px
    .text-h4
      font-size: 1.125rem !important
</style>
