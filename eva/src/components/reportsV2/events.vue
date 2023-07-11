<template>
  <div
    class="events"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
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
      :style="{
        background: theme.$main_bg,
        color: theme.$main_text,
        borderColor: theme.$secondary_border,
      }"
    >
      <template v-slot:item="{ item, expand, isExpanded }">
        <tr :class="{ expanded: isExpanded }">
          <td>
            <v-icon
              :color="theme.$main_text"
              @click="expand(!isExpanded)"
            >
              {{ isExpanded ? mdiChevronDown : mdiChevronRight }}
            </v-icon>
          </td>
          <td class="text-xs-right">
            {{ item.time }}
          </td>
          <td class="text-xs-right">
            {{ item.inputCount }}
          </td>
        </tr>
      </template>

      <template v-slot:expanded-item="elem">
        <td
          :colspan="elem.headers.length"
          class="collapse-row"
        >
          <div style="margin-left: 216px">
            <div
              v-for="(name) in fields"
              :key="name"
            >
              <template v-if="elem.item.inputCount[name] !== undefined">
                <span
                  v-if="name !== '_time'"
                  :style="{ color: theme.$raspberry }"
                >{{ name }}:
                </span>
                <span
                  v-if="name !== '_time'"
                  :style="{ color: theme.$forest }"
                >{{ elem.item.inputCount[name] }}</span>
              </template>
            </div>
          </div>
        </td>
      </template>

      <template v-slot:top="{ pagination, options, updateOptions }">
        <v-data-footer
          :style="{ color: theme.$main_text }"
          :pagination="pagination"
          :options="options"
          items-per-page-text="$vuetify.dataTable.itemsPerPageText"
          @update:options="updateOptions"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import {
  mdiRefresh,
  mdiMagnify,
  mdiChevronRight,
  mdiChevronDown,
} from '@mdi/js';

export default {
  props: {
    data: {
      type: Array,
      default: () => ([]),
    },
    schema: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      mdiRefresh,
      mdiMagnify,
      mdiChevronRight,
      mdiChevronDown,
      expanded: [],
      headers: [
        {
          text: 'Инфо',
          align: 'left',
          sortable: false,
          value: 'info',
          width: '80px',
        },
        {
          text: 'Время', sortable: false, value: 'time', width: '120px',
        },
        { text: 'Данные', sortable: false, value: 'inputCount' },
      ],
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    fields() {
      return Object.keys(this.schema);
    },
    dataset() {
      const dataset = [];
      let id = 0;
      this.data.forEach((item) => {
        const options = {
          hour12: 'true',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        };
        dataset.push({
          // eslint-disable-next-line no-underscore-dangle
          time: new Date(item._time * 1000).toLocaleString('ru', options),
          inputCount: item,
          id,
        });
        id += 1;
      });
      return dataset;
    },
  },
};
</script>

<style lang="sass">
@import './../../sass/_colors'
#app .theme--light.v-data-table .v-data-table__wrapper table tbody tr:hover
  background:  $accent_ui_color !important
.events
  .collapse-row
    border-bottom: thin solid rgba(0, 0, 0, 0.12) !important
  .v-data-footer
    border-top: none !important
    .v-icon
      color: $main_text !important
    .v-select__selections
      color: $main_text !important
    .v-input__slot:before
      border-color: $main_text !important
  .v-data-table-header
    th
      background-color: $secondary_border !important
      color: $main_text !important
  .expanded
    td
      border-bottom: none !important
  td
    font-size: 13px !important
  tr:hover
    color: $main_bg !important
    background-color: $accent_ui_color !important

</style>
