<template>
  <v-treeview
    :open="openTreeItems"
    :items="treeItems"
    :dark="isDarkTheme"
    :load-children="loadGroupChildren"
    item-key="id"
    class="tree-nav"
    activatable
    open-on-click
    dense
    transition
    @update:active="onUpdateActive"
    @update:open="onUpdateOpen"
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon
        v-if="item.children !== undefined"
        :color="item.color === unusedColor ? null : item.color"
      >
        {{ item.icon || (open ? iconFolderOpen : iconFolder) }}
      </v-icon>
      <v-icon v-else>
        {{ item.icon || iconDashboard }}
      </v-icon>
    </template>
  </v-treeview>
</template>

<script>
import {
  mdiFolder,
  mdiFolderOpen,
  mdiFolderStar,
  mdiViewDashboard,
} from '@mdi/js';

export default {
  name: 'NavigationTreeView',
  props: {
    iconFolder: {
      type: String,
      default: mdiFolder,
    },
    iconFolderOpen: {
      type: String,
      default: mdiFolderOpen,
    },
    iconFavorite: {
      type: String,
      default: mdiFolderStar,
    },
    iconDashboard: {
      type: String,
      default: mdiViewDashboard,
    },
    unusedColor: {
      type: String,
      default: '#000000',
    },
  },
  data() {
    return {
      treeGroups: [],
      openTreeItems: [],
    };
  },
  computed: {
    treeItems() {
      return this.treeGroups;
      // @todo: необходимо для след. доработки
      /* return [
        {
          type: 'favorites',
          id: 'favorites',
          name: 'Избранные дашборды',
          icon: this.iconFavorite,
          children: [],
        },
        {
          type: 'groups',
          id: 'groups',
          name: 'Группы дашбордов',
          children: this.treeGroups,
        },
      ]; */
    },
    isDarkTheme() {
      return this.$store.getters.getThemeTitle.indexOf('light') === -1;
    },
  },
  mounted() {
    this.$store.dispatch('getGroups')
      .then((groups) => {
        this.treeGroups = groups.map(({ name, id, color }) => ({
          name,
          id,
          color,
          children: [],
          type: 'group',
        }));
        const { lastOpenGroup } = this.$store.state;
        if (lastOpenGroup) {
          this.$nextTick().then(() => {
            this.openTreeItems = [lastOpenGroup];
          });
        }
      });
  },
  methods: {
    onUpdateActive(id) {
      if (id) {
        this.$store.commit('setOpenTree', false);
        this.$router.push(`/dashboards/${id}`);
      }
    },
    onUpdateOpen(val) {
      if (val.length) {
        this.$store.commit('setLastOpenGroup', val[val.length - 1]);
      }
    },
    async loadGroupChildren(item) {
      if (item.type === 'group') {
        return this.$store.dispatch('getDashs', item.id)
          .then((items) => (item.children.push(...items.map((dash) => ({
            ...dash,
            disabled: `/dashboards/${dash.id}` === this.$route.path,
          })))));
      }
      return [];
    },
  },
};
</script>

<style lang="sass" scoped>
.tree-nav::v-deep
  .v-treeview-node--disabled
    .v-treeview-node__label, .v-treeview-node__prepend > span
      color: var(--primary_button)
</style>
