<template>
  <v-app
    class="aut-app-profile"
    :style="{ background: theme.$secondary_bg }"
  >
    <header-top
      inside
      @permissions="setPermissions"
    />
    <v-navigation-drawer
      v-model="openTree"
      absolute
      bottom
      temporary
      :style="{ color: theme.$main_text, background: theme.$main_bg }"
      class="nav-panel-drawer"
    >
      <navigation-tree-view
        class="navigation-tree"
      />
    </v-navigation-drawer>
    <v-content>
      <v-container class="main-container">
        <v-card class="card-aut-table">
          <v-card-text :style="{ background: theme.$main_bg }">
            <v-tabs
              v-model="tab"
              :color="theme.$main_text"
              @change="getData"
            >
              <v-tabs-slider />
              <v-tab
                v-for="i in tabs.length"
                :key="i"
                :href="`#tab-${i}`"
              >
                {{ tabs[i - 1] }}
              </v-tab>
              <v-tab-item
                v-for="i in tabs.length"
                :key="i"
                class="item"
                :value="`tab-${i}`"
              >
                <div
                  v-if="dataLoading"
                  class="loading-tab"
                >
                  <v-skeleton-loader
                    type="table-tbody"
                    tile
                    :style="{ background: theme.$main_bg }"
                  />
                </div>
                <div
                  v-if="!dataLoading"
                  class="table-tab"
                  :style="{ background: theme.$main_bg }"
                >
                  <div class="d-flex justify-end">
                    <v-btn
                      v-if="adminRool"
                      :color="theme.$primary_button"
                      fab
                      dark
                      small
                      @click="editUser('create', '', i)"
                    >
                      <v-icon>
                        {{ plus }}
                      </v-icon>
                    </v-btn>
                  </div>
                  <v-data-table
                    :style="{
                      background: theme.$main_bg,
                      color: theme.$main_text,
                      borderColor: theme.$secondary_border,
                    }"
                    :headers="titles"
                    :items.sync="originData"
                    :items-per-page="perPage[i] || 15"
                    class="aut-table"
                    :data-id="`${i}`"
                    :sort-by="sortBy[i] || ['roles']"
                    :sort-desc="isDesc[i]"
                    @update:sort-by="sortBy[i] = $event"
                    @update:sort-desc="isDesc[i] = $event"
                    @update:items-per-page="perPage[i] = $event"
                  >
                    <template v-slot:item.color="{ item }">
                      <div
                        class="square-profile"
                        :style="{ backgroundColor: item.color }"
                      />
                    </template>

                    <template v-slot:item.actions="{ item }">
                      <v-tooltip
                        bottom
                        :color="theme.$accent_ui_color"
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon
                            v-if="i === 1 || showPencilRoot"
                            v-model="item.actions"
                            class="editUser icon-aut"
                            :color="theme.$primary_button"
                            v-on="on"
                            @click="editUser('edit', item, i)"
                          >
                            {{ pencil }}
                          </v-icon>
                        </template>
                        <span>Редактировать</span>
                      </v-tooltip>
                      <v-tooltip
                        v-if="adminRool"
                        bottom
                        :color="theme.$accent_ui_color"
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon
                            v-model="item.actions"
                            class="editUser icon-aut"
                            :color="theme.$primary_button"
                            v-on="on"
                            @click="openDelete(item, i)"
                          >
                            {{ trash }}
                          </v-icon>
                        </template>
                        <span>Удалить</span>
                      </v-tooltip>
                    </template>
                  </v-data-table>
                </div>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-card>
      </v-container>
    </v-content>
    <footer-bottom />
    <modal-profile
      v-if="activeModal"
      v-model="activeModal"
      :create="createSome"
      :key-from="keyFrom"
      :cur-item-from="curItem"
      :passway="permission"
      :user-from="user"
      :cur-user-id="userId"
      @cancelModal="closeModal"
    />
    <modal-delete-profile
      :active-delete="activeDelete"
      :data-from="dataDelete"
      @cancelModal="closeModal"
      @deleted="removeFromList"
    />
  </v-app>
</template>

<script>
import { mdiPencil, mdiPlus, mdiTrashCanOutline } from '@mdi/js';

export default {
  data() {
    return {
      user: {},
      pencil: mdiPencil,
      plus: mdiPlus,
      trash: mdiTrashCanOutline,
      tab: 'tab-1',
      adminRoot: false,
      showPencilRoot: false,
      tabs: ['Пользователи', 'Роли', 'Привилегии', 'Группы', 'Индексы'],
      essence: ['user', 'role', 'permission', 'group', 'index'],
      titles: [],
      originData: [],
      dataLoading: true,
      activeModal: false,
      activeDelete: false,
      createSome: false,
      colorRow: false,
      keyFrom: '',
      dataDelete: {},
      curItem: {},
      permission: true,
      sortBy: {},
      isDesc: {},
      perPage: {},
    };
  },
  computed: {
    userId() {
      if (!this.$jwt.hasToken()) return null;
      return this.$jwt.decode().user_id;
    },
    adminRool() {
      return this.adminRoot;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    openTree: {
      get() {
        return this.$store.getters['app/isOpenTree'];
      },
      set(val) {
        return this.$store.commit('app/setOpenTree', val);
      },
    },
  },
  mounted() {
    this.getData('tab-1');
  },
  methods: {
    setPermissions(event) {
      if (event.includes('admin_all')) {
        this.adminRoot = true;
        this.permission = false;
        this.showPencilRoot = true;
      }
    },
    editUser(act, item, key) {
      this.user = act === 'create' ? {} : item;
      this.createSome = act === 'create';
      if (item) {
        this.curItem = item;
      }
      this.keyFrom = key;

      if (act !== 'create') {
        switch (key) {
          case 1:
            this.curItem.tab = 'user';
            break;
          case 2:
            this.curItem.tab = 'role';
            break;
          case 3:
            this.curItem.tab = 'permission';
            break;
          case 4:
            this.curItem.tab = 'group';
            break;
          case 5:
            this.curItem.tab = 'index';
            break;
          default:
            break;
        }
      }
      this.activeModal = true;
    },
    async getData(event) {
      this.dataLoading = true;
      this.titles = this.setTitles(Number(event.split('-')[1]));
      this.originData = await this.setData(Number(event.split('-')[1]));
      if (this.originData.length) {
        this.originData.forEach((item, i) => {
          Object.keys(item).forEach((itemopt) => {
            if (Array.isArray(item[itemopt])) {
              this.originData[i][itemopt] = this.checkName(
                item[itemopt].join(', '),
              );
            }
          });
        });
        this.setColorHover(event.split('-')[1]);
      } else {
        this.originData = [];
      }

      this.dataLoading = false;
    },
    setTitles(role) {
      switch (role) {
        case 1:
          return [
            { text: 'Логин', value: 'name' },
            { text: 'Роли', value: 'roles' },
            { text: 'Группы', value: 'groups' },
            { text: '', value: 'actions' },
          ];
        case 2:
          return [
            { text: 'Название', value: 'name' },
            { text: 'Пользователи', value: 'users' },
            { text: 'Привилегии', value: 'permissions' },
            { text: '', value: 'actions' },
          ];
        case 3:
          return [
            { text: 'Название', value: 'name' },
            { text: 'Роли', value: 'roles' },
            { text: '', value: 'actions' },
          ];
        case 4:
          return [
            { text: 'Название', value: 'name' },
            { text: 'Цвет', value: 'color' },
            { text: 'Индексы', value: 'indexes' },
            { text: '', value: 'actions' },
          ];
        case 5:
          return [
            { text: 'Название', value: 'name' },
            { text: 'Группы', value: 'groups' },
            { text: '', value: 'actions' },
          ];
        default:
          return [];
      }
    },
    async setData(role) {
      const result = await this.$store.dispatch('auth/getEssenceList', {
        role,
        create: false,
      });
      return result;
    },
    setColorHover(i) {
      let table = {};
      let timeOut = setTimeout(
        async function tick() {
          if (document.querySelector(`[data-id="${i}"]`)) {
            clearTimeout(timeOut);
            table = document.querySelector(`[data-id="${i}"]`);
            table.addEventListener('mouseover', (event) => {
              const elem = event.target.tagName.toLowerCase();
              const icon = event.target.parentElement.closest('td');
              if (elem === 'td' || icon) {
                event.target.parentElement.closest(
                  'tr',
                ).style = `background: ${this.theme.$accent_ui_color} !important;color:white`;
              }
            });
            table.addEventListener('mouseout', (event) => {
              if (event.target.tagName.toLowerCase() === 'td') {
                event.target.parentElement.style = 'background: transparent !important;';
              }
            });
          } else {
            timeOut = setTimeout(tick.bind(this), 100);
          }
        }.bind(this),
        0,
      );
    },
    checkName(name) {
      return name.length > 25 ? `${name.slice(0, 25)}...` : name;
    },
    openDelete(item, i) {
      let text = '';
      this.keyFrom = i;
      switch (i) {
        case 1:
          text = '<p>Удалить пользователя</p> ';
          break;
        case 2:
          text = '<p>Удалить роль</p> ';
          break;
        case 3:
          text = '<p>Удалить привилегию</p> ';
          break;
        case 4:
          text = '<p>Удалить группу</p> ';
          break;
        case 5:
          text = '<p>Удалить индекс</p> ';
          break;
        default:
          break;
      }
      this.dataDelete.text = `${text} <span>${item.name}</span>`;
      this.dataDelete.id = item.id;
      this.dataDelete.essence = i;
      this.activeDelete = true;
    },
    closeModal(isClearChanges = true) {
      this.activeDelete = false;
      this.activeModal = false;
      if (!isClearChanges) {
        this.getData(`tab-${this.keyFrom}`);
      }
    },
    removeFromList(id) {
      if (id === this.userId) {
        this.$store.dispatch('auth/logout');
        this.$store.dispatch('app/resetState');
      } else {
        this.originData = this.originData.filter((item) => item.id !== id);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/profile.sass';
</style>
