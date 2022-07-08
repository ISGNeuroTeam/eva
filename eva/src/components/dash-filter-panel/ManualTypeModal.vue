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
      v-else
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
            style="font-size: 12px; width: 100px"
            :style="
              active
                ? {
                  'background-color': theme.$primary_button,
                  color: theme.$main_bg,
                  'border-radius': '3px',
                }
                : {
                  'background-color': theme.$main_bg,
                  color: theme.$main_text,
                }
            "
            @click="toggle"
          >
            {{ getOperationManualTitle(item) }}
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
      ],
      currentOperationTab: 0,
      operationMap: {
        string: [],
        date: ['<', '>'],
        number: ['>', '<', '='],
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
      },
      calendarIcon: mdiCalendarMonth,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
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
      },
    },
  },
  methods: {
    getOperationManualTitle(operation) {
      return this.operationManualTitleMap[this.temp.fieldType][operation];
    },
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
