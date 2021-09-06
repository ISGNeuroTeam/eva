<template>
  <div class="dash-filter-panel" :style="{ 'background-color': theme.$secondary_bg }">
    <div v-if="filters.length > 0">
      <div
        v-for="(filter, filterIndex) in filters"
        :key="`${filter.id}-${filterIndex}`"
        :class="{ 'focused-filter-row': focusedRow === filterIndex }"
        class="filter-row-container"
      >
        <v-row
          no-gutters
          class="d-flex align-center filter-row"
          :style="{ 'border-color': theme.$primary_button, 'background-color': theme.$main_bg }"
          @click="focusRow(filterIndex)"
        >
          <!-- FILTER ID -->
          <v-col cols="1" class="d-flex align-center justify-center" style="height: 100%">
            {{ filter.id }}
          </v-col>

          <!-- FILTER PARTS -->
          <v-col
            class="d-flex align-center justify-space-between"
            style="width: 100%"
            :cols="editPermission ? 10 : 11"
            :style="{ 'border-left': `1px solid ${theme.$secondary_border}` }"
          >
            <div class="d-flex">
              <v-sheet :style="{ 'background-color': theme.$main_bg }" max-width="1200px">
                <v-slide-group>
                  <v-slide-item v-for="(part, indexPart) in filter.parts" :key="indexPart">
                    <div
                      @click.stop.prevent="
                        filterIndex === focusedRow
                          ? openFilterPartModal(part, indexPart)
                          : focusRow(filterIndex)
                      "
                      :style="{ 'border-right': `1px solid ${theme.$secondary_border}` }"
                    >
                      <filter-part
                        :idDash="idDashFrom"
                        :filterPart="part"
                        :filterPartIndex="indexPart"
                        :filterIndex="filterIndex"
                        :editPermission="editPermission"
                        :isFocused="focusedRow === filterIndex"
                      ></filter-part>
                    </div>
                  </v-slide-item>
                </v-slide-group>
              </v-sheet>

              <div class="d-flex align-center" v-if="focusedRow === filterIndex">
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
            </div>

            <div v-if="focusedRow === filterIndex">
              <v-tooltip bottom :color="theme.$accent_ui_color">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="green"
                    @click.stop.prevent="applyTempParts"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon> {{ acceptIcon }}</v-icon>
                  </v-btn>
                </template>
                <span>Сохранить изменения</span>
              </v-tooltip>
              <v-tooltip bottom :color="theme.$accent_ui_color">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    :color="theme.$error_color"
                    @click.stop.prevent="declineTempParts"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon> {{ declineIcon }}</v-icon>
                  </v-btn>
                </template>
                <span>Отменить изменения</span>
              </v-tooltip>
              <!-- When editPermission false refresh and reverse buttons into filterParts -->
              <v-tooltip v-if="!editPermission" bottom :color="theme.$accent_ui_color">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    :color="filter.invertMatches ? theme.$primary_button : theme.$main_text"
                    @click.stop.prevent="reverseFilter(filter)"
                    ><v-icon>{{ reverseIcon }}</v-icon>
                  </v-btn>
                </template>
                <span>Вычесть отфильтрованные значения</span>
              </v-tooltip>
              <v-tooltip v-if="!editPermission" bottom :color="theme.$accent_ui_color">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    @click.stop.prevent="refreshFilter(filter)"
                    :color="theme.$main_text"
                    v-if="!editPermission"
                    ><v-icon>{{ refreshIcon }}</v-icon>
                  </v-btn>
                </template>
                <span>Сбросить собранные токенами значения</span>
              </v-tooltip>
            </div>
          </v-col>

          <!-- FILTER BUTTONS -->
          <v-col
            cols="1"
            class="d-flex align-center justify-space-around"
            v-if="focusedRow === filterIndex && editPermission"
            :style="{ 'border-left': `1px solid ${theme.$secondary_border}` }"
          >
            <v-tooltip bottom :color="theme.$accent_ui_color">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  :color="filter.invertMatches ? theme.$primary_button : theme.$main_text"
                  @click.stop.prevent="reverseFilter(filter)"
                  ><v-icon>{{ reverseIcon }}</v-icon>
                </v-btn>
              </template>
              <span>Вычесть отфильтрованные значения</span>
            </v-tooltip>
            <v-tooltip bottom :color="theme.$accent_ui_color">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="refreshFilter(filter)"
                  :color="theme.$main_text"
                  ><v-icon>{{ refreshIcon }}</v-icon>
                </v-btn>
              </template>
              <span>Сбросить собранные токенами значения</span>
            </v-tooltip>
            <v-tooltip bottom :color="theme.$accent_ui_color">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="openFilterPreviewModal(filter)"
                  :color="theme.$main_text"
                  ><v-icon>{{ eyeIcon }}</v-icon>
                </v-btn>
              </template>
              <span>Посмотреть текст запроса фильтра</span>
            </v-tooltip>
            <v-tooltip bottom :color="theme.$accent_ui_color">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  :color="theme.$error_color"
                  @click.stop.prevent="deleteFilter(filter)"
                >
                  <v-icon>{{ trashIcon }}</v-icon>
                </v-btn>
              </template>
              <span>Удалить фильтр</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <div>
          <div
            v-if="!(filterIndex === tempFilterIndex) && !(filterIndex === focusedRow)"
            class="align-self-end new-filter-row"
          >
            <div
              class="new-filter-row-button subtitle-2"
              :style="{ color: theme.$ok_color }"
              @click.stop.prevent="tempFilterIndex = filterIndex"
            >
              <div class="new-filter-row-button-text">
                <v-icon small :color="theme.$ok_color"> {{ plusIcon }}</v-icon>
                Новый фильтр
              </div>
            </div>
          </div>

          <v-row
            no-gutters
            v-if="filterIndex === tempFilterIndex"
            class="temp-filter-container"
            :style="{ 'background-color': theme.$main_bg }"
          >
            <v-col cols="3" class="ml-12">
              <v-text-field hide-details outlined dense v-model="tempFilter.id"></v-text-field>
            </v-col>
            <v-col class="d-flex align-center">
              <v-btn
                rounded
                small
                class="ma-1"
                style="text-transform: none"
                :style="{
                  'background-color': 'rgba(76, 217, 100, 0.14)',
                  color: theme.$ok_color,
                  'font-size': '14px',
                }"
                depressed
                @click="saveTempFilter"
                >сохранить</v-btn
              >
              <v-btn
                rounded
                small
                class="ma-1"
                @click="declineTempFilter"
                style="text-transform: none"
                :style="{
                  color: theme.$error_color,
                  'background-color': 'rgba(255, 59, 48, 0.14)',
                  'font-size': '14px',
                }"
                depressed
                >отменить</v-btn
              >
            </v-col>
          </v-row>
        </div>
      </div>
    </div>

    <v-row
      v-else
      no-gutters
      class="temp-filter-container"
      :style="{ 'background-color': theme.$main_bg }"
    >
      <v-col cols="3" class="ml-12">
        <v-text-field hide-details outlined dense v-model="tempFilter.id"></v-text-field>
      </v-col>
      <v-col class="d-flex align-center">
        <v-btn
          rounded
          small
          class="ma-1"
          style="text-transform: none"
          :style="{
            'background-color': 'rgba(76, 217, 100, 0.14)',
            color: theme.$ok_color,
            'font-size': '14px',
          }"
          depressed
          @click="saveTempFilter"
          >сохранить</v-btn
        >
      </v-col>
    </v-row>

    <v-dialog max-width="400" v-model="filterPartModalShow" persistent>
      <filter-part-modal
        :idDash="idDashFrom"
        :filterPart="filterPartInModal"
        :filterPartIndex="filterPartIndexInModal"
        :editPermission="editPermission"
        @saveFilterPart="saveFilterPart"
        @closeFilterPartModal="closeFilterPartModal"
      />
    </v-dialog>

    <v-dialog max-width="400" v-model="showFilterPreviewModal" persistent>
      <filter-preview-modal
        @closeFilterPreviewModal="closeFilterPreviewModal"
        :filter="filterInPreviewModal"
      />
    </v-dialog>
  </div>
</template>

<script>
  import FilterPart from './FilterPart';
  import FilterPartModal from './FilterPartModal';
  import FilterPreviewModal from './FilterPreviewModal';

  import {
    mdiPlusCircleOutline,
    mdiTrashCanOutline,
    mdiRefresh,
    mdiCheck,
    mdiClose,
    mdiSwapHorizontal,
    mdiEyeOutline,
  } from '@mdi/js';

  export default {
    name: 'DashFilterPanel',
    components: { FilterPartModal, FilterPart, FilterPreviewModal },
    props: ['editPermission', 'idDashFrom'],
    data() {
      return {
        filters: [],
        tempFilter: {},
        tempFilterIndex: -1,
        focusedRow: null,
        filterPartModalShow: false,
        filterPartInModal: null,
        filterPartIndexInModal: null,
        filterInPreviewModal: null,
        showFilterPreviewModal: false,
        plusIcon: mdiPlusCircleOutline,
        trashIcon: mdiTrashCanOutline,
        refreshIcon: mdiRefresh,
        acceptIcon: mdiCheck,
        declineIcon: mdiClose,
        reverseIcon: mdiSwapHorizontal,
        eyeIcon: mdiEyeOutline,
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
        filter.invertMatches = !filter.invertMatches;
      },
      focusRow(index) {
        if (this.focusedRow === null) this.focusedRow = index;
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
      declineTempFilter() {
        this.tempFilter = { id: '', idDash: this.idDashFrom, invertMatches: false, parts: [] };
        this.tempFilterIndex = -1;
      },
      saveTempFilter() {
        if (this.filters.some(filter => filter.id === this.tempFilter.id)) {
          console.log('Фильтр с таким именем существует');
        } else if (!this.tempFilter.id) {
          console.log('Введите имя');
        } else {
          if (!Number.isFinite(this.tempFilterIndex)) this.tempFilterIndex = 0;
          this.$store.commit('createFilter', {
            filter: this.tempFilter,
            index: this.tempFilterIndex,
          });
          this.tempFilter = { id: '', idDash: this.idDashFrom, invertMatches: false, parts: [] };
          this.tempFilterIndex = -1;
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
      refreshFilter(filter) {
        this.filterChanged = true;
        this.$store.commit('refreshFilter', filter);
      },
      openFilterPartModal(filterPart, index) {
        this.filterPartIndexInModal = index;
        this.filterPartInModal = filterPart
          ? { ...filterPart }
          : {
              filterPartType: 'manual',
              operationToken: 'OR',
              token: null,
              fieldType: 'number',
              operationManual: '>',
              fieldName: null,
              value: null,
              invertMatches: false,
            };
        this.filterPartModalShow = true;
      },
      saveFilterPart(filterPart, index) {
        this.$store.commit('saveFilterPart', { idDash: this.idDashFrom, filterPart, index }); // Save into focused filter
        this.filterPartInModal = null; // setup default filterPart into openFilterPartModal method
        this.filterPartIndexInModal = null;
        this.filterPartModalShow = false;
      },
      closeFilterPartModal() {
        this.filterPartInModal = null;
        this.filterPartIndexInModal = null;
        this.filterPartModalShow = false;
      },
      openFilterPreviewModal(filter) {
        this.filterInPreviewModal = filter;
        this.showFilterPreviewModal = true;
      },
      closeFilterPreviewModal() {
        this.filterInPreviewModal = null;
        this.showFilterPreviewModal = false;
      },
    },
    mounted() {
      this.filters = this.$store.getters.getFilters(this.idDashFrom);
      this.tempFilter = { id: '', idDash: this.idDashFrom, invertMatches: false, parts: [] };
      this.$store.commit('clearFocusedFilter', this.idDashFrom);
    },
  };
</script>

<style lang="sass">

  .temp-filter-container
    margin-top: 4px !important
    padding: 10px 0 10px 0

    .v-text-field__slot input
      color: var(--main_text)

    .v-input__slot fieldset
      color: var(--main_text) !important

    .v-input__control
      .v-icon
        color: var(--main_text) !important

    .v-select__selections
      color: var(--main_text) !important

    .v-input input
      min-height: auto !important
</style>

<style lang="sass" scoped>
  .new-filter-row
    position: absolute
    width:100%
    height: 18px
    margin-top: -7px

    &:hover .new-filter-row-button
      visibility: visible

    .new-filter-row-button
      width: 100%
      background-color: rgba(76, 217, 100, 0.24)
      visibility: hidden
      border-radius: 3px
      bottom: 3px

      .new-filter-row-button-text
        opacity: 0.8
        margin-left: 20px
        font-style: normal
        font-weight: 600
        font-size: 12px
        line-height: 15px
        padding: 2px

  .dash-filter-panel
    width: 100%
    max-height: 300px

  .filter-row-container
    height: 100%
    margin-top:4px

    .filter-row
      height: 60px


  .focused-filter-row
    border: 2px solid
    border-radius: 4px

  .reverse-button-active
    border:4px solid red
</style>
