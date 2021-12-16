<template>
    <div
        class="events"
        :style="{background: theme.$main_bg, color: theme.$main_text}"
    >
        <v-data-table
            :headers="headers"
            :items="dataset"
            class="elevation-1"
            item-key="time"
            hide-default-footer
            :expanded.sync="expanded"
            :single-expand="singleExpand"
            :style="{background: theme.$main_bg, color: theme.$main_text}"
        >
          <template v-slot:item="{ item, expand, isExpanded }">
            <tr>
              <td>
                <v-icon @click="expand(!isExpanded)">{{ isExpanded ? mdiChevronDown : mdiChevronRight}}</v-icon>
              </td>
              <td class="d-block d-sm-table-cell" v-for="field in Object.keys(item)">
                {{item[field]}}
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
      singleExpand: true,
      headers: [
        { text: 'Инфо',  align: 'left', sortable: false, value: 'info', width: '80px' },
        { text: 'Время', sortable: false, value: 'time', width: '120px' },
        { text: 'Input count', sortable: false, value: 'inputCount' },
      ],
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
    dataset () {
      let dataset = []
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
        dataset.push({time: new Date(item._time*1000).toLocaleString("ru", options), inputCount: item})
      })
      console.log(dataset)
      return dataset
    },
  },
  methods: {},
  mounted() {}
}


</script>

<style lang="sass" >
@import './../../sass/_colors'
.collapse-row 
  border-bottom: 1px solid $main-border
</style>