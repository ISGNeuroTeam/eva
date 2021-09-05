<template>
  <div class="pa-1 filter-part">
    <v-row>
      <v-col>
        <div v-if="filterPart.filterPartType === 'token'">
          <h4 :style="{ color: theme.$main_text }">
            {{ elemName }}
          </h4>
          <div class="align-center d-flex">
            <h5 :style="{ color: theme.$secondary_text }">
              {{ filterPart.fieldName }}
              ({{ filterPartValues.length }})
            </h5>
            <v-menu
              offset-y
              :close-on-content-click="false"
              max-height="300"
              v-if="filterPartValues.length > 0"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  x-small
                  v-bind="attrs"
                  v-on="on"
                  :style="{ color: theme.$secondary_text }"
                >
                  <v-icon>{{ dropDownIcon }}</v-icon>
                </v-btn>
              </template>
              <v-list
                :style="{
                  'background-color': theme.$main_bg,
                  border: `1px solid ${theme.$secondary_border}`,
                }"
              >
                <v-list-item
                  v-for="(value, index) in filterPartValues"
                  :key="index"
                  class="align-center d-flex"
                >
                  <h5 :style="{ color: theme.$main_text }">
                    {{ value }}
                  </h5>
                  <v-spacer></v-spacer>
                  <v-btn icon x-small class="ml-2" v-if="isFocused" @click="removeValue(index)">
                    <v-icon>{{ closeIcon }}</v-icon>
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <div v-else>
          <h4 :style="{ color: theme.$main_text }">
            {{ filterPart.fieldName }}: {{ filterPart.value }}
          </h4>
          <h5 :style="{ color: theme.$secondary_text }">
            ({{ filterPart.fieldType }}) {{ operationManualTitle }}
          </h5>
        </div>
      </v-col>

      <v-col class="d-flex flex-column align-center justify-end" v-if="isFocused">
        <v-btn
          icon
          x-small
          v-show="filterPart.filterPartType==='token'"
          :color="theme.$main_text"
          @click.stop.prevent="clearValues"
          @click="refreshFilterPart"
        >
          <v-icon>{{ refreshIcon }}</v-icon>
        </v-btn>
        <v-btn
          icon
          x-small
          v-if="editPermission || filterPart.filterPartType === 'manual'"
          class="justify-end"
          :color="theme.$error_color"
          @click.stop.prevent="$emit('deleteFilterPart', filterPart)"
        >
          <v-icon>{{ closeIcon }}</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mdiClose, mdiRefresh, mdiPencil, mdiChevronDown } from '@mdi/js';

  export default {
    name: 'FilterPart',
    props: [
      'idDash',
      'filterPart',
      'isFocused',
      'editPermission',
      'filterPartIndex',
      'filterIndex',
    ],
    data() {
      return {
        closeIcon: mdiClose,
        refreshIcon: mdiRefresh,
        editIcon: mdiPencil,
        dropDownIcon: mdiChevronDown,
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
      };
    },
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
      filterPartValues() {
        return this.$store.getters.getFilters(this.idDash)[this.filterIndex].parts[this.filterPartIndex]
          .values;
      },
      elemName() {
        if (this.filterPart.token)
          return this.$store.state.store[this.idDash][this.filterPart.token.elem].name_elem;
        else {
          return 'Ручной фильтр';
        }
      },
      operationManualTitle() {
        return this.filterPart.operationManual
          ? this.operationManualTitleMap[this.filterPart.fieldType][this.filterPart.operationManual]
          : '';
      },
    },
    methods: {
      clearValues() {
        this.filterPart.values = [];
      },
      removeValue(valueIndex) {
        let { idDash, filterIndex, filterPartIndex } = this;
        this.$store.commit('removeFilterPartValue', { idDash, filterIndex, filterPartIndex, valueIndex });
      },
      refreshFilterPart() {
        let { idDash, filterIndex, filterPartIndex } = this;
        this.$store.commit('refreshFilterPart', { idDash, filterIndex, filterPartIndex });
      },
    },
  };
</script>

<style scoped>
  .filter-part {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 0;
  }
</style>
