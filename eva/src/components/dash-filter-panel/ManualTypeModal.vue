<template>
  <div :style="{ 'background-color': theme.$secondary_bg }">
    Имя поля
    <v-text-field outlined v-model="temp.fieldName" :background-color="theme.$main_bg" />

    Тип
    <v-select
      outlined
      v-model="temp.fieldType"
      item-value="value"
      item-text="title"
      :items="fieldTypes"
      :background-color="theme.$main_bg"
    />

    <div v-if="temp.fieldType === 'date'">
      Дата
      <v-text-field
        v-model="temp.value"
        :background-color="theme.$main_bg"
        :color="theme.$accent_ui_color"
        :style="{ color: theme.$main_text }"
        class="textarea-item"
        outlined
        placeholder="0"
        hide-details
      >
      </v-text-field>
      <DTPicker
        v-model="temp.value"
        :no-value-to-custom-elem="true"
        format="YYYY-MM-DD HH:mm"
        :color="theme.$accent_ui_color"
        :button-color="theme.$primary_button"
        class="dtpicker-search"
      >
        <v-icon class="picker-search" :color="theme.$primary_button">
          {{ pickerIcon }}
        </v-icon>
      </DTPicker>
    </div>
    <div v-else>
      Значение
      <v-text-field v-model="temp.value" outlined :background-color="theme.$main_bg" />
    </div>
    <v-slide-group v-model="currentOperationTab" mandatory>
      <v-slide-item
        v-for="(tab, index) in operationMap[temp.fieldType]"
        style="text-transform: none; font-size: 12px; box-shadow: none"
        :key="index"
        v-slot="{ active, toggle }"
      >
        <v-btn
          @click="toggle"
          :style="
            active
              ? {
                  'background-color': theme.$primary_button,
                  color: theme.$main_bg,
                  'border-radius': '3px',
                }
              : undefined
          "
        >
          {{ getOperationManualTitle(tab) }}
        </v-btn>
      </v-slide-item>
    </v-slide-group>
  </div>
</template>
<script>
  import { mdiCalendarMonth } from '@mdi/js';
  export default {
    name: 'ManualTypeModal',
    props: ['temp'],
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
    },
    data() {
      return {
        // fieldTypes: ['string', 'number', 'date'],
        fieldTypes: [
          { value: 'string', title: 'Строка' },
          { value: 'number', title: 'Число' },
          { value: 'date', title: 'Дата' },
        ],
        currentOperationTab: 0,
        pickedDate: '',
        operationMap: {
          string: ['exactMatch', 'match'],
          date: ['<', '>'],
          number: ['<', '>', '=', '>=', '<='],
        },
        operationManualTitleMap: {
          string: {
            exactMatch: 'Полное совпадение',
            match: 'Регулярное выражение',
          },
          // number: {
          //   '>': 'Больше',
          //   '<': 'Меньше',
          //   '=': 'Равно',
          //   '>=': 'Больше или равно',
          //   '<=': 'Меньше или равно',
          // },
          // date: {
          //   '>': 'Позже',
          //   '<': 'Раньше',
          // },
        },
        pickerIcon: mdiCalendarMonth,
      };
    },
    methods: {
      getOperationManualTitle(operation) {
        if (this.temp.fieldType === 'string')
          return this.operationManualTitleMap[this.temp.fieldType][operation];
        else return operation;
      },
    },
    watch: {
      pickedDate(newVal) {
        console.log(newVal);
      },
      currentOperationTab(index) {
        if (this.operationMap[this.temp.fieldType])
          this.temp.operationManual = this.operationMap[this.temp.fieldType][index];
      },
      temp: {
        immediate: true,
        handler(val) {
          if (Object.keys(this.operationMap).includes(val.fieldType)) {
            let manualOperationMapIndex = this.operationMap[val.fieldType].indexOf(
              val.operationManual
            );
            this.currentOperationTab = manualOperationMapIndex !== -1 ? manualOperationMapIndex : 0;
          }
        },
      },
    },
  };
</script>

<style lang="sass" scoped>

  .dtpicker-search
      position: absolute
      top: 1px
      cursor: pointer


      &:nth-child(2)
        margin-left: 20px

        .datepicker
</style>
