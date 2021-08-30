<template>
  <div>
    Имя поля: <v-text-field v-model="temp.fieldName" />
    <v-select v-model="temp.fieldType" :items="fieldTypes" label="Тип поля" filled />

    <div v-if="temp.fieldType === 'date'">
      <v-text-field
        v-model="temp.value"
        :color="theme.$accent_ui_color"
        :style="{ color: theme.$main_text }"
        class="textarea-item"
        outlined
        label="Временной интервал: начало"
        placeholder="0"
        hide-details
      />
      <DTPicker
        v-model="temp.value"
        :no-value-to-custom-elem="true"
        format="YYYY-MM-DD HH:mm"
        :style="{ fill: theme.$main_text, background: theme.$main_bg, color: theme.$main_text }"
        :color="theme.$accent_ui_color"
        :button-color="theme.$primary_button"
        class="dtpicker-search"
      >
        <v-icon class="picker-search" :color="theme.$primary_button">
          {{ pickerIcon }}
        </v-icon>
      </DTPicker>
    </div>
    <div v-else>Значение: <v-text-field v-model="temp.value" /></div>
    <v-tabs v-model="currentOperationTab" centered grow filled>
      <v-tab v-for="(tab, index) in operationMap[temp.fieldType]" :key="index">{{ tab }} </v-tab>
    </v-tabs>
  </div>
</template>
<script>
  import { mdiCalendarMonth } from '@mdi/js';
  export default {
    name: 'ManualTypeModal',
    props: ['temp'],
    computed: {
      theme: function () {
        return this.$store.getters.getTheme;
      },
    },
    data() {
      return {
        fieldTypes: ['string', 'number', 'date'],
        currentOperationTab: 0,
        pickedDate: '',
        operationMap: {
          string: ['match', 'exactMatch'],
          date: ['earlier', 'later'],
          number: ['greater', 'less', 'equal', 'greaterEqual', 'lessEqual'],
        },
        pickerIcon: mdiCalendarMonth,
      };
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
            let manualOperationMapIndex = this.operationMap[val.fieldType].indexOf(val.operationManual);
            this.currentOperationTab = manualOperationMapIndex !== -1 ? manualOperationMapIndex : 0;
          }
        },
      },
    },
  };
</script>

<style lang="sass">

.dtpicker-search
    position: absolute
    top: 30px
    width: 24px
    right: 10px
    cursor: pointer

    .datepicker
      top: -225px !important
      left: -160px !important

    &:nth-child(2)
      margin-left: 20px

      .datepicker
        top: -225px !important
        left: auto !important
        right: 85px !important
</style>
