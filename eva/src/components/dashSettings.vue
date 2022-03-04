<template>
  <v-navigation-drawer
    v-model="gearShow"
    absolute
    width="320"
    left
    class="left-dash-setting"
    :color="theme.$main_text"
    :style="{
      background: theme.$main_bg,
      borderTop: `2px solid ${theme.$main_border}`,
      borderBottom: `2px solid ${theme.$main_border}`,
    }"
    :permissions="permissions"
  >
    <div
      class="line-setting"
      :style="{ background: theme.$main_bg }"
    />
    <div class="setting">
      <div
        class="labelSetting"
        :style="{ color: theme.$main_text }"
      >
        Режим редактирования
      </div>
      <v-switch
        v-model="mode"
        class="switch"
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text }"
        :label="labels[mode]"
      />
      <div
        class="divider-setting"
        :style="{ background: theme.$title }"
      />
    </div>
    <div class="setting">
      <div
        class="labelSetting"
        :style="{ color: theme.$main_text }"
      >
        Размер сетки
      </div>
      <div class="sizeGrid">
        <v-text-field
          v-model="sizeGrid.vert"
          placeholder="24"
          label="Вертикально"
          :color="theme.$accent_ui_color"
          :style="{
            color: theme.$main_text,
            background: 'transparent',
            borderColor: theme.$main_border,
          }"
          outlined
          class="sizeGridItem"
          hide-details
          @blur="sendSizeGrid"
          @keyup.enter="sendSizeGrid"
        />
        <v-text-field
          v-model="sizeGrid.hor"
          placeholder="24"
          label="Горизонтально"
          :color="theme.$accent_ui_color"
          :style="{
            color: theme.$main_text,
            background: 'transparent',
            borderColor: theme.$main_border,
          }"
          outlined
          class="sizeGridItem"
          hide-details
          @blur="sendSizeGrid"
          @keyup.enter="sendSizeGrid"
        />
      </div>
      <div
        class="divider-setting"
        :style="{ background: theme.$title }"
      />
    </div>
    <div class="setting">
      <div
        class="labelSetting"
        :style="{ color: theme.$main_text }"
      >
        Перемещать/ изменять размер компонента
      </div>
      <v-switch
        v-model="dragresable"
        class="switch"
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text }"
        :label="labels[dragresable]"
      />
      <div
        class="divider-setting"
        :style="{ background: theme.$title }"
      />
    </div>

    <div class="setting">
      <div
        class="labelSetting"
        :style="{ color: theme.$main_text }"
      >
        Показывать сетку
      </div>
      <v-switch
        v-model="gridShow"
        class="switch"
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text }"
        :label="labels[gridShow]"
      />
      <div
        class="divider-setting"
        :style="{ background: theme.$title }"
      />
    </div>
    <div class="setting">
      <div
        class="labelSetting"
        :style="{ color: theme.$main_text }"
      >
        Вкладки
      </div>
      <v-switch
        v-model="showTabs"
        class="switch"
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text }"
        :label="labels[showTabs]"
      />
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    gearFrom: Boolean,
    idDashFrom: null,
    permissionsFrom: null,
  },
  data() {
    return {
      gearShow: false,
      settings: {},
      mode: process.env.VUE_APP_DASHBOARD_EDITING_MODE === 'true',
      sizeGrid: {
        vert: '32',
        hor: '18',
      },
      labels: {
        true: 'да',
        false: 'нет',
      },
      dragresable: true,
      showTabs: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    permissions() {
      this.setDragresable();
      return true;
    },
    getGridShow() {
      if (!this.dashFromStore.gridShow) {
        this.$store.commit('setState', [{
          object: this.dashFromStore,
          prop: 'gridShow',
          value: 'true',
        }]);
      }
      return this.dashFromStore.gridShow;
    },
    gridShow: {
      get() {
        return this.getGridShow === 'true';
      },
      set(value) {
        this.$store.commit('setGridShow', {
          id: this.idDashFrom,
          item: String(value),
        });
      },
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    getSizeGrid() {
      if (!this.dashFromStore?.grid) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'grid',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.grid,
            prop: 'vert',
            value: '32',
          },
          {
            object: this.dashFromStore.grid,
            prop: 'hor',
            value: '18',
          },
        ]);
      }
      return this.dashFromStore?.grid;
    },
    getDragResize() {
      if (!this.dashFromStore.dragRes) {
        this.$store.commit('setState', [{
          object: this.dashFromStore,
          prop: 'dragRes',
          value: 'true',
        }]);
      }
      return this.dashFromStore.dragRes;
    },
  },
  watch: {
    gearFrom(gear) {
      this.gearShow = !!gear;
    },
    mode() {
      this.$emit('changeMode');
    },
    dragresable() {
      this.$store.commit('setDragResize', {
        id: this.idDashFrom,
        item: String(this.dragresable),
      });
    },
    showTabs() {
      this.$store.commit('setTabMode', {
        idDash: this.idDashFrom,
        mode: this.showTabs,
      });
    },
  },
  mounted() {
    const grid = this.getSizeGrid;
    this.sizeGrid.vert = grid.vert;
    this.sizeGrid.hor = grid.hor;
    if (
      !this.permissionsFrom.includes('admin_all')
      && !this.permissionsFrom.includes('editdash')
    ) {
      this.dragresable = false;
    } else {
      const dragRes = this.getDragResize;
      this.dragresable = dragRes === 'true';
    }
    this.showTabs = this.$store.state[this.idDashFrom]?.tabs || false;
  },
  methods: {
    setDragresable() {
      this.dragresable = !(!this.permissionsFrom.includes('admin_all')
        && !this.permissionsFrom.includes('editdash'));
    },
    sendSizeGrid() {
      this.$store.commit('setSizeGrid', {
        id: this.idDashFrom,
        grid: JSON.parse(JSON.stringify(this.sizeGrid)),
      });
    },
  },
};
</script>

<style lang="scss">
@import '../sass/dashSettings.sass';
</style>
