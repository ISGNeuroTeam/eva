<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      ref="container"
      class="dash-accumulator"
      :class="getClasses"
      :style="getStyles"
    >
      <div v-if="needSetField">
        <v-select
          v-model="dataFieldLabel"
          :dark="isDarkTheme"
          :items="fieldList"
          label="Столбец подписей"
          outlined
        />
        <v-select
          v-model="dataFieldValue"
          :dark="isDarkTheme"
          :items="fieldList"
          label="Столбец значений"
          outlined
        />
        <v-select
          v-model="dataFieldMax"
          :dark="isDarkTheme"
          :items="fieldList"
          label="Столбец максимумов"
          outlined
        />
      </div>
      <div
        v-else
        style="width: 100%"
        class=""
      >
        <div
          :style="`border-left: 1px solid ${ theme.$secondary_border }`"
          style="padding: 10px 0;"
        >
          <div
            v-for="({label, value, max, color}, index) in newValues"
            :key="index"
            class="dash-accumulator__element"
            :style="
              `color: ${theme.$main_text}; `
                + 'background: linear-gradient(to right, '
                +`${color} ${value/max*100}%, `
                +`${theme.$secondary_border} ${value/max*100}%);`
            "
          >
            <div class="dash-accumulator__label">
              {{ label }}
            </div>
            <div class="dash-accumulator__value">
              {{ value }}
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

export default {
  name: 'DashAccumulator',
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
      dataFieldMax: null, // поле с данными
      dataFieldValue: null, // поле с данными
      dataFieldLabel: null, // поле с данными
    };
  },
  computed: {
    idDash() {
      return this.idDashFrom;
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit(
          'setDefaultOptions',
          {
            id: this.idFrom,
            idDash: this.idDash,
          },
        );
      }
      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options?.fillColor) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'fillColor',
          value: {
            type: 'color',
            color: this.theme.$primary_button,
          },
        }]);
      }
      if (!this.dashFromStore.options.pieType) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pieType',
          value: 'pie',
        }]);
      }
      if (!this.dashFromStore.options.metrics) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'metrics',
          value: [],
        }]);
      }
      return this.dashFromStore.options;
    },
    newValues() {
      if (
        this.dataFieldMax
        && this.dataFieldValue
        && this.dataFieldLabel
      ) {
        return this.dataRestFrom.map((item, index) => ({
          label: item[this.dataFieldLabel],
          value: item[this.dataFieldValue],
          max: item[this.dataFieldMax],
          color: this.getFillColor(item, index),
        }));
      }
      return [];
    },
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
      return (!this.dataFieldLabel
          || !this.dataFieldValue
          || !this.dataFieldMax)
          && !this.loading;
    },
    theme() {
      return this.colorFrom;
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
      return `${this.customStyle}${this.needSetField ? ' zoom: 1' : ` zoom: ${this.htmlZoom}`}`;
    },
    getClasses() {
      return `${this.customClass} ${this.isFullScreen || this.circularResize ? 'full-screen ' : ''} ${this.minSize ? 'min-size' : ''}`;
    },
  },
  watch: {
    getElementSelected(selected) {
      if (selected) {
        this.dataFieldLabel = selected?.elem.label || null;
        this.dataFieldValue = selected?.elem.value || null;
        this.dataFieldMax = selected?.elem.max || null;
      }
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
    dataRestFrom: {
      handler(newVal, oldVal) {
        this.setMetrics();
        if (newVal.length > 0 && oldVal.length > 0) {
          this.dataFieldMax = null;
          this.dataFieldValue = null;
          this.dataFieldLabel = null;
        }
      },
      deep: true,
      immediate: true,
    },
    dataFieldMax() {
      this.setSelected();
    },
    dataFieldValue() {
      this.setSelected();
    },
    dataFieldLabel() {
      this.setSelected();
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
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDashFrom,
      id: this.idFrom,
    });
    this.loadSelectedValue();
  },
  methods: {
    ...mapActions(['actionGetElementSelected']),
    ...mapMutations(['setElementSelected']),
    setMetrics() {
      const metrics = this.dataRestFrom.map((item) => ({
        // eslint-disable-next-line no-eval
        range: item.metadata ? eval(`({obj:[${item.metadata}]})`).obj[0] : null,
      }));
      this.$store.commit('setState', [{
        object: this.getOptions,
        prop: 'metrics',
        value: metrics,
      }]);
    },
    getFillColor(item, index) {
      if (this.getOptions.fillColor.length > 0) {
        if (this.getOptions.fillColor[index].colorType === 'color') {
          return this.getOptions.fillColor[index].color || this.theme.$primary_button;
        }
        // eslint-disable-next-line no-eval
        const metadata = eval(`({obj:[${item.metadata}]})`).obj[0];
        const persentage = (item.value / item.max) * 100;
        return Object.keys(metadata)
          .reverse()
          .reduce((acc, metadataKey) => {
            if (persentage > parseInt(metadata[metadataKey], 10) && !acc) {
              return metadataKey;
            }
            return acc;
          }, '');
      }
      return this.theme.$primary_button;
    },
    setSelected() {
      if (this.dataFieldMax
        && this.dataFieldValue
        && this.dataFieldLabel
      ) {
        this.$store.commit('setSelected', {
          element: 'elem',
          idDash: this.idDashFrom,
          id: this.idFrom,
          value: {
            label: this.dataFieldLabel,
            value: this.dataFieldValue,
            max: this.dataFieldMax,
          },
        });
      }
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
          this.dataFieldLabel = selected?.elem.label || null;
          this.dataFieldValue = selected?.elem.value || null;
          this.dataFieldMax = selected?.elem.max || null;
        }
      });
    },
  },
};
</script>

<style lang="scss">
.dash-accumulator {
  color: var(--main_text) !important;
  min-width: 360px;
  height: calc(100% - 25px);
  display: flex;
  justify-content: center;
  align-items: center;
  &.full-screen {
    min-width: 690px
  }
  &.min-size {
    min-width: 210px
  }

  &__element {
    margin: 0 0 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    padding-left: 10px;
  }
  &__value {
    padding-right: 10px;
  }
}

</style>
