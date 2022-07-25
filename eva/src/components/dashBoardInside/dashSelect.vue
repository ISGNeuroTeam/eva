<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      class="dash-select"
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
    >
      <div
        v-if="show"
        ref="selectBlock"
        class="select-with-data"
      >
        <arrow-block
          v-if="dataModeFrom"
          :state="open"
          @toggle="openSelect"
        />
        <div
          class="source"
          :class="{ source_show: source_show }"
          :style="{ width: widthInput }"
        >
          <v-select
            v-model="elem"
            :items="dataRest"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text, fill: theme.$main_text }"
            hide-details
            outlined
            class="select-parent"
            :loading="dataLoading"
            label="Столбец данных"
            @change="getItem('elem')"
          />
          <v-select
            v-model="elemlink"
            :items="dataRest"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text, fill: theme.$main_text }"
            hide-details
            outlined
            class="select-parent"
            label="Связанный столбец данных"
            :loading="dataLoading"
            @change="getItem('elemlink')"
          />
        </div>
        <div
          ref="targetBlock"
          class="target"
          :style="{ width: widthInput, borderColor: theme.$main_border }"
          :class="{ select_show: select_show }"
        >
          <v-autocomplete
            v-model="elemDeep[String(multiple)]"
            :items="dataRestDeep"
            solo
            flat
            :multiple="multiple"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text, fill: theme.$main_text }"
            hide-details
            class="select theme--dark"
            label="Значение"
            @change="setTocken"
          >
            <template
              v-if="multiple"
              v-slot:prepend-item
            >
              <v-list-item
                ripple
                @click="selectItems"
              >
                <v-list-item-action>
                  <v-icon
                    :color="
                      elemDeep[String(multiple)].length > 0
                        ? theme.$primary_button
                        : theme.$main_text
                    "
                  >
                    {{ chooseIcon }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ chooseText }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2" />
            </template>
          </v-autocomplete>
        </div>
      </div>
      <div
        v-if="!show"
        class="error-msg"
      >
        {{ message }}
      </div>
    </div>
  </portal>
</template>

<script>
import {
  mdiCropSquare,
  mdiSquare,
} from '@mdi/js';
import ArrowBlock from '../arrowBlock.vue';
import defaultSourceData from '../../mixins/defaultSourceData';

export default {
  name: 'DashSelect',
  components: { ArrowBlock },
  mixins: [
    defaultSourceData,
  ],
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    colorFrom: {
      type: Object,
      required: true,
    },
    dataLoadingFrom: null,
    loading: {
      type: Boolean,
      default: false,
    },
    dataModeFrom: {
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
      message: '',
      show: true,
      elem: 'Выберите столбец данных',
      elemlink: 'Выберите связанный столбец данных',
      elemDeep: {
        true: [],
        false: '',
      },
      topArray: [],
      bottomArray: [],
      open: true,
      source_show: true,
      select_show: false,
      dataFromRest: {},
      legends: {},
      chooseText: 'Выбрать все',
      chooseIcon: mdiCropSquare,
      actions: [
        { name: 'click', capture: [] },
        { name: 'change', capture: [] },
        { name: 'mouseover', capture: [] },
      ],
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    dataReady() {
      let data = [];
      if (this.dataRestFrom != null) {
        data = this.dataRestFrom;
      }
      return data;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    widthInput() {
      return `${this.sizeFrom.width - 70}px`;
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
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
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    multiple() {
      const options = this.getOptions;
      if (options.multiple) {
        return options.multiple;
      }
      return false;
    },
    dataRest() {
      let data = [];
      if (this.dataReady.length > 0) {
        data = Object.keys(this.dataReady);
        if (Object.keys(this.dataReady).length !== 0) {
          if (!this.dataReady.error) {
            data = Object.keys(this.dataReady[0])
              .filter((item) => !this.dataReady
                .map((x) => x[item]).every((x) => x === null));
          }
        }
      }
      return data;
    },
    dataRestDeep() {
      let res = [];
      if (this.dataReady.length > 0 && this.dataReady[0][this.elem]) {
        const data = this.dataReady;
        res = Object.values(data).map((item) => item[this.elem]);

        res = this.filterSelect(res, this.elemDeep.true);
      }

      return res;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getSelected() {
      if (!this.dashFromStore.selected) {
        this.$store.commit('setState', [{
          object: this.dashFromStore,
          prop: 'selected',
          value: {
            elem: '',
            elemlink: '',
            elemDeep: '',
          },
        }]);
      }

      return this.dashFromStore.selected;
    },
    selectedElem() {
      return this.getSelected.elem;
    },
    selectedElemLink() {
      return this.getSelected.elemlink;
    },
    selectedElemDeep() {
      return this.getSelected.elemDeep;
    },
    dataLoading() {
      return this.dataLoadingFrom;
    },
    // Стктус загрузки ИД для дефолтного значения
    changedDataDefaultLoading() {
      if (this.dataLoadingFrom) {
        return false;
      }
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
    'dashFromStore.options.defaultFromSourceData': {
      deep: true,
      handler(val, oldVal) {
        if (val !== oldVal) {
          this.setTocken();
        }
      },
    },
    selectedElemDeep(val) {
      if (val === null || val.elemDeep === '') {
        this.$store.commit('setState', [{
          object: this.elemDeep,
          prop: String(this.multiple),
          value: String(this.multiple) === 'true' ? [] : '',
        }]);
      }
    },
    selectedElemLink() {
      if (this.selectedElemLink.elemlink === '') {
        this.elemlink = 'Выберите связанный столбец данных';
      }
    },
    selectedElem(elem) {
      if (elem === '') {
        this.elem = 'Выберите столбец данных';
      }
    },
    dataReady(dataReady) {
      this.updateActions(dataReady);
    },
    // Загрузился ИД для дефотла
    changedDataDefaultLoading(val, oldVal) {
      const {
        multiple,
      } = this;
      if (val === false && val !== oldVal) {
        const defaultValue = this.getDefaultValue();
        if (defaultValue != null && this.dataRestDeep.includes(defaultValue)) {
          this.elemDeep[String(multiple)] = multiple
            ? [defaultValue]
            : defaultValue;
        }
        this.setTocken();
      }
    },
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
    if (this.dataReady.length > 0) {
      this.updateActions(this.dataReady);
    }
    const selected = this.getSelected;
    if (selected) {
      if (selected.elem) {
        this.elem = selected.elem;
      }
      if (selected.elemlink) {
        this.elemlink = selected.elemlink;
      }
      if (
        this.elem !== 'Выберите элемент'
        && this.elemlink !== 'Выберите связанный столбец данных'
      ) {
        this.openSelect();
      }
      if ((selected.elemDeep && selected.elemDeep.length !== 0) || selected.elemDeep !== '') {
        this.elemDeep[String(this.multiple)] = selected.elemDeep;
        this.chooseText = 'Очистить Все';
        this.chooseIcon = mdiSquare;
      } else {
        this.chooseText = 'Выбрать все';
        this.chooseIcon = mdiCropSquare;
      }
    }
  },
  methods: {
    updateActions(dataReady) {
      let data = [];
      if (dataReady.length > 0) {
        data = Object.keys(dataReady);
        this.show = true;
        if (Object.keys(dataReady).length !== 0) {
          if (dataReady.error) {
            this.message = dataReady.error;
            this.show = false;
          } else {
            data = Object.keys(dataReady[0]);
          }
        }
        this.dataFromRest = data;
        this.actions.forEach((action) => {
          this.$store.commit('setState', [{
            object: action,
            prop: 'capture',
            value: data,
          }]);
        });
      }
    },
    getItem(element) {
      switch (element) {
        case 'elem':
          this.$store.commit('setSelected', {
            element: 'elem',
            value: this.elem,
            idDash: this.idDash,
            id: this.id,
          });
          break;
        case 'elemlink':
          this.$store.commit('setSelected', {
            element: 'elemlink',
            value: this.elemlink,
            idDash: this.idDash,
            id: this.id,
          });
          break;
        default:
          break;
      }
      if (
        this.elem !== 'Выберите элемент'
        && this.elemlink !== 'Выберите связанный столбец данных'
      ) {
        this.openSelect();
      }
      this.chooseText = 'Очистить Все';
      this.selectItems();
    },
    openSelect() {
      this.source_show = !this.source_show;
      this.open = !this.open;
      this.select_show = !this.select_show;
    },
    selectItems() {
      if (this.chooseText === 'Выбрать все') {
        this.chooseText = 'Очистить Все';
        this.chooseIcon = mdiSquare;
        this.elemDeep.true = [...this.topArray, ...Array.from(new Set(this.bottomArray))];
      } else {
        this.chooseText = 'Выбрать все';
        this.chooseIcon = mdiCropSquare;
        this.elemDeep.true = [];
      }
      this.setTocken();
    },
    filterSelect(res, selected) {
      let data = [...[], ...res];
      data = data.filter((elem) => !selected.includes(elem));

      function sorted(sortData) {
        sortData = Number(sortData[0]) ? sortData.sort((a, b) => a - b) : sortData.sort();
        return sortData;
      }

      this.topArray = sorted([...selected]);
      this.bottomArray = sorted([...data]);

      data = [...this.topArray, ...this.bottomArray];

      return data;
    },
    setTocken() {
      if (this.loading !== false) {
        return;
      }
      const defaultValue = this.getDefaultValue();
      if (defaultValue != null && this.dataRestDeep.includes(defaultValue)) {
        if (this.multiple) {
          if (this.elemDeep[String(this.multiple)].length === 0) {
            this.elemDeep[String(this.multiple)] = [defaultValue];
          }
        } else if (!this.elemDeep[String(this.multiple)]) {
          this.elemDeep[String(this.multiple)] = defaultValue;
        }
      }
      const elemDeepValue = this.elemDeep[String(this.multiple)];
      this.$store.commit('setSelected', {
        element: 'elemDeep',
        value: this.elemDeep[String(this.multiple)],
        idDash: this.idDash,
        id: this.id,
      });
      const { tockens } = this.$store.state[this.idDash];

      let curTocken = {};
      const data = this.dataReady;
      if (tockens) {
        Object.keys(tockens).forEach((key) => {
          if (tockens[key].elem === this.id && tockens[key].action === 'change') {
            curTocken = tockens[key];

            let value = [];

            if (String(this.multiple) === 'true') {
              elemDeepValue.forEach((elem) => {
                const addValues = data.filter((x) => elem === x[this.elem])
                  .map((x) => x[this.elemlink])
                  .reduce((a, b) => (a.includes(b) ? a : [...a, b]), []);
                value.push(...addValues);
              });
            } else {
              if (elemDeepValue !== null) {
                if (Array.isArray(elemDeepValue)) {
                  value = [...[], ...String(elemDeepValue)];
                } else {
                  value = [String(elemDeepValue)];
                }
              }
              for (let i = 0; i < data.length; i += 1) {
                if (data[i][this.elem] === elemDeepValue) {
                  value = [data[i][curTocken.capture]];
                  break;
                }
              }
            }

            if (curTocken.prefix && curTocken.prefix !== '') {
              value = value.map((item) => `${curTocken.prefix}${item}`);
            }
            if (curTocken.sufix && curTocken.sufix !== '') {
              value = value.map((item) => `${item}${curTocken.sufix}`);
            }
            if (curTocken.delimetr && curTocken.delimetr !== '') {
              value = value.join(curTocken.delimetr);
            } else if (value) {
              value = value.join(',');
            }

            const token = {
              name: tockens[key].name,
              action: 'change',
              capture: tockens[key].capture,
            };
            if (token.name !== '') {
              this.$store.commit('setTocken', {
                token,
                idDash: this.idDash,
                value,
              });
            }
          }
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashSelect.sass';
</style>
