<template>
  <v-container>
    <v-btn @click="addFilter">Добавить фильтр</v-btn>

    <v-list dense>
      <v-list-item-group v-model="focusedRow">
        <v-list-item v-for="filter in filters" :key="filter.id">
          <v-row justify="space-between">
            <!-- FILTER ID -->
            <v-col>
              {{ filter.id }}
            </v-col>

            <!-- FILTER PARTS -->
            <v-col>
              <v-sheet class="mx-auto" max-width="600">
                <v-slide-group show-arrows>
                  <v-slide-item v-for="(part, index) in filter.parts" :key="index">
                    <filter-part :filterPart="part"></filter-part>
                  </v-slide-item>
                </v-slide-group>
              </v-sheet>
            </v-col>

            <!-- FILTER BUTTONS -->
            <v-col>
              <v-btn @click="triggerFilterPartModal()">add</v-btn>
              <v-btn @click="deleteFilter(filter)">delete</v-btn>
            </v-col>

            <v-dialog max-width="1000" v-model="partModalShow">
              <filter-part-modal
                :filter="filter"
                @triggerFilterPartModal="triggerFilterPartModal"
              ></filter-part-modal>
            </v-dialog>
          </v-row>
        </v-list-item>

        <v-list-item v-for="(tmp, index) in tempFilters" :key="index">
          <v-text-field v-model="tmp.id"></v-text-field>
          <v-btn @click="saveTempFilter(index)">save</v-btn>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-container>
</template>

<script>
  import FilterPartModal from './filters/FilterPartModal';
  import FilterPart from './filters/FilterPart';

  export default {
    name: 'DashFilterPanel',
    components: { FilterPartModal, FilterPart },
    props: {
      idDashFrom: null,
    },
    data() {
      return {
        filters: [],
        focusedRow:null,
        tempFilters: [],
        partModalShow: false,
      };
    },
    watch:{
      focusedRow(rowNumber){
        this.$store.commit("setFocusedFilter", this.filters[rowNumber])
      }
    },
    methods: {
      addFilter() {
        this.tempFilters.push({
          idDash: this.idDashFrom,
          id: '',
          parts: [],
        });
      },
      saveTempFilter(index) {
        let candidate = this.tempFilters[index];

        if (this.filters.some(filter => filter.id === candidate.id)) {
          console.log('Фильтр с таким именем существует');
        } else if (!candidate.id) {
          console.log('Введите имя');
        } else {
          this.tempFilters.splice(index, 1);
          this.$store.commit('createFilter', candidate);
          this.filters = this.$store.getters.getFilters(this.idDashFrom);
        }
      },
      deleteFilter(filter) {
        this.$store.commit('deleteFilter', filter);
        this.filters = this.$store.getters.getFilters(this.idDashFrom);
      },
      triggerFilterPartModal() {
        this.partModalShow = !this.partModalShow;
      },
    },
    mounted() {
      this.filters = this.$store.getters.getFilters(this.idDashFrom);
    },
  };
</script>

<style lang="sass" scoped>

  @import '../sass/dashFilterPanel.sass'
</style>
