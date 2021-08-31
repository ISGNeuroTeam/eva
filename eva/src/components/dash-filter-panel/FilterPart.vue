<template>
  <div class="pa-1 filter-part">
    <v-row @click.self="$emit('editFilterPart', filterPart)">
      <v-col>
        <div v-if="filterPart.filterPartType === 'token'">
          <div>
            <b>
              {{ elemName }}
            </b>
          </div>
          <div>
            {{ filterPart.fieldName }}
            ({{ filterPart.values.length }})
            <v-menu offset-y :close-on-content-click="false" max-height="300">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon x-small v-bind="attrs" v-on="on">
                  <v-icon>{{ dropDownIcon }}</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(value, index) in filterPart.values"
                  :key="index"
                  class="align-center d-flex"
                >
                  {{ value }}
                  <v-spacer></v-spacer>
                  <v-btn icon x-small outlined class="ml-2" @click="removeValue(index)">
                    <v-icon>{{ closeIcon }}</v-icon>
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <div v-else>
          <div>
            <b> {{ filterPart.fieldName }}: {{ filterPart.value }} </b>
          </div>
          <div>{{ filterPart.operationManual }}</div>
        </div>
      </v-col>

      <v-col class="d-flex flex-column align-center justify-space-between" v-if="isFocused">
        <v-btn icon x-small outlined @click="clearValues">
          <v-icon>{{ refreshIcon }}</v-icon>
        </v-btn>
        <v-btn
          icon
          x-small
          color="red"
          outlined
          @click="$emit('deleteFilterPart', filterPart)"
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
    props: ['idDash', 'filterPart', 'isFocused'],
    data() {
      return {
        closeIcon: mdiClose,
        refreshIcon: mdiRefresh,
        editIcon: mdiPencil,
        dropDownIcon: mdiChevronDown,
      };
    },
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
      elemName() {
        if (this.filterPart.token)
          return this.$store.state.store[this.idDash][this.filterPart.token.elem].name_elem;
        else {
          return 'Ручной фильтр';
        }
      },
    },
    methods: {
      clearValues() {
        this.filterPart.values = [];
      },
      removeValue(index) {
        this.filterPart.values.splice(index, 1);
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
