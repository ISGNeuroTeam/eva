<template>
  <div class="pa-1 filter-part">
    <v-row>
      <v-col>
        <div>
          {{ elemName }}
        </div>
        <div>
          {{ filterPart.fieldName }}
          ( {{ filterPart.values.length }} )
        </div>
        <div class="d-flex justify-left mt-1" v-if="isFocused">
          <v-btn icon x-small outlined @click="clearValues">
            <v-icon>{{ refreshIcon }}</v-icon>
          </v-btn>
          <v-btn
            icon
            x-small
            outlined
            class="mx-2"
            @click="$emit('editFilterPart', filterPart)"
          >
            <v-icon>{{ editIcon }}</v-icon>
          </v-btn>
          <v-btn
            icon
            x-small
            color="red"
            outlined
            @click="$emit('deleteFilterPart', filter, filterPart)"
          >
            <v-icon>{{ closeIcon }}</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import { mdiClose, mdiRefresh, mdiPencil } from '@mdi/js';

  export default {
    name: 'FilterPart',
    props: ['filter', 'filterPart', 'isFocused'],
    data() {
      return {
        closeIcon: mdiClose,
        refreshIcon: mdiRefresh,
        editIcon: mdiPencil,
      };
    },
    computed: {
      elemName() {
        if (this.filterPart.token)
          return this.$store.state.store[this.filter.idDash][this.filterPart.token.elem].name_elem;
        else {
          return 'Ручной фильтр';
        }
      },
    },
    methods: {
      clearValues() {
        this.filterPart.values = [];
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
