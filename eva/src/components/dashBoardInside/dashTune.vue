<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      ref="container"
      class="dash-map"
      :class="getClasses"
      :style="getStyles"
    >
      <arrow-block
        v-if="dataModeFrom"
        :state="needSetField"
        @toggle="isOpen = !isOpen"
      />
      <div v-if="needSetField">
        <v-select
          v-model="dataField"
          :dark="isDarkTheme"
          :items="fieldList"
          label="Столбец данных"
          outlined
        />
      </div>
      <div
        v-else
        class="flex flex-grow-1 justify-center align-center"
        :class="{ row: vertical }"
      >
        <div class="flex-grow-0">
          <v-slider
            v-model="sliderValue"
            :class="{ 'slider-vertical': vertical }"
            :dark="true"
            :disabled="loading || values.length === 0"
            :min="0"
            :max="values.length - 1"
            :vertical="vertical"
            :color="theme.$primary_button"
            ticks="always"
            @change="onChangeSlider"
          />
        </div>
        <div class="pt-4 d-flex flex-column align-center">
          <v-progress-circular
            :rotate="360"
            :size="circularSize"
            :width="circularWidth"
            :value="percentValue"
            :color="loading ? theme.$secondary_border : theme.$primary_button"
            :class="value === 0 ? 'dash-map__min-value' : ''"
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
  </portal>
</template>

<script>
import { mdiMinus, mdiPlus } from '@mdi/js';
import { mapActions, mapMutations } from 'vuex';
import ArrowBlock from '../arrowBlock.vue';
import defaultSourceData from '../../mixins/defaultSourceData';

export default {
  name: 'DashTune',
  components: { ArrowBlock },
  mixins: [
    defaultSourceData,
  ],
  inheritAttrs: false,
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
      default: false,
    }, // включена ли шапка
    loading: {
      type: Boolean,
      default: false,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
    dataSources: {
      type: Object,
      default: () => ({}),
    },
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
      isOpen: true,
    };
  },
  computed: {
    circularSize() {
      if (this.sizeFrom.width > 775 && this.sizeFrom.height > 775) {
        return this.sizeFrom.height - 177;
      }
      if (this.sizeFrom.width > 200 && this.sizeFrom.height > 200) {
        if (this.sizeFrom.width < this.sizeFrom.height) {
          return this.sizeFrom.width - 147;
        }
        return this.sizeFrom.height - 147;
      }
      return 60;
    },
    circularWidth() {
      return this.circularSize / 10;
    },
    circularResize() {
      return this.circularSize > 400 && this.sizeFrom.height > 775 && this.sizeFrom.width > 775;
    },
    minSize() {
      return this.sizeFrom.width < 300 || this.sizeFrom.height < 300;
    },
    htmlZoom() {
      const size = this.sizeFrom.height < this.sizeFrom.width
        ? this.sizeFrom.height
        : this.sizeFrom.width;
      return size / 370;
    },
    isFullScreen() {
      return this.fullScreenMode;
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
      return (!this.dataField && !this.loading) || this.isOpen;
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
    getStyles() {
      const styles = Object.entries(this.customStyle)
        .map((arg) => arg.join(':'))
        .join(';');
      return `${styles}${this.needSetField ? ' zoom: 1' : ` zoom: ${this.htmlZoom}`}`;
    },
    getClasses() {
      return `${this.customClass} ${this.isFullScreen || this.circularResize ? 'full-screen ' : ''} ${this.minSize ? 'min-size' : ''}`;
    },
    // Стктус загрузки ИД для дефолтного значения
    changedDataDefaultLoading() {
      const {
        defaultFromSourceData = null,
        defaultSourceDataUpdates = false,
      } = this.dashFromStore.options;
      if (defaultFromSourceData !== null && defaultSourceDataUpdates) {
        const {
          loading,
        } = this.dataSources[defaultFromSourceData];
        return loading;
      }
      return true;
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
    dataRestFrom(newVal, oldVal) {
      if (newVal.length > 0 && oldVal.length > 0) {
        // TODO: оставил так как не уверен что данное решение верное
        // if (!this.dataField) {
        //   const keys = Object.keys(dataRestFrom[0]).filter(
        //     (key) => key[0] !== '_',
        //   );
        //   if (keys.length === 1) {
        //     [this.dataField] = keys;
        //   }
        // }
        this.dataField = '';
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
          this.isOpen = false;
        }
      });
    },
    percentValue() {
      this.detectSliderValue(this.values);
    },
    'dashFromStore.options.defaultFromSourceData': {
      deep: true,
      handler() {
        this.onChangeSlider();
      },
    },
    // Загрузился ИД для дефотла
    changedDataDefaultLoading(val, oldVal) {
      if (val === false && val !== oldVal) {
        this.setDefaultValueIfExists();
        this.setToken();
        this.storeValue();
      }
    },
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDashFrom,
      id: this.idFrom,
    });
    this.$nextTick(() => {
      this.loadSelectedValue();
    });
  },
  methods: {
    ...mapActions(['actionGetElementSelected']),
    ...mapMutations(['setElementSelected']),
    addValue(val) {
      // +/- buttons
      this.sliderValue += val;
      this.changeValue();
    },
    onChangeSlider() {
      this.changeValue();
    },
    setDefaultValueIfExists() {
      const defaultValue = this.getDefaultValue();
      if (defaultValue !== null && this.values.includes(defaultValue)) {
        this.value = defaultValue;
        return true;
      }
      return false;
    },
    changeValue() {
      this.$nextTick(() => {
        if (this.value === undefined || this.value === 0) {
          this.setDefaultValueIfExists();
        }
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
  height: calc(100% - 25px)
  display: flex
  justify-content: center

  .v-progress-circular__overlay
    transition: all .3s ease-in-out
    opacity: 1

  &__min-value
    .v-progress-circular__overlay
      opacity: 0

  .v-slider__track-background
    background-color: var(--secondary_border) !important
    border-color: var(--secondary_border) !important

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
