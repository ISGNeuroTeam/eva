<template>
  <div class="part-container">
    <div class="data-col">
      <template v-if="filterPart.filterPartType === 'token'">
        <div class="part-title" v-text="elemName" />
        <div class="part-subtitle">
          <span>{{ filterPart.fieldName }} ({{ filterPartValues.length }})</span>
          <v-menu
            v-if="filterPartValues.length > 0"
            offset-y
            max-height="300"
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                :color="theme.$secondary_text"
                right
                size="18"
                v-on="on"
                v-text="dropDownIcon"
              />
            </template>
            <v-list
              class="part-values-list"
              :style="{ color: theme.$main_text, backgroundColor: theme.$main_bg }"
            >
              <v-list-item v-for="(value, index) in filterPartValues" :key="index">
                <span class="flex-grow-1" v-text="value"/>
                <v-icon
                  v-if="isFocused"
                  :color="theme.$main_text"
                  right
                  size="20"
                  @click="removeValue(index)"
                  v-text="closeIcon"
                />
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template v-else>
        <div class="part-title">{{ filterPart.fieldName }}: {{ filterPart.value }}</div>
        <div class="part-subtitle" v-text="`(${filterPart.fieldType}) ${operationManualTitle}`" />
      </template>
    </div>

    <div v-if="isFocused" class="button-col">
      <v-icon
        v-if="filterPart.filterPartType === 'token'"
        :color="theme.$main_text"
        size="20"
        @click.stop.prevent="
          $store.commit('refreshFilterPart', { idDash, filterIndex, filterPartIndex })
        "
        v-text="refreshIcon"
      />
      <v-icon
        v-if="editPermission || filterPart.filterPartType === 'manual'"
        v-show="editMode"
        :color="theme.$error_color"
        size="20"
        @click.stop.prevent="
          $store.commit('deleteFilterPart', { idDash, filterIndex, filterPartIndex })
        "
        v-text="closeIcon"
      />
    </div>
  </div>
</template>

<script>
  import { mdiCloseCircleOutline, mdiRefresh, mdiPencil, mdiChevronDown } from '@mdi/js';

  export default {
    name: 'FilterPart',
    props: [
      'idDash',
      'filterPart',
      'isFocused',
      'editPermission',
      'filterPartIndex',
      'filterIndex',
      'editMode'
    ],
    data() {
      return {
        closeIcon: mdiCloseCircleOutline,
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
      filterPartValues(){
        if (this.filterPart.token)
          return this.$store.state.store[this.idDash].filters[this.filterIndex].parts[this.filterPartIndex].values;
      }
    },
    methods: {
      removeValue(valueIndex) {
        let { idDash, filterIndex, filterPartIndex } = this;
        this.$store.commit('removeFilterPartValue', {
          idDash,
          filterIndex,
          filterPartIndex,
          valueIndex,
        });
      },
    },
  };
</script>

<style lang="sass" scoped>
.part-container
  display: flex
  height: 100%

  .data-col, .button-col
    display: flex
    flex-direction: column
    justify-content: space-evenly

  .data-col
    min-width: 100px

    .part-title
      color: var(--main_text)
      font-weight: 600
      max-width: 300px
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

    .part-subtitle
      display: flex
      align-items: center
      color: var(--secondary_text)
      font-size: 14px
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

  .button-col
    align-items: center
    margin-left: 20px
</style>
