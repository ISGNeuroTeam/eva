<template>
  <div class="Buttons">
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

    <!--    <span class="ButtonsSeparator" />

    <base-dropdown
      v-if="false"
      class="listDropDownWrapper"
    >
      <div slot="toggle-btn">
        <base-tooltip
          content="Load from local file"
          placement="bottom"
        >
          <base-icon-button>
            <span
              v-if="!loadListIsActive"
              class="FontIcon size_md"
              :class="loadArrowIcon"
              @click="openLoadFileList"
            />
            <span
              v-else
              class="FontIcon size_md"
              :class="loadArrowIcon"
              @click="loadListIsActive = false"
            />
          </base-icon-button>
        </base-tooltip>

        <div
          v-if="loadListIsActive"
          class="Select"
        >
          <ul
            v-click-outside="openLoadFileList"
            class="Menu"
          >
            <li
              v-for="(item, index) in this.loadFiles"
              :key="index"

              class="Item"
              @click="loadFile(index)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
      <span slot="icon-arrow" />
    </base-dropdown>

    <base-dropdown class="listDropDownWrapper">
      <div slot="toggle-btn">
        <base-tooltip
          content="Download file"
          placement="bottom"
        >
          <base-icon-button>
            <span
              v-if="!downloadListIsActive"
              class="FontIcon size_md"
              :class="downloadArrowIcon"
              @click="openDownloadFileList"
            />
            <span
              v-else
              class="FontIcon size_md"
              :class="downloadArrowIcon"
              @click="downloadListIsActive = false"
            />
          </base-icon-button>
        </base-tooltip>

        <div
          v-if="downloadListIsActive"
          class="Select"
        >
          <ul
            v-click-outside="closeDownloadFileList"
            class="Menu"
          >
            <li
              v-for="(item, index) in this.downloadFiles"
              :key="index"

              class="Item"
              @click="downloadFile(index)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
      <span slot="icon-arrow" />
    </base-dropdown>

    <span class="ButtonsSeparator" />
    <base-tooltip
      content="Undo"
      placement="bottom"
    >
      <base-icon-button @click="$emit('action', 'undo')">
        <span class="FontIcon name_undo" />
      </base-icon-button>
    </base-tooltip>

    <base-tooltip
      content="Redo"
      placement="bottom"
    >
      <base-icon-button @click="$emit('action', 'redo')">
        <span class="FontIcon name_redo" />
      </base-icon-button>
    </base-tooltip>-->
  </div>
</template>

<script>
import {
  mdiUpload,
  mdiTableRowPlusAfter,
  mdiDelete,
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
  padding: 0 10px 10px;
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
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  width: 249px;
  display: inline-block;
  vertical-align: middle;
  z-index: 1;

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
