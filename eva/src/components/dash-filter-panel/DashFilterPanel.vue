<template>
  <div class="dash-filter-panel">
    <div
      v-if="filters.length <= 0"
      class="add-new-filter-form"
    >
      <v-text-field
        v-model="tempFilter.id"
        class="input-box"
        dense
        outlined
        hide-details
        placeholder="Введите название"
      />
      <v-btn
        class="action-btn save"
        small
        rounded
        depressed
        @click="saveTempFilter"
        v-text="'Сохранить'"
      />
    </div>

    <template v-else>
      <div
        v-for="(filter, filterIndex) in filters"
        :key="`${filter.id}-${filterIndex}`"
        class="filter-row"
      >
        <div
          class="filter-container"
          :class="{ focused: focusedRow === filterIndex }"
          :style="{
            marginBottom:
              filterIndex + 1 === filters.length &&
              !(filterIndex === tempFilterIndex)
                ? '10px'
                : 0,
          }"
          @click="focusRow(filterIndex)"
        >
          <!-- FILTER ID -->
          <div
            class="filter-id"
            :title="filter.id"
            v-text="filter.id"
          />

          <!-- FILTER PARTS -->
          <div
            v-if="filter.parts.length > 0"
            class="filter-parts"
          >
            <div
              class="scroll-btn prev"
              @click.stop="scrollFilterParts(filterIndex, true)"
            >
              <v-icon
                class="icon"
                v-text="mdiChevronLeft"
              />
            </div>
            <div
              :ref="`filter-${filterIndex}-parts-slider`"
              class="slider"
            >
              <div
                v-for="(part, partIndex) in filter.parts"
                :key="partIndex"
                class="slide"
                @click="
                  filterIndex === focusedRow
                    ? openFilterPartModal(part, partIndex)
                    : focusRow(filterIndex)
                "
              >
                <FilterPart
                  :id-dash="idDashFrom"
                  :filter-part="part"
                  :filter-part-index="partIndex"
                  :filter-index="filterIndex"
                  :edit-permission="editPermission"
                  :edit-mode="editMode"
                  :is-focused="focusedRow === filterIndex"
                />
              </div>
            </div>
            <div
              class="scroll-btn next"
              @click.stop="scrollFilterParts(filterIndex)"
            >
              <v-icon
                class="icon"
                v-text="mdiChevronRight"
              />
            </div>
          </div>

          <!-- ADD PART BUTTON -->
          <v-btn
            v-if="focusedRow === filterIndex"
            class="add-part-btn"
            small
            rounded
            depressed
            @click.stop.prevent="openFilterPartModal()"
          >
            <v-icon
              small
              left
              v-text="plusIcon"
            /> Добавить
          </v-btn>

          <!-- FILTER BUTTONS -->
          <div
            v-if="focusedRow === filterIndex"
            class="filter-buttons"
          >
            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
               :style="{zIndex: 100}"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :color="theme.$ok_color"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="applyTempParts"
                >
                  <v-icon v-text="acceptIcon" />
                </v-btn>
              </template>
              <span>Сохранить изменения</span>
            </v-tooltip>

            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              :style="{zIndex: 100}"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :color="theme.$error_color"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="declineTempParts"
                >
                  <v-icon v-text="declineIcon" />
                </v-btn>
              </template>
              <span>Отменить изменения</span>
            </v-tooltip>

            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              :style="{zIndex: 100}"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :color="
                    filter.invertMatches
                      ? theme.$primary_button
                      : theme.$main_text
                  "
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="reverseFilter(filter)"
                >
                  <v-icon v-text="reverseIcon" />
                </v-btn>
              </template>
              <span>Вычесть отфильтрованные значения</span>
            </v-tooltip>

            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              :style="{zIndex: 100}"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :color="theme.$main_text"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="refreshFilter(filter)"
                >
                  <v-icon v-text="refreshIcon" />
                </v-btn>
              </template>
              <span>Сбросить собранные токенами значения</span>
            </v-tooltip>

            <v-tooltip
              v-if="editPermission"
              bottom
              :color="theme.$accent_ui_color"
              :style="{zIndex: 100}"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-show="editMode"
                  :color="theme.$main_text"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="openFilterPreviewModal(filter)"
                >
                  <v-icon v-text="eyeIcon" />
                </v-btn>
              </template>
              <span>Посмотреть текст запроса фильтра</span>
            </v-tooltip>

            <v-tooltip
              v-if="editPermission"
              bottom
              :color="theme.$accent_ui_color"
              :style="{zIndex: 100}"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-show="editMode"
                  :color="theme.$error_color"
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click.stop.prevent="deleteFilter(filter)"
                >
                  <v-icon v-text="trashIcon" />
                </v-btn>
              </template>
              <span>Удалить фильтр</span>
            </v-tooltip>
          </div>
        </div>

        <!-- ADD TEMP FILTER BUTTON -->
        <div
          v-if="
            !(filterIndex === tempFilterIndex) && !(filterIndex === focusedRow)
          "
          class="add-new-filter-block"
          @click="tempFilterIndex = filterIndex"
        >
          <div class="inner-content">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.00002 12.8334C3.77836 12.8334 1.16669 10.2217 1.16669 7.00002C1.16669 3.77836 3.77836 1.16669 7.00002 1.16669C10.2217 1.16669 12.8334 3.77836 12.8334 7.00002C12.8298 10.2202 10.2202 12.8298 7.00002 12.8334ZM2.33335 7.10035C2.36095 9.66774 4.45733 11.7306 7.02484 11.7169C9.59234 11.703 11.6664 9.61773 11.6664 7.05019C11.6664 4.48265 9.59234 2.39739 7.02484 2.38352C4.45733 2.36979 2.36095 4.43263 2.33335 7.00002V7.10035ZM7.58335 9.91669H6.41669V7.58335H4.08335V6.41669H6.41669V4.08335H7.58335V6.41669H9.91669V7.58335H7.58335V9.91669Z"
                :fill="theme.$ok_color"
              />
            </svg>
            <span>Новый фильтр</span>
          </div>
        </div>

        <!-- TEMP FILTER ADD FORM -->
        <div
          v-if="filterIndex === tempFilterIndex"
          class="add-new-filter-form"
        >
          <v-text-field
            v-model="tempFilter.id"
            class="input-box"
            dense
            outlined
            hide-details
            placeholder="Введите название"
          />
          <v-btn
            class="action-btn save"
            small
            rounded
            depressed
            @click="saveTempFilter"
            v-text="'Сохранить'"
          />
          <v-btn
            class="action-btn decline"
            small
            rounded
            depressed
            @click="declineTempFilter"
            v-text="'Удалить'"
          />
        </div>
      </div>
    </template>

    <v-dialog
      v-model="filterPartModalShow"
      persistent
      max-width="400"
    >
      <FilterPartModal
        :id-dash="idDashFrom"
        :filter-part="filterPartInModal"
        :filter-part-index="filterPartIndexInModal"
        :edit-permission="editPermission"
        :edit-mode="editMode"
        @saveFilterPart="saveFilterPart"
        @closeFilterPartModal="closeFilterPartModal"
      />
    </v-dialog>

    <v-dialog
      v-model="showFilterPreviewModal"
      persistent
      max-width="400"
    >
      <FilterPreviewModal
        :filter="filterInPreviewModal"
        @closeFilterPreviewModal="closeFilterPreviewModal"
      />
    </v-dialog>
  </div>
</template>

<script>
import FilterPart from './FilterPart.vue';
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
  mdiChevronLeft,
  mdiChevronRight,
} from '@mdi/js';

export default {
  name: 'DashFilterPanel',
  components: { FilterPartModal, FilterPart, FilterPreviewModal },
  props: {
    editPermission: Boolean,
    idDashFrom: String,
    editMode: Boolean,
  },
  data() {
    return {
      mdiChevronLeft,
      mdiChevronRight,
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
        // this.$store.commit('clearFocusedFilter', this.idDashFrom)
      } else {
        if (this.filters[rowNumber].idDash !== this.idDashFrom) {
          this.filters[rowNumber].idDash = this.idDashFrom;
        }
        this.$store.commit('setFocusedFilter', this.filters[rowNumber]);
      }
    },
  },
  mounted() {
    this.filters = this.$store.getters.getFilters(this.idDashFrom);
    this.tempFilter = {
      id: '',
      idDash: this.idDashFrom,
      invertMatches: false,
      parts: [],
    };
    this.$store.commit('clearFocusedFilter', this.idDashFrom);
  },
  methods: {
    scrollFilterParts(filterIndex, isPrev = false) {
      const slider = this.$refs[`filter-${filterIndex}-parts-slider`][0];
      /** scroll to 1/5 of the visible slider width */
      const scroll = Math.floor(slider.clientWidth / 5);
      slider.scrollLeft += isPrev ? -scroll : scroll;
    },

    checkSliderOverflow(index) {
      const slider = this.$refs[`filter-${index}-parts-slider`];
      if (!slider) return false;

      const { clientWidth, scrollWidth } = slider[0];
      // this.$nextTick(() => {});
      return scrollWidth > clientWidth;
    },
    reverseFilter(filter) {
      filter.invertMatches = !filter.invertMatches;
    },
    focusRow(index) {
      if (this.focusedRow === null) this.focusedRow = index;
    },
    applyTempParts() {
      this.$store.commit('sortFilterParts', { idDash: this.idDashFrom });
      // this.$store.commit('clearFocusedFilter', this.idDashFrom)
      this.$store.commit('restartSearches', {
        idDash: this.idDashFrom,
        filter: this.filters[this.focusedRow].id,
      });
      this.focusedRow = null;
      this.filterChanged = false;
    },
    declineTempParts() {
      this.$store.commit('sortFilterParts', { idDash: this.idDashFrom });
      this.$store.commit('declineFilterChanges', this.idDashFrom);
      this.$store.commit('clearFocusedFilter', this.idDashFrom);
      this.focusedRow = null;
      this.filterChanged = false;
    },
    declineTempFilter() {
      this.tempFilter = {
        id: '',
        idDash: this.idDashFrom,
        invertMatches: false,
        parts: [],
      };
      this.tempFilterIndex = -1;
    },
    saveTempFilter() {
      if (this.filters.some((filter) => filter.id === this.tempFilter.id)) {
        //console.log('Фильтр с таким именем существует');
      } else if (!this.tempFilter.id) {
        //console.log('Введите имя');
      } else {
        if (!Number.isFinite(this.tempFilterIndex)) this.tempFilterIndex = 0;
        this.$store.commit('createFilter', {
          filter: this.tempFilter,
          index: this.tempFilterIndex,
        });
        this.tempFilter = {
          id: '',
          idDash: this.idDashFrom,
          invertMatches: false,
          parts: [],
        };
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
    saveFilterPart(filterPart, filterPartIndex) {
      this.$store.commit('saveFilterPart', {
        idDash: this.idDashFrom,
        filterPart,
        filterPartIndex,
      }); // Save into focused filter
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
};
</script>

<style lang="sass" scoped>
$main_text: var(--main_text)
$main_border: var(--main_border)
$secondary_text: var(--secondary_text)
$secondary_bg: var(--secondary_bg)
$secondary_border: var(--secondary_border)
$primary_button: var(--primary_button)
$ok_color: var(--ok_color)
$ok_color-rgb: var(--ok_color-rgb)
$error_color: var(--error_color)
$accent_ui_color: var(--accent_ui_color)

$filter-container-height: 60px

.dash-filter-panel
  width: 100%
  //max-height: calc((#{$filter-container-height} * 3) + 18px)
  overflow-y: auto
  max-height: 180px

  &::-webkit-scrollbar
    width: 6px

  &::-webkit-scrollbar-track
    background-color: transparent

  &::-webkit-scrollbar-thumb
    background-color: $main_border

  .add-new-filter-form
    display: flex
    align-items: center
    height: $filter-container-height
    padding: 0 20px

    .action-btn
      font-size: 14px
      font-weight: 600
      text-transform: none
      margin-left: 20px

      &.save
        color: $ok_color
        background-color: rgba($ok_color-rgb, .14)

      &.decline
        color: var(--error_color)
        background-color: rgba(var(--error_color-rgb), .14)

    .input-box::v-deep
      max-width: 350px

      &.v-text-field--outlined
        input
          color: $main_text
          caret-color: $accent_ui_color
          font-size: 15px

        fieldset
          border: 1px solid $main_border
          transition: border-color .3s

        &.v-input--is-focused
          fieldset
            border-color: $accent_ui_color

  .filter-row
    position: relative

    $add-new-filter-block-height: 4px
    $add-new-filter-inner-height: 18px


    .add-new-filter-block
      position: absolute
      bottom: 0
      width: 100%
      height: $add-new-filter-block-height
      transform: translateY(50%)
      z-index: 1

      .inner-content
        position: absolute
        bottom: 0
        width: 100%
        height: $add-new-filter-inner-height
        transform: translateY(calc((#{$add-new-filter-inner-height} - #{$add-new-filter-block-height}) / 2))
        display: flex
        align-items: center
        background-color: rgba($ok_color-rgb, .24)
        cursor: pointer
        color: $ok_color
        font-size: 12px
        font-weight: 600
        line-height: 15px
        padding: 0 20px
        visibility: hidden

      &:hover .inner-content
        visibility: visible

    .filter-container
      display: flex
      padding: 0 20px
      height: $filter-container-height
      border-top: 2px solid $secondary_bg
      border-bottom: 2px solid $secondary_bg
      transition: border-color .3s

      &.focused
        border-color: $main_border

      .filter-id
        align-self: center
        min-width: 80px
        max-width: 200px
        color: $main_text
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis

      .filter-parts
        min-width: 0
        display: flex
        margin-left: 20px
        border-left: 1px solid $secondary_border
        border-right: 1px solid $secondary_border

        .scroll-btn
          display: flex
          align-items: center
          justify-content: center
          cursor: pointer
          padding: 0 10px

          .icon
            color: $secondary_text

          &:hover .icon
            color: $primary_button

        .slider
          flex: 1 0
          display: flex
          overflow-x: hidden
          border-left: 1px solid $secondary_border
          border-right: 1px solid $secondary_border

          .slide
            padding: 0 15px

            &:not(:last-child)
              border-right: 1px solid $secondary_border

      .add-part-btn
        align-self: center
        margin: 0 20px
        background-color: rgba(var(--primary_button-rgb), .14)
        color: $primary_button
        font-weight: 600
        text-transform: none

      .filter-buttons
        flex-shrink: 0
        margin-left: auto
        display: flex
        align-items: center
        justify-content: flex-end
        border-left: 1px solid $secondary_border
        padding-left: 20px
</style>
