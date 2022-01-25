<template>
  <v-card :style="{ 'background-color': theme.$secondary_bg }">
    <v-card-title
      :style="{ color: theme.$title, 'background-color': theme.$main_bg }"
      class="mb-5"
    >
      <v-icon :color="theme.$title" class="pr-2">{{ settingsIcon }}</v-icon
      >Настройки фильтра
    </v-card-title>
    <v-card-subtitle v-if="editMode && typeMap.length > 1" class="mt-5">
      <v-item-group v-model="currentTab" mandatory>
        <v-item
          v-for="(item, index) in typeMap"
          :key="index"
          v-slot="{ active, toggle }"
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
      <component
        :is="typeMap[currentTab].componentName"
        :idDash="idDash"
        :temp="temp"
        :edit-mode="editMode"
      ></component>
      <v-switch v-model="temp.invertMatches" :color="theme.$primary_button"
        ><h5 slot="label" :style="{ color: theme.$secondary_text }">
          Вычитать значения
        </h5></v-switch
      >
      <div class="d-flex justify-end">
        <v-btn
          text
          class="ma-2"
          style="text-transform: none"
          :style="{ color: theme.$main_text }"
          @click="closeFilterPartModal"
          >Отменить</v-btn
        >
        <v-btn
          depressed
          style="text-transform: none"
          :color="theme.$primary_button"
          :style="{ color: theme.$secondary_bg }"
          class="ma-2"
          @click="saveFilterPartModal"
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
  components: {
    ManualTypeModal,
    TokenTypeModal,
  },
  props: [
    'idDash',
    'filterPart',
    'filterPartIndex',
    'editPermission',
    'editMode',
  ],
  data() {
    return {
      currentTab: 0,
      temp: {},
      settingsIcon: mdiSettings,
    };
  },
  computed: {
    typeMap() {
      let mapOfTypes = [
        { title: 'Токен', componentName: 'TokenTypeModal', type: 'token' },
        {
          title: 'Ручной ввод',
          componentName: 'ManualTypeModal',
          type: 'manual',
        },
      ];
      return this.editPermission ? mapOfTypes : mapOfTypes.slice(1);
    },
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
        if (filterPart) {
          let itemIndex = this.typeMap.findIndex(
            (itemTypeMap) => itemTypeMap.type === filterPart.filterPartType
          );
          if (itemIndex !== -1) {
            this.currentTab = itemIndex;
            this.temp = Object.assign({}, filterPart);
            this.temp.token = filterPart?.token?.name;
          } else {
            throw new Error(
              `Type "${filterPart.filterPartType}" of filter part does not recognized`
            );
          }
        }
      },
    },
  },
  methods: {
    saveFilterPartModal() {
      if (this.temp.filterPartType === 'token') {
        const originToken = this.$store.getters
          .getTockens(this.idDash)
          .find((tkn) => tkn.name === this.temp.token);
        if (originToken) {
          this.temp.token = originToken;
          this.temp.fieldName = originToken.capture;
        } else return;
      }
      this.$emit('saveFilterPart', this.temp, this.filterPartIndex);
    },
    closeFilterPartModal() {
      this.$emit('closeFilterPartModal');
    },
  },
};
</script>

<style lang="sass" scoped></style>
