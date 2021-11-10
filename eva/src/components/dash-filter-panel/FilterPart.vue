<template>
  <div class="part-container">
    <div class="data-col">
      <template v-if="filterPart.filterPartType === 'token'">
        <div class="part-title">
          <svg v-if="filterPart.invertMatches" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.99998 13.3334L2.66665 10.6667L5.99998 8.00008V10.0001H14.6666V11.3334H5.99998V13.3334ZM9.99998 8.00008V6.00008H1.33331V4.66675H9.99998V2.66675L13.3333 5.33341L9.99998 8.00008Z" :fill="theme.$main_text"/>
          </svg>
          <span :title="elemName">{{ elemName }}</span>
        </div>
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
        <div class="part-title">
          <svg v-if="filterPart.invertMatches" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr-1">
            <path d="M5.99998 13.3334L2.66665 10.6667L5.99998 8.00008V10.0001H14.6666V11.3334H5.99998V13.3334ZM9.99998 8.00008V6.00008H1.33331V4.66675H9.99998V2.66675L13.3333 5.33341L9.99998 8.00008Z" :fill="theme.$main_text"/>
          </svg>
          {{ filterPart.fieldName }}: {{ filterPart.value }}
        </div>
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
  import {mapGetters} from "vuex";

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
      ...mapGetters([
        'getTockens'
      ]),
      getDashTokens() {
        return this.getTockens(this.idDash)
      },
      theme() {
        return this.$store.getters.getTheme;
      },
      elemRawName() {
        if (this.filterPart.token)
          return this.$store.state.store[this.idDash][this.filterPart.token.elem].name_elem;
        else {
          return 'Ручной фильтр';
        }
      },
      elemName() {
        let name = this.elemRawName;
        name && this.getDashTokens.forEach(token => {
          name = name.replaceAll(`$${token.name}$`, token.value)
        })
        return name
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
      display: flex
      align-items: center

      > span
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
