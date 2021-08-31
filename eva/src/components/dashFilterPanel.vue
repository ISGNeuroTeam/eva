<template>
  <div class="dash-filter-panel" :style="{ 'background-color': theme.$secondary_bg }">
    <v-btn
      @click="addFilter"
      class="ma-4 new-filter-button d-flex align-center"
      small
      rounded
      text
      :color="theme.$secondary_bg"
      :style="{ 'background-color': theme.$ok_color }"
    >
      <v-icon x-small>{{ plusIcon }}</v-icon>
      <div class="pl-1">Новый фильтр</div>
    </v-btn>

    <div>
      <div
        v-for="(filter, indexFilter) in filters"
        :key="`${filter.id}-${indexFilter}`"
        :style="{ 'border-color': theme.$primary_button, 'background-color': theme.$main_bg }"
        :class="focusedRow === indexFilter ? 'focused-filter-row' : ''"
        class="filter-row"
      >
        <v-row
          no-gutters
          class="d-flex align-center"
          style="height: 100%"
          @click="focusRow(indexFilter)"
        >
          <!-- FILTER ID -->
          <v-col
            cols="1"
            class="d-flex align-center justify-center"
            style="height: 100%"
            :style="{ 'border-right': `1px solid ${theme.$secondary_border}` }"
          >
            <h3>
              {{ filter.id }}
            </h3>
          </v-col>

          <!-- FILTER PARTS -->
          <v-col
            class="d-flex align-center justify-space-between"
            style="width: 100%"
            cols="10"
            :style="{ 'border-right': `1px solid ${theme.$secondary_border}` }"
          >
            <v-sheet :style="{ 'background-color': theme.$main_bg }">
              <v-slide-group show-arrows>
                <v-slide-item
                  v-for="(part, indexPart) in filter.parts"
                  :key="indexPart"
                  :style="{ 'border-right': `1px solid ${theme.$secondary_border}` }"
                >
                  <div
                    @click.stop.prevent="
                      indexFilter === focusedRow ? openFilterPartModal(part) : focusRow(indexFilter)
                    "
                  >
                    <filter-part
                      @deleteFilterPart="deleteFilterPart"
                      :idDash="idDashFrom"
                      :filterPart="part"
                      :isFocused="focusedRow === indexFilter"
                    ></filter-part>
                  </div>
                </v-slide-item>

                <div class="d-flex align-center" v-if="focusedRow === indexFilter">
                  <v-btn
                    class="text-capitalize ml-6"
                    outlined
                    rounded
                    x-small
                    :color="theme.$primary_button"
                    @click.stop.prevent="openFilterPartModal()"
                  >
                    <v-icon x-small left> {{ plusIcon }}</v-icon> Добавить
                  </v-btn>
                </div>
              </v-slide-group>
            </v-sheet>

            <div v-if="focusedRow === indexFilter">
              <v-btn icon color="green" @click.stop.prevent="applyTempParts">
                <v-icon> {{ acceptIcon }}</v-icon>
              </v-btn>
              <v-btn icon :color="theme.$error_color" @click.stop.prevent="declineTempParts">
                <v-icon> {{ declineIcon }}</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- FILTER BUTTONS -->
          <v-col cols="1" class="d-flex align-center justify-center" v-if="focusedRow === indexFilter">
            <v-btn
              icon
              small
              @click.stop.prevent="reverseFilter(filter)"
              :style="{
                'color': filter.invertMatches ? theme.$ok_color : null,
              }"
              ><v-icon>{{ reverseIcon }}</v-icon>
            </v-btn>
            <v-btn icon small @click.stop.prevent="refreshFilter(filter)"
              ><v-icon>{{ refreshIcon }}</v-icon>
            </v-btn>
            <v-btn icon small :color="theme.$error_color" @click.stop.prevent="deleteFilter(filter)">
              <v-icon>{{ trashIcon }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <v-row v-for="(tmp, index) in tempFilters" :key="index">
        <v-col cols="3" class="ml-12">
          <v-text-field outlined :color="theme.$ok_color" v-model="tmp.id"></v-text-field>
        </v-col>
        <v-col class="d-flex align-center">
          <v-btn
            rounded
            small
            class="ma-1"
            :style="{ 'background-color': theme.$ok_color, opacity: 0.5 }"
            @click="saveTempFilter(index)"
            >Сохранить</v-btn
          >
          <v-btn rounded small class="ma-1" @click="removeTempFilter(index)">Отменить</v-btn>
        </v-col>
      </v-row>
    </div>

    <v-dialog max-width="400" v-model="filterPartModalShow" persistent>
      <filter-part-modal
        :idDash="idDashFrom"
        :filterPart="filterPartInModal"
        @saveFilterPart="saveFilterPart"
        @closeFilterPart="closeFilterPart"
      ></filter-part-modal>
    </v-dialog>
  </div>
</template>

<script>
  import FilterPartModal from './dash-filter-panel/FilterPartModal';
  import FilterPart from './dash-filter-panel/FilterPart';

  import {
    mdiPlusCircleOutline,
    mdiTrashCanOutline,
    mdiRefresh,
    mdiCheck,
    mdiClose,
    mdiSwapHorizontal,
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
        reverseIcon: mdiSwapHorizontal,
      };
    },
    computed: {
      theme() {
        return this.$store.getters.getTheme;
      },
      focusedFilter() {
        return this.$store.getters.getFocusedFilter(this.idDashFrom);
      },
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
      reverseFilter(filter) {
        this.$nextTick(() => {
          filter.invertMatches = !filter.invertMatches;
        });
      },
      focusRow(index) {
        if (this.focusedRow === null) this.focusedRow = index;
      },
      addFilter() {
        this.tempFilters.push({
          idDash: this.idDashFrom,
          id: '',
          invertMatches: false,
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
        this.$store.commit('declineFilterChanges', this.idDashFrom);
        this.$store.commit('clearFocusedFilter', this.idDashFrom);
        this.focusedRow = null;
        this.filters = this.$store.getters.getFilters(this.idDashFrom);
      },
      deleteFilterPart(filterPart) {
        let filterIndex = this.focusedFilter.parts.indexOf(filterPart);
        this.focusedFilter.parts.splice(filterIndex, 1);
      },
      refreshFilter(filter) {
        this.filterChanged = true;
        this.$store.commit('refreshFilter', filter);
      },
      openFilterPartModal(filterPart) {
        this.filterPartInModal = filterPart
          ? filterPart
          : {
              filterPartType: 'token',
              operationToken: 'OR',
              token: null,
              values: [],
              fieldType: 'string',
              operationManual: 'exactMatch',
              fieldName: null,
              value: null,
            };
        this.filterPartModalShow = true;
      },
      saveFilterPart(filterPart) {
        if (filterPart && this.focusedFilter.parts.indexOf(filterPart) === -1)
          this.focusedFilter.parts.push(filterPart);
        this.filterPartInModal = {};
        this.filterPartModalShow = false;
      },
      closeFilterPart() {
        this.filterPartInModal = {};
        this.filterPartModalShow = false;
      },
    },
    mounted() {
      this.filters = this.$store.getters.getFilters(this.idDashFrom);
      this.$store.commit('clearFocusedFilter', this.idDashFrom);
    },
  };
</script>

<style lang="sass" scoped>
  .new-filter-button
    opacity: 0.5

  .dash-filter-panel
    width: 100%
    max-height: 300px

  .filter-row
    padding: 2px
    height: 60px !important
    margin: 20px 0 20px 0

  .focused-filter-row
    padding: 0
    border: 2px solid
    border-radius: 4px

  .reverse-button-active
    border:4px solid red
</style>
