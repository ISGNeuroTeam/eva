<template>
  <div class="dash-select">
    <div
      v-if="show"
      ref="selectBlock"
      class="select-with-data"
    >
      <div
        v-if="dataModeFrom"
        class="arrow-block"
      >
        <v-icon
          v-if="!open"
          class="arrow-down arrows-select"
          :color="theme.$primary_button"
          @click="openSelect"
        >
          {{ down }}
        </v-icon>
        <v-icon
          v-if="open"
          class="arrow-up arrows-select"
          :color="theme.$main_text"
          @click="openSelect"
        >
          {{ up }}
        </v-icon>
      </div>
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
</template>

<script>
import {
  mdiArrowDownBoldBoxOutline,
  mdiArrowUpBoldBoxOutline,
  mdiCropSquare,
  mdiSquare,
} from '@mdi/js';

export default {
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
    widthFrom: {
      type: Number,
      required: true,
    },
    dataModeFrom: {
      type: Boolean,
      required: true,
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
      down: mdiArrowDownBoldBoxOutline,
      up: mdiArrowUpBoldBoxOutline,
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
      return `${this.widthFrom - 70}px`;
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
            data = Object.keys(this.dataReady[0]);
          }
        }
      }
      return data;
    },
    dataRestDeep() {
      let res = [];
      if (this.dataReady.length > 0) {
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
      if (!this.selected) {
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
  },
  watch: {
    selectedElemDeep(val) {
      if (val.elemDeep === '') {
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
  },
  mounted() {
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
      if (selected.elemDeep.length !== 0 || selected.elemDeep !== '') {
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
        this.elemDeep.true = [...this.topArray, ...this.bottomArray];
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
      this.$store.commit('setSelected', {
        element: 'elemDeep',
        value: this.elemDeep[String(this.multiple)],
        idDash: this.idDash,
        id: this.id,
      });
      const { tockens } = this.$store.state[this.idDash];
      let name = '';
      let capture = '';
      let curTocken = {};
      const data = this.dataReady;
      Object.keys(tockens).forEach((i) => {
        if (tockens[i].elem === this.id && tockens[i].action === 'change') {
          curTocken = tockens[i];
          name = tockens[i].name;
          capture = tockens[i].capture;
        }
      });
      let value = null;
      if (String(this.multiple) === 'true') {
        value = [...[], ...this.elemDeep[String(this.multiple)]];
        for (let i = 0; i < data.length; i += 1) {
          value.forEach((deep, j) => {
            if (data[i][this.elem] === deep) {
              value[j] = data[i][this.elemlink];
            }
          });
        }
      } else {
        for (let i = 0; i < data.length; i += 1) {
          if (data[i][this.elem] === this.elemDeep[String(this.multiple)]) {
            value = [data[i][this.elemlink]];
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
      const tocken = {
        name,
        action: 'change',
        capture,
      };
      if (name !== '') {
        this.$store.commit('setTocken', {
          tocken,
          idDash: this.idDash,
          value,
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashSelect.sass';
</style>
