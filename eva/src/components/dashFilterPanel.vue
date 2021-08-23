<template>
  <v-container>
    <v-btn @click="addFilter" class="mb-1">Добавить фильтр</v-btn>

    <v-list dense flat>
      <v-list-item-group v-model="focusedRow" active-class="focused-filter">
        <v-list-item v-for="filter in filters" :key="filter.id" class="ma-1 filter-row">
          <v-row justify="space-between" align="center">
            <!-- FILTER ID -->
            <v-col cols="2">
              <v-card flat>
                <v-card-title>
                  {{ filter.id }}
                </v-card-title>
              </v-card>
            </v-col>

            <v-divider vertical></v-divider>

            <!-- FILTER PARTS -->
            <v-col cols="8" class="d-flex align-center justify-left">
              <v-slide-group show-arrows>
                <v-slide-item v-for="(part, index) in filter.parts" :key="index">
                  <filter-part :filterPart="part"></filter-part>
                </v-slide-item>
              </v-slide-group>
              <v-row align="center">
                <v-btn
                  rounded
                  x-small
                  outlined
                  class="text-capitalize ml-6"
                  @click="triggerFilterPartModal()"
                >
                  <v-icon x-small left> {{ plusIcon }}</v-icon> Добавить
                </v-btn>
              </v-row>
            </v-col>

            <v-divider vertical></v-divider>

            <!-- FILTER BUTTONS -->
            <v-col cols="2">
              <v-btn icon small color="red" @click="deleteFilter(filter)"
                ><v-icon>{{ trashIcon }}</v-icon></v-btn
              >
              <v-btn icon small @click="refreshFilter(filter)"
                ><v-icon>{{ refreshIcon }}</v-icon></v-btn
              >
            </v-col>

            <v-dialog max-width="1000" v-model="partModalShow">
              <filter-part-modal
                :filter="filter"
                @triggerFilterPartModal="triggerFilterPartModal"
              ></filter-part-modal>
            </v-dialog>
          </v-row>
        </v-list-item>
      </v-list-item-group>

      <v-list-item v-for="(tmp, index) in tempFilters" :key="index">
        <v-text-field v-model="tmp.id"></v-text-field>
        <v-btn rounded small class="ma-1" @click="saveTempFilter(index)">Сохранить</v-btn>
        <v-btn rounded small class="ma-1" @click="removeTempFilter(index)">Отменить</v-btn>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
  import FilterPartModal from './filters/FilterPartModal';
  import FilterPart from './filters/FilterPart';
  import { mdiPlusCircleOutline, mdiTrashCanOutline, mdiRefresh } from '@mdi/js';

  export default {
    name: 'DashFilterPanel',
    components: { FilterPartModal, FilterPart },
    props: {
      idDashFrom: null,
    },
    data() {
      return {
        filters: [],
        focusedRow: null,
        tempFilters: [],
        partModalShow: false,
        plusIcon: mdiPlusCircleOutline,
        trashIcon: mdiTrashCanOutline,
        refreshIcon: mdiRefresh,
      };
    },
    watch: {
      focusedRow(rowNumber) {
        if (rowNumber === undefined) {
          this.$store.commit('setFocusedFilter', { idDash: this.idDashFrom, filter: null });
        }
        this.$store.commit('setFocusedFilter', {
          idDash: this.idDashFrom,
          filter: this.filters[rowNumber],
        });
      },
    },
    methods: {
      addFilter() {
        this.tempFilters.push({
          idDash: this.idDashFrom,
          id: '',
          parts: [],
        });
      },
      removeTempFilter(index) {
        this.tempFilters.splice(index, 1);
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
      refreshFilter(filter) {
        this.$store.commit('refreshFilter', filter);
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
