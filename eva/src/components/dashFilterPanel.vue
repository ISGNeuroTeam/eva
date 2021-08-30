<template>
  <div class="dash-filter-panel">
    <v-btn @click="addFilter" class="mb-1">Добавить фильтр</v-btn>

    <v-list dense flat>
      <v-list-item-group>
        <v-list-item
          :ripple="false"
          v-for="(filter, indexFilter) in filters"
          :key="filter.id"
          class="ma-1 filter-row"
          :class="focusedRow === indexFilter ? 'focused-filter' : ''"
        >
				<v-row align="center">
            <!-- FILTER ID -->
            <v-col cols="2" @click="focusRow(indexFilter)">
              <v-card flat>
                <v-card-title>
                  {{ filter.id }}
                </v-card-title>
              </v-card>
            </v-col>

            <v-divider vertical></v-divider>

            <!-- FILTER PARTS -->
            <v-col cols="8" class="d-flex align-center justify-left">
              <v-sheet max-width="1000">
                <v-slide-group show-arrows>
                  <v-slide-item v-for="(part, indexPart) in filter.parts" :key="indexPart">
                    <filter-part
                      @deleteFilterPart="deleteFilterPart"
                      @editFilterPart="openFilterPartModal"
                      :filter="filter"
                      :filterPart="part"
                      :isFocused="focusedRow === indexFilter"
                    ></filter-part>
                  </v-slide-item>
                </v-slide-group>
              </v-sheet>
              <div v-if="focusedRow === indexFilter" class="d-flex">
                <v-btn icon color="green" @click="applyTempParts">
                  <v-icon> {{ acceptIcon }}</v-icon>
                </v-btn>
                <v-divider></v-divider>
                <v-btn icon color="red" @click="declineTempParts">
                  <v-icon> {{ declineIcon }}</v-icon>
                </v-btn>
              </div>

              <v-row align="center">
                <v-btn
                  rounded
                  x-small
                  outlined
                  class="text-capitalize ml-6"
                  @click="openFilterPartModal()"
                >
                  <v-icon x-small left> {{ plusIcon }}</v-icon> Добавить
                </v-btn>
              </v-row>
            </v-col>

            <v-divider vertical></v-divider>

            <!-- FILTER BUTTONS -->
            <v-col cols="2" v-if="focusedRow === indexFilter">
              <v-btn icon small color="red" @click="deleteFilter(filter)"
                ><v-icon>{{ trashIcon }}</v-icon></v-btn
              >
              <v-btn icon small @click="refreshFilter(filter)"
                ><v-icon>{{ refreshIcon }}</v-icon></v-btn
              >
            </v-col>

            <v-dialog max-width="1000" v-model="filterPartModalShow" persistent>
              <filter-part-modal
                :filter="filter"
                :filterPart="filterPartInModal"
                @saveFilterPart="saveFilterPart"
                @closeFilterPart="closeFilterPart"
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
  </div>
</template>

<script>
  import FilterPartModal from './filters/FilterPartModal';
  import FilterPart from './filters/FilterPart';
  import {
    mdiPlusCircleOutline,
    mdiTrashCanOutline,
    mdiRefresh,
    mdiCheck,
    mdiClose,
  } from '@mdi/js';

  export default {
    name: 'DashFilterPanel',
    components: { FilterPartModal, FilterPart },
    props: {
      idDashFrom: null,
    },
    data() {
      return {
        filters: [],
        tempFilters: [],
        focusedRow: null,
        filterPartModalShow: false,
        filterPartInModal: {},
        plusIcon: mdiPlusCircleOutline,
        trashIcon: mdiTrashCanOutline,
        refreshIcon: mdiRefresh,
        acceptIcon: mdiCheck,
        declineIcon: mdiClose,
      };
    },
    watch: {
      focusedRow(rowNumber) {
        if (!Number.isFinite(rowNumber)) {
          this.$store.commit('clearFocusedFilter', this.idDashFrom);
        } else {
          this.$store.commit('setFocusedFilter', this.filters[rowNumber]);
        }
      },
    },
    methods: {
      focusRow(index) {
        if (this.focusedRow === null) this.focusedRow = index;
      },
      addFilter() {
        this.tempFilters.push({
          idDash: this.idDashFrom,
          id: '',
          parts: [],
        });
      },
      applyTempParts() {
        this.$store.commit('clearFocusedFilter', this.idDashFrom);
        this.$store.commit('restartSearches', this.idDashFrom);
        this.focusedRow = null;
        this.filterChanged = false;
      },
      declineTempParts() {
        this.$store.commit('declineFilterChanges', this.idDashFrom);
        this.$store.commit('clearFocusedFilter', this.idDashFrom);
        this.focusedRow = null;
        this.filterChanged = false;
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
      deleteFilterPart(filter, filterPart) {
        let filterIndex = filter.parts.indexOf(filterPart);
        console.log(filterIndex);
        filter.parts.splice(filterIndex, 1);
      },
      refreshFilter(filter) {
        this.filterChanged = true;
        this.$store.commit('refreshFilter', filter);
      },
      openFilterPartModal(filterPart) {
        this.filterPartInModal = filterPart ? filterPart : {};
        this.filterPartModalShow = true;
      },
      saveFilterPart(filter, filterPart) {
        if (filterPart && filter.parts.indexOf(filterPart) === -1) filter.parts.push(filterPart);
        this.filterPartInModal = null;
        this.filterPartModalShow = false;
      },
      closeFilterPart(){
        this.filterPartInModal = null;
        this.filterPartModalShow = false;
      }
    },
    mounted() {
      this.filters = this.$store.getters.getFilters(this.idDashFrom);
      this.$store.commit('clearFocusedFilter', this.idDashFrom);
    },
  };
</script>

<style lang="sass" scoped>

  @import '../sass/dashFilterPanel.sass'
</style>
