<template>
  <div class="Buttons">
    <!--upload-->
    <v-tooltip
      v-if="getButtonVisibleStatus('upload')"
      bottom
      :color="theme.$accent_ui_color"
    >
      <template v-slot:activator="{ on }">
        <div class="d-flex">
          <v-icon
            class="FontIcon name_cloudUp"
            :style="{ color: theme.$secondary_text }"
            v-on="on"
            @click="$emit('action', 'writeData')"
          >
            {{ mdiUpload }}
          </v-icon>
        </div>
      </template>
      <span>Write to server</span>
    </v-tooltip>
    <!--addRow-->
    <v-tooltip
      v-if="getButtonVisibleStatus('addRow')"
      bottom
      :color="theme.$accent_ui_color"
    >
      <template v-slot:activator="{ on }">
        <div class="d-flex">
          <v-icon
            class="FontIcon name_addRow"
            :style="{ color: theme.$secondary_text }"
            v-on="on"
            @click="$emit('action', 'addDataRow')"
          >
            {{ mdiTableRowPlusAfter }}
          </v-icon>
        </div>
      </template>
      <span>Add new row</span>
    </v-tooltip>
    <!--deleteRow-->
    <v-tooltip
      v-if="getButtonVisibleStatus('deleteRow')"
      bottom
      :color="theme.$accent_ui_color"
    >
      <template v-slot:activator="{ on }">
        <div class="d-flex">
          <v-icon
            class="FontIcon name_deleteRow"
            :style="{ color: theme.$secondary_text }"
            v-on="on"
            @click="$emit('action', 'removeDataRow')"
          >
            {{ mdiDelete }}
          </v-icon>
        </div>
      </template>
      <span>Delete selected rows</span>
    </v-tooltip>
    <!--undo-->
    <v-tooltip
      v-if="getButtonVisibleStatus('undo')"
      bottom
      :color="theme.$accent_ui_color"
    >
      <template v-slot:activator="{ on }">
        <div class="d-flex">
          <v-icon
            class="FontIcon name_deleteRow"
            :style="{ color: theme.$secondary_text }"
            v-on="on"
            @click="$emit('action', 'undo')"
          >
            {{ mdiDelete }}
          </v-icon>
        </div>
      </template>
      <span>Undo</span>
    </v-tooltip>
    <!--redo-->
    <v-tooltip
      v-if="getButtonVisibleStatus('redo')"
      bottom
      :color="theme.$accent_ui_color"
    >
      <template v-slot:activator="{ on }">
        <div class="d-flex">
          <v-icon
            class="FontIcon name_deleteRow"
            :style="{ color: theme.$secondary_text }"
            v-on="on"
            @click="$emit('action', 'redo')"
          >
            {{ mdiDelete }}
          </v-icon>
        </div>
      </template>
      <span>Redo</span>
    </v-tooltip>
    <v-menu
      v-if="getButtonVisibleStatus('download')"
      class="listDropDownWrapper"
    >
      <template v-slot:activator="{ on }">
        <div class="d-flex">
          <v-icon
            :style="{ color: theme.$secondary_text }"
            v-on="on"
          >
            {{ mdiDownload }}
          </v-icon>
        </div>
      </template>
      <div class="Select">
        <ul class="Menu">
          <li
            v-for="(item, index) in downloadFiles"
            :key="index"

            class="Item"
            @click="downloadFile(index)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
      <span slot="icon-arrow" />
    </v-menu>
  </div>
</template>

<script>
import {
  mdiUpload,
  mdiTableRowPlusAfter,
  mdiDelete,
  mdiDownload,
} from '@mdi/js';

export default {
  name: 'DashTableV2Control',
  props: {
    writeStatus: {
      type: String,
      default: '',
    },
    activeButtons: {
      type: Array,
      default: () => ([]),
    },
  },
  data: () => ({
    // icons
    mdiUpload,
    mdiTableRowPlusAfter,
    mdiDelete,
    mdiDownload,
    downloadListIsActive: false,
    downloadFiles: {
      downloadCSV: 'CSV',
      downloadJSON: 'JSON',
      downloadXLSX: 'XLSX',
      downloadPDF: 'PDF',
      downloadHTML: 'HTML',
    },
    loadListIsActive: false,
    loadFiles: {
      loadCSV: 'CSV',
      loadJSON: 'JSON',
    },
  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    saveIcon() {
      if (this.writeStatus === 'run') {
        return 'name_loader';
      }
      if (this.writeStatus === 'done') {
        return 'name_downloadDone';
      }
      return 'name_save';
    },
    loadArrowIcon() {
      if (this.loadListIsActive) {
        return 'FontIcon name_chevronDown rotate_180';
      }
      return 'FontIcon name_fileBlankFill';
    },
    downloadArrowIcon() {
      if (this.downloadListIsActive) {
        return 'FontIcon name_chevronDown rotate_180';
      }
      return 'FontIcon name_download';
    },
  },
  methods: {
    getButtonVisibleStatus(id) {
      return this.activeButtons.includes(id);
    },
    openDownloadFileList() {
      this.downloadListIsActive = true;
    },
    downloadFile(downloadType) {
      this.$emit('action', downloadType);
      this.closeDownloadFileList();
    },
    closeDownloadFileList() {
      if (this.downloadListIsActive === true) {
        this.downloadListIsActive = false;
      }
    },
    openLoadFileList() {
      this.loadListIsActive = true;
    },
    loadFile(loadType) {
      this.$emit('action', loadType);
      this.closeLoadFileList();
    },
    closeLoadFileList() {
      if (this.loadListIsActive === true) {
        this.loadListIsActive = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.Buttons {
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  column-gap: 4px;
  row-gap: 10px;

  &Separator {
    height: 28px;
    width: 2px;
    background-color: var(--border_secondary);
    display: inline-block;
    vertical-align: middle;
  }
}

.Select {
  min-width: 160px;
  width: 249px;
  display: inline-block;
  vertical-align: middle;

  .Menu {
    border: 1px solid var(--border);
    background-color: var(--background_main);
    list-style-type: none;
    border-radius: 4.44px;
    margin: 0;
    max-height: 251px;
    overflow-y: scroll;
    padding: 3px;
    margin-top: -1px;
  }

  .Item {
    font-weight: 400;
    font-size: 14px;
    color: var(--text_secondary);
    padding: 7px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;

    & + .Item::after {
      content: '';
      position: absolute;
      top: -0.5px;
      left: 0;
      width: calc(100% + 6px);
      margin-left: -3px;
      height: 1px;
      background-color: var(--border);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      box-shadow: 0 0 0 3px var(--button_primary);
      border-radius: 1px;
      pointer-events: none;
      opacity: 0;
      transition: opacity .1s ease;
      z-index: 1;
    }

    &:hover {
      color: var(--text_main);
      z-index: 5;

      &::before {
        opacity: 1;
      }
    }
  }
}
</style>
