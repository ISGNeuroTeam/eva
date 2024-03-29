<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :id="`select-block-${idFrom}`"
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
          :class="{
            source_show: source_show
          }"
          :style="{
            width: widthInput
          }"
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
            label="Данные для отображения"
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
            label="Связанные данные"
            :loading="dataLoading"
            @change="getItem('elemlink')"
          />
        </div>
        <div
          ref="targetBlock"
          class="target"
          :style="{
            width: widthInput,
            borderColor: theme.$main_border,
          }"
          :class="{
            select_show: select_show,
          }"
        >
          <v-autocomplete
            ref="multiselect"
            v-model="elemDeep[`${multiple}`]"
            :items="dataRestDeep"
            solo
            flat
            :filter="onFilterItems"
            :multiple="multiple"
            :color="theme.$accent_ui_color"
            :style="{
              color: theme.$main_text,
              fill: theme.$main_text,
            }"
            :menu-props="{
              zIndex: 100,
              attach: `#select-block-${idFrom}`,
              offsetOverflow: false,
            }"
            hide-details
            class="select theme--dark"
            label="Значение"
            clearable
            @change="setTockenDelay('change')"
            @click="setTockenDelay('click')"
            @mouseover="setTockenDelay('mouseover')"
            @keydown.enter="onPressEnter"
            @keydown.backspace="onPressBackspace"
            @update:list-index="updateListIndex"
          >
            <template v-slot:item="{ item, attrs, on }">
              <v-list-item
                ripple
                v-on="on"
                @click="setTockenDelay('click')"
              >
                <v-list-item-action v-if="multiple">
                  <v-icon :color="theme.$main_text">
                    {{ attrs['aria-selected'] === "true"
                      ? "eva-basic_checkbox_checked"
                      : "eva-basic_checkbox" }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <template
              v-if="multiple && ($refs.multiselect && !$refs.multiselect.lazySearch)"
              v-slot:prepend-item
            >
              <v-row
                v-ripple
                class="px-4 py-3 primary--text"
                style="cursor:pointer;"
                @click="selectItems"
              >
                <v-col class="flex-grow-0">
                  <v-icon
                    :color="
                      elemDeep[`${multiple}`].length > 0
                        ? theme.$primary_button
                        : theme.$main_text
                    "
                  >
                    {{ chooseIcon }}
                  </v-icon>
                </v-col>
                <v-col>
                  <div class="pl-2">
                    {{ chooseText }}
                  </div>
                </v-col>
              </v-row>
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
      open: true,
      source_show: true,
      select_show: false,
      dataFromRest: {},
      legends: {},
      chooseText: 'Выбрать все',
      chooseIcon: 'eva-basic_checkbox',
      actions: [
        { name: 'click', capture: [] },
        { name: 'change', capture: [] },
        { name: 'mouseover', capture: [] },
        { name: 'closemenu', capture: [] },
      ],
      autocomplite: false,
      listIndex: -1,
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
        this.$store.commit('setDefaultOptions', {
          id: this.id,
          idDash: this.idDash,
        });
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
        if (!this.dataReady.error) {
          data = Object.keys(this.dataReady[0]);
          // .filter((item) => !this.dataReady.map((x) => x[item]).every((x) => x === null));
        } else {
          data = Object.keys(this.dataReady);
        }
      }
      return data;
    },
    dataRestDeep() {
      let res = [];
      const validValue = this.dataReady.length > 0
          && typeof this.dataReady[0][this.elem] !== 'undefined';
      if (validValue) {
        const data = this.dataReady;
        res = Object.values(data).map((item) => item[this.elem]);

        res = this.filterSelect(res, this.multiple
          ? this.elemDeep.true
          : [this.elemDeep.false]);
      }

      return [...new Set(res)];
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
    getTokensFromStore() {
      if (this.$store.state[this.idDash]?.tockens?.length > 0) {
        return this.$store.state[this.idDash].tockens;
      }
      return [];
    },
    isMenuActive() {
      return !!this.autocomplite?.isMenuActive;
    },
  },
  watch: {
    isMenuActive(val, oldVal) {
      if (val !== oldVal) {
        if (val) {
          this.autocomplite.$el.dispatchEvent(
            new Event(
              'mousedown',
              {
                bubbles: true,
              },
            ),
          );
          this.autocomplite.$el.dispatchEvent(
            new Event(
              'mouseup',
              {
                bubbles: true,
              },
            ),
          );
        } else {
          this.setTockenDelay('closemenu');
        }
      }
    },
    'dashFromStore.options.defaultFromSourceData': {
      deep: true,
      handler(val, oldVal) {
        if (val !== oldVal) {
          this.setDefaultValue();
          this.setTocken();
        }
      },
    },
    selectedElemDeep(val) {
      if (val === null || val.elemDeep === '') {
        this.$store.commit('setState', [{
          object: this.elemDeep,
          prop: `${this.multiple}`,
          value: `${this.multiple}` === 'true'
            ? []
            : '',
        }]);
      } else if (`${this.selectedElem}` !== `${val}`) {
        this.$store.commit('setState', [{
          object: this.elemDeep,
          prop: `${this.multiple}`,
          value: `${this.multiple}` === 'true'
            ? [...val]
            : val,
        }]);
      }
    },
    selectedElemLink() {
      if (this.selectedElemLink.elemlink === '') {
        this.elemlink = 'Выберите связанный столбец данных';
      }
      this.setTocken();
    },
    selectedElem(elem) {
      if (elem === '') {
        this.elem = 'Выберите столбец данных';
      }
    },
    dataReady() {
      if (this.getOptions?.resetValuesWhichAreNot) {
        this.setTocken();
      }
    },
    'elemDeep.true': {
      handler() {
        this.updateSelectAllItem();
      },
    },
    dataRestDeep() {
      this.updateSelectAllItem();
    },
    dataFromRest() {
      const {
        defaultSourceDataUpdates = false,
      } = this.dashFromStore.options;
      if (defaultSourceDataUpdates) {
        this.setDefaultValue();
        this.setTocken();
      }
    },
    // Загрузился ИД для дефотла
    changedDataDefaultLoading(val, oldVal) {
      if (val === false && val !== oldVal) {
        this.setDefaultValue();
        this.setTocken();
      }
    },
  },
  mounted() {
    this.autocomplite = this.$refs.multiselect;
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
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
        this.elemDeep[`${this.multiple}`] = selected.elemDeep;
      }
    }
  },
  methods: {
    updateListIndex(index) {
      this.listIndex = index;
    },
    setDefaultValue() {
      // Значение "по-умолчанию"
      const defaultValue = this.getDefaultValue();
      // Если оно корректно и есть в датасете
      if (defaultValue != null && this.dataRestDeep.includes(defaultValue)) {
        const value = this.elemDeep[`${this.multiple}`];
        // Если это мультиселект
        if (this.multiple) {
          // Если нет значения(в селекте)
          if (value.length === 0) {
            this.$set(this.elemDeep, `${this.multiple}`, [defaultValue]);
          } else {
            const filteredValue = value.filter((el) => this.dataRestDeep.includes(el));
            // Если значения(в селекте) отсутствуют в датасете
            if (filteredValue.length === 0) {
              this.$set(this.elemDeep, `${this.multiple}`, [defaultValue]);
            }
          }
          // Если нет значения(в селекте) ИЛИ оно отсутствует в датасете
        } else {
          this.$set(this.elemDeep, `${this.multiple}`, defaultValue);
        }
      }
    },
    updateSelectAllItem() {
      if (this.multiple) {
        if (this.elemDeep.true.length !== this.dataRestDeep.length) {
          this.chooseText = 'Выбрать все';
          this.chooseIcon = 'eva-basic_checkbox';
        } else {
          this.chooseText = 'Очистить все';
          this.chooseIcon = 'eva-basic_checkbox_checked';
        }
      }
    },
    onFilterItems(item, queryText, itemText) {
      const { searchMode = 'contains' } = this.getOptions; // contains, begin
      const foundIdx = this.toSearchString(itemText)
        .indexOf(
          this.toSearchString(queryText),
        );
      if (searchMode === 'begin') {
        return foundIdx === 0;
      }
      return foundIdx > -1;
    },
    toSearchString(str) {
      return str.toLocaleLowerCase().replaceAll(' ', ' ');
    },
    onPressBackspace() {
      if (this.multiple) {
        setTimeout(() => {
          this.$refs.multiselect.$refs.menu.listIndex = -1;
        }, 10);
      }
    },
    // выбор из списка по enter если отфильтрован один вариант
    onPressEnter() {
      const {
        isMenuActive,
        filteredItems,
      } = this.$refs.multiselect;
      if (isMenuActive && filteredItems.length === 1) {
        this.$refs.multiselect.selectItem(filteredItems[0]);
        this.$refs.multiselect.lazySearch = '';
        if (this.multiple) {
          this.$refs.multiselect.$refs.menu.listIndex = -1;
        }
      } else if (filteredItems.length > 1) {
        if (this.listIndex > -1) {
          this.$refs.multiselect.selectItem(filteredItems[this.listIndex]);
          this.$refs.multiselect.lazySearch = '';
          if (this.multiple) {
            this.$refs.multiselect.$refs.menu.listIndex = -1;
          }
        } else if (this.$refs.multiselect.$refs.menu.listIndex === -1) {
          this.$refs.multiselect.selectItem(filteredItems[0]);
          this.$refs.multiselect.lazySearch = '';
        }
      }
      if (this.getOptions?.closeListByEnter && isMenuActive) {
        setTimeout(() => {
          this.$refs.multiselect.blur();
        }, 30);
      }
      return true;
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
      this.chooseText = 'Очистить все';
      this.selectItems();
    },
    openSelect() {
      this.source_show = !this.source_show;
      this.open = !this.open;
      this.select_show = !this.select_show;
    },
    selectItems() {
      if (this.chooseText === 'Выбрать все') {
        this.elemDeep.true = [...this.dataRestDeep];
      } else {
        this.elemDeep.true = [];
      }
      this.setTockenDelay();
    },
    filterSelect(items, selected) {
      if (this.getOptions?.resetValuesWhichAreNot) {
        const existsItems = this.dataReady.map((item) => item[this.elem]);
        selected = selected.filter((elem) => !!existsItems.includes(elem));
        if (this.multiple) {
          this.elemDeep.true = selected;
        } else if (!existsItems.includes(this.elemDeep.false)) {
          this.elemDeep.false = '';
        }
      }
      if (this.getOptions?.selectedValuesAbove) {
        return [...selected, ...items.filter((elem) => !selected.includes(elem))];
      }
      return items;
    },
    setTockenDelay(actionType = 'change') {
      const toKey = `_timeout_${actionType}`;
      if (this[toKey]) {
        clearTimeout(this[toKey]);
        this[toKey] = null;
      }
      this[toKey] = setTimeout(() => {
        this.setTocken(actionType);
        this[toKey] = null;
      }, 500);
    },
    setTocken(actionType = 'change') {
      if (this.loading !== false) {
        return;
      }
      // this.setDefaultValue();
      let elemDeepValue = this.elemDeep[`${this.multiple}`];
      if (this.getOptions?.resetValuesWhichAreNot) {
        const existsItems = this.dataReady.map((item) => item[this.elem]);
        if (elemDeepValue.filter) {
          elemDeepValue = elemDeepValue.filter((elem) => !!existsItems.includes(elem));
        }
      }
      this.$store.commit('setSelected', {
        element: 'elemDeep',
        value: elemDeepValue,
        idDash: this.idDash,
        id: this.id,
      });
      const tockens = this.getTokensFromStore;

      let curTocken = {};
      const data = this.dataReady;
      if (tockens) {
        Object.keys(tockens).forEach((key) => {
          if (tockens[key].elem === this.id && tockens[key].action === actionType) {
            curTocken = tockens[key];

            let value = [];

            if (`${this.multiple}` === 'true') {
              elemDeepValue.forEach((elem) => {
                const addValues = data.filter((x) => elem === x[this.elem])
                  .map((x) => x[curTocken.capture])
                  .reduce((a, b) => (a.includes(b) ? a : [...a, b]), []);
                value.push(...addValues);
              });
            } else {
              if (
                elemDeepValue !== undefined
                  && elemDeepValue !== null
                  && elemDeepValue !== ''
              ) {
                if (Array.isArray(elemDeepValue)) {
                  value = [...[], ...`${elemDeepValue}`];
                } else if (!this.getOptions?.resetValuesWhichAreNot) {
                  value = [`${elemDeepValue}`];
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
              action: actionType,
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
