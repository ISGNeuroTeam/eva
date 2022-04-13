<template>
  <v-card :style="{ 'background-color': theme.$secondary_bg }">
    <v-card-title
      :style="{ color: theme.$title, 'background-color': theme.$main_bg }"
      class="mb-5"
    >
      <v-icon
        :color="theme.$title"
        class="pr-2"
      >
        {{ settingsIcon }}
      </v-icon>Настройки фильтра
    </v-card-title>
    <v-card-subtitle
      v-if="editMode && typeMap.length > 1"
      class="mt-5"
    >
      <v-item-group
        v-model="currentTab"
        mandatory
        @change="$emit('changeTab')"
      >
        <v-item
          v-for="(item, index) in typeMap"
          :key="index"
          v-slot="{ active, toggle }"
        >
          <v-btn
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
        :id-dash="idDash"
        :temp="temp"
        :edit-mode="editMode"
        @isChanged="$emit('isChanged', $event)"
      />
      <v-switch
        v-model="temp.invertMatches"
        :color="theme.$primary_button"
        @change="$emit('isChanged', true)"
      >
        <h5
          slot="label"
          :style="{ color: theme.$secondary_text }"
        >
          Вычитать значения
        </h5>
      </v-switch>
      <div class="d-flex justify-end">
        <v-btn
          text
          class="ma-2"
          style="text-transform: none"
          :style="{ color: theme.$main_text }"
          @click="closeFilterPartModal"
        >
          Отменить
        </v-btn>
        <v-btn
          depressed
          style="text-transform: none"
          :color="theme.$primary_button"
          :style="{ color: theme.$secondary_bg }"
          class="ma-2"
          @click="saveFilterPartModal"
        >
          Сохранить
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mdiSettings } from '@mdi/js';
import ManualTypeModal from './ManualTypeModal';
import TokenTypeModal from './TokenTypeModal';

export default {
  name: 'FilterPartModal',
  components: {
    ManualTypeModal,
    TokenTypeModal,
  },
  props: {
    idDash: {
      type: String,
      required: true,
    },
    filterPart: {
      type: Object,
      default: null,
    },
    editPermission: {
      type: Boolean,
      required: true,
    },
    filterPartIndex: {
      type: Number,
      default: null,
    },
    editMode: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      currentTab: 0,
      temp: {},
      settingsIcon: mdiSettings,
    };
  },
  computed: {
    typeMap() {
      const mapOfTypes = [
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
    getTockens() {
      return this.$store.state[this.idDash].tockens;
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
          const itemIndex = this.typeMap.findIndex(
            (itemTypeMap) => itemTypeMap.type === filterPart.filterPartType,
          );
          if (itemIndex !== -1) {
            this.currentTab = itemIndex;
            this.temp = { ...filterPart };
            this.temp.token = filterPart?.token?.name;
          } else {
            throw new Error(
              `Type "${filterPart.filterPartType}" of filter part does not recognized`,
            );
          }
        }
      },
    },
  },
  methods: {
    saveFilterPartModal() {
      if (this.temp.filterPartType === 'token') {
        const originToken = this.getTockens
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
