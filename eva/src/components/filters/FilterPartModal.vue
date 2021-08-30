<template>
  <v-card>
    <v-card-title class="text-h5"> Часть фильтра "{{ filter.id }}" </v-card-title>
    <v-card-subtitle>
      <v-tabs v-model="currentTab" centered grow>
        <v-tab v-for="(tab, index) in typeTabs" :key="index">
          {{ tab.title }}
        </v-tab>
      </v-tabs>
    </v-card-subtitle>
    <v-card-text>
      <v-tabs-items v-model="currentTab">
        <v-tab-item v-for="(tab, index) in typeTabs" :key="index">
          <component :is="tab.componentName" :filter="filter" :temp="temp"></component>
        </v-tab-item>
      </v-tabs-items>
      <v-btn @click="saveFilterPartModal" class="ma-2">Сохранить</v-btn>
      <v-btn @click="closeFilterPartModal" class="ma-2">Отменить</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
  import ManualTypeModal from './ManualTypeModal';
  import TokenTypeModal from './TokenTypeModal';

  export default {
    name: 'FilterPartModal',
    props: ['filter', 'filterPart'],
    components: {
      ManualTypeModal,
      TokenTypeModal,
    },
    data() {
      return {
        currentTab: 0,
        typeTabs: [
          { title: 'Ручная', componentName: 'ManualTypeModal' },
          { title: 'Токен', componentName: 'TokenTypeModal' },
        ],
        typeMap: ['manual', 'token'],
        temp: {},
      };
    },
    watch: {
      currentTab(val) {
        this.temp.type = this.typeMap[val];
      },
      filterPart: {
        immediate: true,
        handler(filterPart) {
          this.currentTab = filterPart ? this.typeMap.indexOf(filterPart.type) : 0;
          this.temp = filterPart;
        },
      },
    },
    methods: {
      saveFilterPartModal() {
        this.$emit('saveFilterPart', this.filter, this.temp);
      },
      closeFilterPartModal() {
        this.$emit('closeFilterPart', this.temp);
      },
    },
  };
</script>
