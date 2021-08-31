<template>
  <v-card>
    <v-card-subtitle>
      <v-tabs hide-slider centered grow v-model="currentTab">
        <v-tab v-for="(tab, index) in typeTabs" :key="index">
          {{ tab.title }}
        </v-tab>
      </v-tabs>
    </v-card-subtitle>
    <v-card-text>
      <v-tabs-items v-model="currentTab">
        <v-tab-item v-for="(tab, index) in typeTabs" :key="index">
          <component :is="tab.componentName" :idDash="idDash" :temp="temp"></component>
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
    props: ['idDash', 'filterPart'],
    components: {
      ManualTypeModal,
      TokenTypeModal,
    },
    data() {
      return {
        currentTab: 0,
        typeTabs: [
          { title: 'Конфигуратор', componentName: 'ManualTypeModal' },
          { title: 'Токен', componentName: 'TokenTypeModal' },
        ],
        typeMap: ['manual', 'token'],
        temp: {},
      };
    },
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
    },
    watch: {
      currentTab(val) {
        this.temp.filterPartType = this.typeMap[val];
      },
      filterPart: {
        immediate: true,
        handler(filterPart) {
          this.currentTab = filterPart ? this.typeMap.indexOf(filterPart.filterPartType) : 0;
          this.temp = filterPart;
        },
      },
    },
    methods: {
      saveFilterPartModal() {
        this.$emit('saveFilterPart', this.temp);
      },
      closeFilterPartModal() {
        this.$emit('closeFilterPart', this.temp);
      },
    },
  };
</script>

<style lang="sass" scoped>
  .active-type-tab
    background-color: var(--primary_button)
</style>
