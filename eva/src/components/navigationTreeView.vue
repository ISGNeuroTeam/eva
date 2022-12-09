<template>
  <div>
    <div class="top-panel">
      <v-text-field
        v-model="filterText"
        placeholder="Фильтр"
        hide-details
        clearable
        outlined
        dense
        class="ml-2"
        style="width: 250px;display: inline-block"
      />
      <v-btn
        class="ma-2"
        icon
        color="primary"
        @click="filterText = ''; updateTree(false)"
      >
        <v-icon v-text="$props.iconReload" />
      </v-btn>
    </div>
    <v-treeview
      ref="tree"
      :items.sync="treeItems"
      :dark="isDarkTheme"
      :search="`roles-${filterText}`"
      :filter="filterFunction"
      :load-children="loadGroupChildren"
      item-key="treeId"
      item-disabled="editable"
      class="tree-nav pb-7"
      activatable
      open-on-click
      dense
      transition
      @update:active="onUpdateActive"
      @update:open="onUpdateOpen"
    >
      <template v-slot:prepend="{ item, open }">
        <v-icon v-if="['group', 'custom-group'].includes(item.type)">
          {{ iconFolderImage }}
        </v-icon>
        <v-icon v-else-if="item.type === 'dash'">
          {{ iconDashboard }}
        </v-icon>
        <v-icon v-else-if="item.children !== undefined">
          {{ item.icon || (open ? iconFolderOpen : iconFolder) }}
        </v-icon>
        <v-icon v-else>
          {{ item.icon || iconDashboard }}
        </v-icon>
      </template>
      <template v-slot:label="{ item }">
        <span
          v-if="item.editable === true"
          @click.stop
        >
          <v-row>
            <v-col>
              <v-select
                :value="item.type"
                dense
                outlined
                hide-details
                :items="typesForAdd"
                @change="onChangeItemType($event, item)"
              />
            </v-col>
            <v-col v-if="item.type === 'dash'">
              <v-text-field
                :value="item.dash"
                placeholder="ID Дашборда"
                dense
                outlined
                hide-details
                @change="setCategoryItem({
                  treeId: item.treeId,
                  props: {
                    id: $event,
                    dash: $event,
                  },
                })"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-if="item.type !== 'custom-group'"
                :value="item.name"
                placeholder="Название"
                dense
                outlined
                hide-details
                @change="setCategoryItem({
                  treeId: item.treeId,
                  props: { name: $event },
                })"
              />
              <v-autocomplete
                v-else
                :value="item.group"
                :items="treeGroups"
                item-text="name"
                return-object
                placeholder="Выберите группу дошбордов"
                persistent-placeholder
                dense
                outlined
                hide-details
                @change="setCategoryItem({
                  treeId: item.treeId,
                  props: { group: $event },
                })"
              />
            </v-col>
            <v-col>
              <v-autocomplete
                :value="item.roles"
                dense
                outlined
                hide-details
                multiple
                :items="allRoles"
                placeholder="Все роли"
                @change="setCategoryItem({
                  treeId: item.treeId,
                  props: { roles: $event },
                })"
              />
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="success"
                class="mr-3"
                @click.stop="onClickSaveCategory($event, item); $refs.tree.$forceUpdate()"
              >
                Ok
              </v-btn>
            </v-col>
          </v-row>
        </span>
        <div
          v-else
          :title="(isAdmin && item.roles && item.roles.length) ? `Роли: ${ item.roles}` : null"
          @click.middle="onClickMiddleMouse(item)"
        >
          {{ item.name }}
        </div>
      </template>
      <template
        v-if="editable && isAdmin"
        v-slot:append="{ item, open }"
      >
        <template
          v-if="item.editable !== undefined"
          @click.stop
        >
          <v-btn
            v-if="open && !item.editable && ['categories', 'category'].includes(item.type)"
            icon
            color="primary"
            @click.stop="addNewCategory($event, item)"
          >
            <v-icon v-text="$props.iconFolderPlus" />
          </v-btn>
          <v-btn
            v-if="['custom-group', 'category', 'dash'].includes(item.type)"
            icon
            @click.stop="onClickEditItem($event, item)"
          >
            <v-icon v-text="$props.iconFolderEdit" />
          </v-btn>
          <v-btn
            v-if="['custom-group', 'category', 'dash'].includes(item.type)"
            icon
            color="error"
            @click.stop="removeCategoryItem(item.treeId);saveOnServer()"
          >
            <v-icon v-text="$props.iconFolderRemove" />
          </v-btn>
        </template>
      </template>
    </v-treeview>
  </div>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from 'uuid';
import {
  mdiFolder,
  mdiFolderOpen,
  mdiFolderStar,
  mdiViewDashboard,
  mdiFolderHome,
  mdiSync,
  mdiFolderPlus,
  mdiFolderRemove,
  mdiFolderEdit,
  mdiFolderImage,
  mdiFolderDownload,
} from '@mdi/js';
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'NavigationTreeView',
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
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
    iconFolderCategory: {
      type: String,
      default: mdiFolderHome,
    },
    iconReload: {
      type: String,
      default: mdiSync,
    },
    iconFolderPlus: {
      type: String,
      default: mdiFolderPlus,
    },
    iconFolderRemove: {
      type: String,
      default: mdiFolderRemove,
    },
    iconFolderEdit: {
      type: String,
      default: mdiFolderEdit,
    },
    iconFolderImage: {
      type: String,
      default: mdiFolderImage,
    },
    iconFolderDownload: {
      type: String,
      default: mdiFolderDownload,
    },
  },
  data() {
    return {
      filterText: '',
      typesForAdd: [
        { text: 'Категория', value: 'category' },
        { text: 'Группа дашбордов', value: 'custom-group' },
        { text: 'Дашборд', value: 'dash' },
      ],
    };
  },
  computed: {
    ...mapGetters('app', [
      'treeCategories',
      'treeGroups',
      'roleList',
      'treeOpenItems',
    ]),
    ...mapGetters('auth', [
      'isAdmin',
    ]),
    allRoles() {
      return this.$store.state.app.roles.map((item) => item.name);
    },
    treeItems() {
      return [
        {
          type: 'categories',
          treeId: 'categories',
          name: 'Категории',
          icon: this.iconFolderCategory,
          editable: false,
          children: this.treeCategories,
        },
        // @todo: в следующей серии - Избранные дашборды
        /* {
          type: 'favorites',
          treeId: 'favorites',
          name: 'Избранные дашборды',
          icon: this.iconFavorite,
          children: [],
        }, */
        {
          type: 'groups',
          treeId: 'groups',
          name: 'Доступные дашборды',
          children: [...this.treeGroups],
        },
      ];
    },
    isDarkTheme() {
      return this.$store.getters.getThemeTitle.indexOf('light') === -1;
    },
  },
  async mounted() {
    await this.$store.dispatch('app/loadGroups', true);
    await this.$store.dispatch('app/loadSettings', true);
    await this.$store.dispatch('app/loadRoles');
    await this.updateTree(true);
    await this.activeCurrentDash();
  },
  methods: {
    ...mapActions('app', [
      'saveTreeCategories',
      'loadGroups',
      'loadSettings',
      'loadGroup',
      'loadCategoryGroup',
      'getTreeCategoryItem',
      'getTreeGroupItem',
    ]),
    ...mapMutations('app', [
      'setCategoryItem',
      'pushCategoryItem',
      'removeCategoryItem',
    ]),
    filterFunction(item, text, fieldName) {
      const searchByText = () => ['dash', 'group', 'custom-group'].includes(item.type)
          && item[fieldName].toLowerCase().indexOf(`${this.filterText}`.toLowerCase()) > -1;

      // @todo: проверить функию поиска [test]
      const accessByRole = () => !!item.roles
        && item.roles.some((role) => this.roleList.includes(role));

      if (this.filterText) {
        return searchByText() && (accessByRole() || this.isAdmin || item.type === 'dash');
      }
      if (accessByRole() || this.isAdmin) {
        return true;
      }
      return ['favorites', 'groups'].includes(item.type);
    },
    async onUpdateActive(treeId) {
      const categoryItem = await this.getTreeCategoryItem({ id: treeId[0], idParam: 'treeId' });
      const item = categoryItem || await this.getTreeGroupItem({ id: treeId[0], idParam: 'treeId' });
      if (item && item.type === 'dash') {
        this.$store.commit('app/setOpenTree', false);
        this.$store.commit('app/treeOpenItems', [...this.$refs.tree.openCache]);
        await this.$router.push(`/dashboards/${item.id}`);
      }
    },
    onClickMiddleMouse(item) {
      if (item.type === 'dash') {
        this.$store.commit('app/treeOpenItems', [...this.$refs.tree.openCache]);
        const routeData = this.$router.resolve(`/dashboards/${item.id}`);
        window.open(routeData.href, '_blank');
        this.$refs.tree.updateActive(item.treeId, true);
      }
    },
    onUpdateOpen(opened) {
      if (opened.length) {
        this.$store.commit('app/treeOpenItems', opened);
      }
    },
    async updateTree(lazy = false) {
      const open = [...this.treeOpenItems];
      open.forEach((treeId) => {
        const { vnode } = this.$refs.tree.nodes[treeId];
        if (vnode) {
          vnode.isOpen = false;
          vnode.isLoaded = false;
        }
      });
      await this.loadSettings(lazy);
      await this.loadGroups(lazy);
      open.forEach((treeId) => {
        const { vnode } = this.$refs.tree.nodes[treeId];
        if (vnode) {
          vnode.isOpen = false;
          vnode.isLoaded = false;
        }
        this.$refs.tree.updateOpen(treeId, true);
      });
    },
    async loadGroupChildren(item) {
      if (item.type === 'groups') {
        await this.$store.dispatch('app/loadGroups');
      } else if (item.type === 'categories') {
        await this.$store.dispatch('app/loadSettings');
      } else if (item.type === 'custom-group') {
        return this.loadCategoryGroup(item.treeId);
      } else if (item.type === 'group') {
        return this.loadGroup(item.treeId);
      }
      return [];
    },
    onClickEditItem(event, item) {
      this.setCategoryItem({
        treeId: item.treeId,
        props: {
          editable: !item.editable,
        },
      });
      this.$refs.tree.$forceUpdate();
    },
    addNewCategory(event, item) {
      const id = uuidv4();
      this.pushCategoryItem({
        treeId: item.treeId,
        item: {
          name: 'Новая категория',
          id,
          type: 'category',
          treeId: id,
          children: [],
          roles: [],
          editable: true,
        },
      });
      this.$refs.tree.updateOpen(item.treeId, true);
      this.$refs.tree.updateVnodeState(item.treeId);
    },
    onClickSaveCategory(event, item) {
      const props = {
        editable: false,
      };
      if (item.type === 'custom-group') {
        if (item.group) {
          props.id = item.group.id;
          props.name = item.group.name;
        }
      } else if (item.type === 'dash') {
        props.id = +item.dash;
        props.children = undefined;
      }
      props.group = undefined;

      this.setCategoryItem({
        treeId: item.treeId,
        props,
      });
      this.saveOnServer();
    },
    onChangeItemType(type, item) {
      const props = {
        type,
      };
      switch (type) {
        case 'dash':
          props.children = undefined;
          break;
        default:
          props.children = [];
          break;
      }
      this.setCategoryItem({
        treeId: item.treeId,
        props,
      });
      // @todo: проверить - не грузятся дети после смены с даша на группу
    },
    async activeCurrentDash() {
      const dashId = this.$route.params?.id;
      if (dashId) {
        const categoryItem = await this.getTreeCategoryItem({
          id: +dashId,
          idParam: 'id',
        });
        const treeItem = categoryItem || await this.getTreeGroupItem({
          id: +dashId,
          idParam: 'id',
        });
        if (treeItem) {
          this.$refs.tree.updateActive(treeItem.treeId, true);
        }
      }
    },
    saveOnServer() {
      const treeCategories = this.$refs.tree.items[0].children;
      function recurseClear(list) {
        return list.map((item) => {
          if (item.type === 'custom-group' && item.children?.length) {
            item.children = [];
          } else if (item.children?.length) {
            item.children = recurseClear(item.children);
          }
          item.editable = false;
          return item;
        });
      }
      this.saveTreeCategories(recurseClear(structuredClone(treeCategories)))
        .catch((err) => {
          this.$store.commit('notify/addNotification', {
            id: 'saveTreeCategories_error',
            message: `Категории не удалось сохранить, ошибка: ${err.statusText}`,
          });
        });
    },
  },
};
</script>

<style lang="sass" scoped>
.top-panel
  padding-top: 8px
.tree-nav::v-deep
  .v-treeview-node--disabled
    .v-treeview-node__label, .v-treeview-node__prepend > span
      color: var(--primary_button)
</style>
