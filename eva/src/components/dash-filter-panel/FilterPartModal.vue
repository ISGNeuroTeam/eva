<template>
  <v-card :style="{ 'background-color': theme.$secondary_bg }">
    <v-card-title :style="{ color: theme.$title, 'background-color': theme.$main_bg }">
      <v-icon :color="theme.$title" class="pr-2">{{ settingsIcon }}</v-icon
      >Настройки фильтра
    </v-card-title>
    <v-card-subtitle class="mt-5">
      <v-item-group v-model="currentTab" mandatory>
        <v-item v-for="(item, index) in typeMap" :key="index" v-slot="{ active, toggle }"
          ><v-btn
            depressed
            style="text-transform: none; width: 50%"
            :style="
              active
                ? {
                    'background-color': theme.$primary_button,
                    color: theme.$secondary_bg,
                    'border-radius': '3px',
                  }
                : {
                    'background-color': theme.$main_bg,
                    color: theme.$main_text,
                  }
            "
            @click="toggle"
          >
            {{ item.title }}
          </v-btn>
        </v-item>
      </v-item-group>
    </v-card-subtitle>
    <v-card-text>
      <component :is="typeMap[currentTab].componentName" :idDash="idDash" :temp="temp"></component>
      <v-switch v-model="filterPart.invertMatches" 
        ><h5 slot="label" :style="{ color: theme.$secondary_text }">Вычитать значения</h5></v-switch
      >
      <div class="d-flex justify-end">
        <v-btn
          text
          @click="closeFilterPartModal"
          class="ma-2"
          style="text-transform: none"
          :style="{ color: theme.$main_text }"
          >Отменить</v-btn
        >
        <v-btn
          depressed
          style="text-transform: none"
          :color="theme.$primary_button"
          :style="{ color: theme.$secondary_bg }"
          @click="saveFilterPartModal"
          class="ma-2"
          >Сохранить</v-btn
        >
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import ManualTypeModal from './ManualTypeModal';
  import TokenTypeModal from './TokenTypeModal';
  import { mdiSettings } from '@mdi/js';

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
        typeMap: [
          { title: 'Токен', componentName: 'TokenTypeModal', type: 'token' },
          { title: 'Ручной ввод', componentName: 'ManualTypeModal', type: 'manual' },
        ],
        temp: {},
        settingsIcon: mdiSettings,
      };
    },
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
    },
    watch: {
      currentTab(val) {
        this.temp.filterPartType = this.typeMap[val].type;
      },
      filterPart: {
        immediate: true,
        handler(filterPart) {
          let itemIndex = this.typeMap.findIndex(item => item.type === filterPart.filterPartType);
          if (itemIndex !== -1) {
            this.currentTab = itemIndex;
            this.temp = filterPart;
          } else {
            throw new Error(
              `Type "${filterPart.filterPartType}" of filter part does not recognized`
            );
          }
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

<style lang="sass" scoped></style>
