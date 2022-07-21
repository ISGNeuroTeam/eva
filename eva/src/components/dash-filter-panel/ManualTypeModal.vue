<template>
  <div
    :style="{
      'background-color': theme.$secondary_bg,
      color: theme.$main_text,
    }"
    class="manual-type-filter-modal"
  >
    Имя поля
    <v-text-field
      v-model="temp.fieldName"
      hide-details
      outlined
      dense
      :background-color="theme.$main_bg"
      style="padding-bottom: 10px"
      @input="$emit('isChanged', true)"
    />
    Тип
    <v-select
      v-model="temp.fieldType"
      item-value="value"
      item-text="title"
      :items="fieldTypes"
      :background-color="theme.$main_bg"
      style="padding-bottom: 10px"
      hide-details
      outlined
      dense
      @input="$emit('isChanged', true)"
      @change="changeSelected"
    />

    <div
      v-if="temp.fieldType === 'date'"
      key="date"
      style="position: relative; padding-bottom: 10px"
      class="filter-date-type-form"
    >
      Дата
      <v-text-field
        v-model="temp.value"
        :background-color="theme.$main_bg"
        :color="theme.$accent_ui_color"
        :style="{ color: theme.$main_text }"
        class="textarea-item"
        placeholder="0"
        hide-details
        outlined
        dense
        @input="$emit('isChanged', true)"
      >
        <template v-slot:append>
          <DTPicker
            v-model="temp.value"
            :no-value-to-custom-elem="true"
            format="YYYY-MM-DD HH:mm"
            class="dtpicker"
            :style="{
              fill: theme.$main_text,
              background: theme.$main_bg,
              color: theme.$main_text,
            }"
            :color="theme.$accent_ui_color"
            :button-color="theme.$primary_button"
            @input="$emit('isChanged', true)"
          >
            <v-icon
              class="manual-type-filter-modal__icon"
              :style="`color: ${theme.$primary_button} !important`"
            >
              {{ calendarIcon }}
            </v-icon>
          </DTPicker>
        </template>
      </v-text-field>
    </div>
    <div
      v-else-if="temp.fieldType === 'time'"
      key="time"
      style="position: relative; padding-bottom: 10px"
      class="filter-date-type-form"
    >
      Время
      <v-text-field
        v-model="temp.value"
        :background-color="theme.$main_bg"
        :color="theme.$accent_ui_color"
        :style="{ color: theme.$main_text }"
        class="textarea-item"
        placeholder="0"
        hide-details
        outlined
        dense
        @input="$emit('isChanged', true)"
      />
    </div>
    <div
      v-else
      key="string"
      style="padding-bottom: 10px"
    >
      Значение
      <v-text-field
        v-model="temp.value"
        :background-color="theme.$main_bg"
        hide-details
        outlined
        dense
        @input="$emit('isChanged', true)"
      />
    </div>
    <div>
      Единицы изменения
    </div>
    <v-slide-group
      v-if="temp.fieldType === 'time'"
      v-model="currentTimeUnit"
      mandatory
      style="margin-bottom: 10px;"
      @change="$emit('isChanged', true)"
    >
      <div
        style="width: 100%"
        class="d-flex justify-space-around"
      >
        <v-slide-item
          v-for="(item, index) in timeUnits"
          :key="index"
          v-slot="{ active, toggle }"
          style="text-transform: none; font-size: 12px; box-shadow: none"
        >
          <v-btn
            style="
              font-size: 12px;
              flex: auto 1 1;
            "
            :style="
              `background-color: ${active ? theme.$primary_button : theme.$main_bg};
              color: ${active ? theme.$main_bg : theme.$main_text};
              border-radius: ${active ? '3px' : null};
              margin-right: ${timeUnits.length - 1 > index ? '20px' : null};`
            "
            @click="toggle"
          >
            {{ timeUnitsTitles[item] }}
          </v-btn>
        </v-slide-item>
      </div>
    </v-slide-group>
    <div>
      Тип сравнения
    </div>
    <v-slide-group
      v-model="currentOperationTab"
      mandatory
      @change="$emit('isChanged', true)"
    >
      <div
        style="width: 100%"
        class="d-flex justify-space-around"
      >
        <v-slide-item
          v-for="(item, index) in operationMap[temp.fieldType]"
          :key="index"
          v-slot="{ active, toggle }"
          style="text-transform: none; font-size: 12px; box-shadow: none"
        >
          <v-btn
            style="font-size: 12px; width: 100px; flex: auto 1 1;"
            :style="
              `background-color: ${active ? theme.$primary_button : theme.$main_bg};
              color: ${active ? theme.$main_bg : theme.$main_text};
              border-radius: ${active ? '3px' : null};
              margin-right: ${operationMap[temp.fieldType].length - 1 > index ? '20px' : null};`
            "
            @click="toggle"
          >
            {{ getOperationManualForType[item] }}
          </v-btn>
        </v-slide-item>
      </div>
    </v-slide-group>
  </div>
</template>
<script>
import { mdiCalendarMonth } from '@mdi/js';

export default {
  name: 'ManualTypeModal',
  props: {
    temp: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      fieldTypes: [
        { value: 'string', title: 'Строка' },
        { value: 'number', title: 'Число' },
        { value: 'date', title: 'Дата' },
        { value: 'time', title: 'Время' },
      ],
      currentOperationTab: 0,
      currentTimeUnit: 0,
      timeUnits: ['s', 'm', 'h', 'd'],
      timeUnitsTitles: {
        s: 'Секунды',
        m: 'Минуты',
        h: 'Часы',
        d: 'Сутки',
      },
      operationMap: {
        string: [],
        date: ['<', '>'],
        number: ['>', '<', '='],
        time: ['>', '<', '='],
      },
      operationManualTitleMap: {
        number: {
          '>': 'Больше',
          '<': 'Меньше',
          '=': 'Равно',
        },
        date: {
          '>': 'Позже',
          '<': 'Раньше',
        },
        time: {
          '>': 'Больше',
          '<': 'Меньше',
          '=': 'Равно',
        },
      },
      calendarIcon: mdiCalendarMonth,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    getOperationManualForType() {
      return this.operationManualTitleMap[this.temp.fieldType];
    },
  },
  watch: {
    currentOperationTab: {
      immediate: true,
      handler(index) {
        this.temp.operationManual = this.operationMap[this.temp.fieldType][index];
      },
    },
    temp: {
      immediate: true,
      handler(val) {
        if (Object.keys(this.operationMap).includes(val.fieldType)) {
          const manualOperationMapIndex = this.operationMap[
            val.fieldType
          ].indexOf(val.operationManual);
          this.currentOperationTab = manualOperationMapIndex !== -1 ? manualOperationMapIndex : 0;
        }
        if (val.fieldType === 'time') {
          this.currentTimeUnit = val?.timeUnits ? val.timeUnits : 0;
        }
      },
    },
    currentTimeUnit(val) {
      if (this.temp.fieldType === 'time') {
        this.$set(this.temp, 'timeUnits', val);
      } else {
        delete this.temp.currentTimeUnit;
      }
    },
  },
  methods: {
    changeSelected() {
      this.temp.operationManual = this.operationMap[this.temp.fieldType][this.currentOperationTab];
    },
  },
};
</script>

<style lang="sass">

.manual-type-filter-modal
  color: var(--main_text) !important
  &__icon
    cursor: pointer

  .v-text-field__slot input
    color: var(--main_text)

  .v-input__slot fieldset
    color: var(--main_text) !important

  .v-input__control
    .v-icon
      color: var(--main_text) !important

  .v-select__selections
    color: var(--main_text) !important

  .v-input input
    min-height: auto !important
  .datetimepicker
    background: inherit

    .datepicker
      background: inherit
      border: 1px solid

      .pickers-container
        background: inherit

        .datepicker-controls

          .custom-button
            background: inherit

        .month-container

          .datepicker-day

            .datepicker-day-text
              color: inherit

            .datepicker-today
              background: inherit
              border: 1px solid

        .time-picker

          .time-picker-column-item
            color: inherit

      .datepicker-buttons-container
        background: inherit

        .datepicker-button
          background: inherit

          svg
            fill: inherit

          .datepicker-button-effect
            background: transparent
</style>
