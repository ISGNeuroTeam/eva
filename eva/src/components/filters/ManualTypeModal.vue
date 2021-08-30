<template>
  <div>
    Имя поля: <v-text-field v-model="temp.fieldName" />
    <v-select v-model="temp.fieldType" :items="fieldTypes" label="Операции" filled />
    <div v-if="temp.fieldType === 'string'">
      Значение: <v-text-field v-model="temp.value" />
      <v-checkbox class="ma-2" v-model="temp.exactString" label="Точное совпадение" />
      <v-checkbox class="ma-2" v-model="temp.regExpString" label="Регулярное выражение" />
    </div>
  </div>
</template>
<script>
  export default {
    name: 'ManualTypeModal',
    props: ['temp'],
    data() {
      return {
        fieldTypes: ['string', 'number', 'date'],
      };
    },
    mounted() {},
  };
</script>
