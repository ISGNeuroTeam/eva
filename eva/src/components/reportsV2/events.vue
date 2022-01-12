<template>
  <div
      class="events"
      :style="{background: theme.$main_bg, color: theme.$main_text}"
  >
    <v-data-table
      dense
      :headers="headers"
      :items="dataset"
      item-key="id"
      hide-default-footer
      fixed-header
      :expanded.sync="expanded"
      :single-expand="false"
      :style="{background: theme.$main_bg, color: theme.$main_text, borderColor: theme.$secondary_border}"
    >
      <template v-slot:item="{ item, expand, isExpanded }">
        <tr :class="{ expanded: isExpanded }">
          <td>
            <v-icon :color="theme.$main_text" @click="expand(!isExpanded)">{{ isExpanded ? mdiChevronDown : mdiChevronRight}}</v-icon>
          </td>
          <td class="text-xs-right">{{ item.time }}</td>
          <td class="text-xs-right">
            {{ item.inputCount }}
<!--            <br />-->
<!--            <div v-if="isExpanded">-->
<!--              <div v-for="(value, name) in item.inputCount">-->
<!--                <span v-if="name != '_time'" :style="{color: theme.$raspberry}">{{ name }}: </span>-->
<!--                <span v-if="name != '_time'" :style="{color: theme.$forest}">{{ value }}</span>-->
<!--              </div>-->
<!--            </div>-->
          </td>
        </tr>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="collapse-row">
          <div style="margin-left: 216px">
            <div v-for="(value, name) in item.inputCount">
              <span v-if="name != '_time'" :style="{color: theme.$raspberry}">{{ name }}: </span>
              <span v-if="name != '_time'" :style="{color: theme.$forest}">{{ value }}</span>
            </div>
          </div>
        </td>
      </template>

      <template v-slot:top="{ pagination, options, updateOptions }">
        <v-data-footer
          :style="{color: theme.$main_text}"
          :pagination="pagination"
          :options="options"
          @update:options="updateOptions"
          items-per-page-text="$vuetify.dataTable.itemsPerPageText"/>
      </template>
    </v-data-table>
  </div>
</template>


<script>
import { mdiRefresh, mdiMagnify, mdiChevronRight, mdiChevronDown } from '@mdi/js'

export default {
  props: {
    data: [],
  },
  data () {
    return {
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
      mdiChevronRight: mdiChevronRight,
      mdiChevronDown: mdiChevronDown,
      expanded: [],
      headers: [
        { text: 'Инфо',  align: 'left', sortable: false, value: 'info', width: '80px' },
        { text: 'Время', sortable: false, value: 'time', width: '120px' },
        { text: 'Данные', sortable: false, value: 'inputCount' },
      ],
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
    dataset () {
      let dataset = []
      let id = 0
      this.data.forEach(item => {
        let options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        };
        dataset.push({time: new Date(item._time*1000).toLocaleString("ru", options), inputCount: item, id: id})
        id++
      })
      console.log(dataset)
      return dataset
    },
  },
  methods: {},
  mounted() {}
}


</script>

<style lang="sass">
@import './../../sass/_colors'
.events
  .collapse-row 
    border-bottom: 1px solid $main-border
  .v-data-footer
    border-top: none
    .v-icon
      color: $main_text
    .v-select__selections
      color: $main_text
    .v-input__slot:before
      border-color: $main_text !important
  .v-data-table-header
    th
      background-color: $secondary_border !important
      color: $main_text !important
  .expanded
    background-color: red
  td
    font-size: 13px !important
    //border-bottom: none !important
    &:last-child
      //border-bottom: none !important
  tr:hover
    color: $main_bg
    background-color: $accent_ui_color !important
</style>