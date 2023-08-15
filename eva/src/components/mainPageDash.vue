<template>
  <v-app :style="{ background: theme.$secondary_bg }">
    <header-top @permissions="setPermissions" />
    <v-main>
      <v-navigation-drawer
        v-model="openTree"
        fixed
        temporary
        :style="{ color: theme.$main_text, background: theme.$main_bg }"
        class="nav-panel-drawer"
      >
        <navigation-tree-view
          class="navigation-tree"
        />
      </v-navigation-drawer>
      <notifications style="z-index: 99" />
      <v-container class="main-container container-dash">
        <v-card
          class="main-card-dash"
          :style="{ background: 'none', boxShadow: 'none' }"
        >
          <v-card-text>
            <v-tabs
              v-model="tab"
              class="tab-dash"
              :color="theme.$main_text"
              :style="{ background: 'none' }"
            >
              <v-tabs-slider />
              <v-tab
                v-for="item in tabsHeader"
                :key="item.href"
                :href="item.href"
                :disabled="item.disabled"
                @click="item.cb"
              >
                {{ item.text }}
              </v-tab>
              <v-tab-item
                value="tab-1"
                class="groups-of-dash groups-of-dash__container"
              >
                <template v-if="loading && allGroups.length === 0">
                  <v-skeleton-loader
                    v-for="n in 4"
                    :key="n"
                    class="dash-group"
                    type="card"
                  />
                </template>
                <draggable
                  ref="tabPanel"
                  v-model="allGroups"
                  group="tabs"
                  class="groups-of-dash-draggable"
                  @change="groupDragEnd"
                >
                  <v-card
                    v-for="(group, i) in allGroups"
                    :key="group.id"
                    class="dash-group"
                    :ripple="false"
                    :style="{
                      background: theme.$main_bg,
                      color: theme.$main_text,
                      borderColors: theme.$main_border
                    }"
                  >
                    <v-card-title class="dash-group-title">
                      <div
                        class="title-color"
                        :style="{ borderColor: group.color }"
                      />
                      <div
                        v-if="editGroupPermission"
                        class="controls-group"
                      >
                        <v-tooltip
                          bottom
                          :color="theme.$accent_ui_color"
                        >
                          <template v-slot:activator="{ on }">
                            <v-icon
                              class="edit control-group"
                              :color="theme.$primary_button"
                              v-on="on"
                              @click="editGroup(group.id)"
                            >
                              {{ pencil }}
                            </v-icon>
                          </template>
                          <span>Редактировать</span>
                        </v-tooltip>
                        <v-tooltip
                          bottom
                          :color="theme.$accent_ui_color"
                        >
                          <template v-slot:activator="{ on }">
                            <v-icon
                              class="delete control-group"
                              :color="theme.$primary_button"
                              v-on="on"
                              @click="deleteGroup(group.id, i)"
                            >
                              {{ trash }}
                            </v-icon>
                          </template>
                          <span>Удалить</span>
                        </v-tooltip>
                      </div>
                    </v-card-title>
                    <v-card-text
                      class="dash-group-text"
                      @click="getDash({
                        id: group.id,
                        color: group.color,
                        name: group.name,
                      })"
                    >
                      <p
                        class="group-text"
                        :title="group.name"
                      >
                        {{ checkName(group.name, 64) }}
                      </p>
                    </v-card-text>
                  </v-card>
                </draggable>
                <v-btn
                  v-if="editGroupPermission"
                  :color="theme.$primary_button"
                  fab
                  dark
                  small
                  absolute
                  class="plus-icon"
                  right
                  @click="createNewGroup"
                >
                  <v-icon>
                    {{ plus }}
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="editGroupPermission"
                  :color="theme.$primary_button"
                  fab
                  dark
                  small
                  absolute
                  class="exim-icon"
                  right
                  @click="
                    () => {
                      modalExim = true;
                      element = 'group';
                    }
                  "
                >
                  <v-icon>
                    {{ exim }}
                  </v-icon>
                </v-btn>
              </v-tab-item>
              <v-tab-item
                value="tab-2"
                class="groups-of-dash__container"
              >
                <draggable
                  ref="tabPanel"
                  v-model="tabsOrder"
                  group="tabs"
                  class="groups-of-dash-draggable"
                  @change="dragend"
                >
                  <template v-if="loading">
                    <v-skeleton-loader
                      v-for="n in 4"
                      :key="n"
                      class="dash-group"
                      type="card"
                    />
                  </template>
                  <v-card
                    v-for="(dash, i) in allDashs"
                    :key="dash.id"
                    class="dash-group"
                    :ripple="false"
                    :style="{
                      background: theme.$main_bg,
                      color: theme.$main_text,
                      borderColors: theme.$main_border,
                    }"
                    @click.middle="onClickMiddle(dash)"
                  >
                    <v-card-title class="dash-group-title">
                      <div
                        class="title-color"
                        :style="{ borderColor: curColor }"
                      />
                      <div
                        v-if="editDashPermission"
                        class="controls-group"
                      >
                        <v-tooltip
                          bottom
                          :color="theme.$accent_ui_color"
                        >
                          <template v-slot:activator="{ on }">
                            <v-icon
                              class="edit control-group"
                              :color="theme.$primary_button"
                              v-on="on"
                              @click="editDashboard(curGroup, i)"
                            >
                              {{ pencil }}
                            </v-icon>
                          </template>
                          <span>Редактировать</span>
                        </v-tooltip>
                        <v-tooltip
                          bottom
                          :color="theme.$accent_ui_color"
                        >
                          <template v-slot:activator="{ on }">
                            <v-icon
                              class="delete control-group"
                              :color="theme.$primary_button"
                              v-on="on"
                              @click="deleteDashboard(dash.id)"
                            >
                              {{ trash }}
                            </v-icon>
                          </template>
                          <span>Удалить</span>
                        </v-tooltip>
                      </div>
                    </v-card-title>
                    <v-card-text
                      class="dash-group-text"
                      @click="goToDash(i)"
                    >
                      <p
                        class="group-text"
                        :title="dash.name"
                      >
                        {{ checkName(dash.name, 64) }}
                      </p>
                    </v-card-text>
                  </v-card>
                </draggable>
                <v-btn
                  v-if="editDashPermission"
                  :color="theme.$primary_button"
                  fab
                  dark
                  small
                  class="plus-icon"
                  absolute
                  right
                  @click="createDashboard"
                >
                  <v-icon>
                    {{ plus }}
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="editDashPermission"
                  :color="theme.$primary_button"
                  fab
                  dark
                  small
                  class="exim-icon"
                  absolute
                  right
                  @click="
                    () => {
                      modalExim = true;
                      element = 'dash';
                    }
                  "
                >
                  <v-icon>
                    {{ exim }}
                  </v-icon>
                </v-btn>
              </v-tab-item>
              <v-tab-item
                value="tab-3"
                class="groups-of-dash__container"
              >
                <navigation-tree-view editable />
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
    <footer-bottom />
    <modal-exim
      v-if="modalExim"
      v-model="modalExim"
      :cur-name="curName || ''"
      :dashboards="allDashs"
      :groups="allGroups"
      :element="element"
      @update:dashboards="getDashs(cookieId)"
      @update:groups="getGroups"
    />
    <modal-create
      v-if="modalCreate"
      v-model="modalCreate"
      :action-from="actionBtn"
      :group-from="allGroups"
      :name-group-from="cookieName"
      :dashs-from="allDashs"
      :is-edit="isEdit"
      :data-from="groupFrom"
      :dash-from="dashFrom"
      :cur-group-from="curGroup"
      :group-flag-from="createGroupFlag"
    />
    <modal-delete-main
      v-model="modalDelete"
      :name-from="nameDelete"
      @deleteElem="deleteElem"
    />
  </v-app>
</template>

<script>
import {
  mdiTrashCanOutline,
  mdiPlus,
  mdiPencil,
  mdiSwapVerticalBold,
  mdiShield,
} from '@mdi/js';
import draggable from 'vuedraggable';
import { mapActions } from 'vuex';
import Notifications from './notifications';

export default {
  name: 'MainPageDash',
  components: {
    Notifications,
    draggable,
  },
  data() {
    const { startNavTab } = this.$store.getters['app/userSettings'];
    return {
      tab: startNavTab === 'tree' ? 'tab-3' : 'tab-1',
      disabledTab: true,
      trash: mdiTrashCanOutline,
      plus: mdiPlus,
      pencil: mdiPencil,
      exim: mdiSwapVerticalBold,
      curColor: 'transparent',
      curGroup: null,
      curName: null,
      curDash: null,
      allGroups: [],
      allDashs: [],
      dashFrom: null,
      groupFrom: -1,
      editGroupPermission: false,
      editDashPermission: false,
      modalExim: false,
      modalCreate: false,
      element: 'dash',
      createGroupFlag: false,
      nameDelete: '',
      modalDelete: false,
      isEdit: false,
      elemDelete: '',
      actionBtn: '',
      cookieId: -1,
      cookieName: '',
      draggedDash: '',
      loadingState: false,
      loadingInt: null,
      groupOrder: [],
    };
  },
  computed: {
    tabsHeader() {
      const tabTree = { text: 'Дерево', href: '#tab-3', cb: this.openTabTree };
      const tabsGroupAndDashes = [
        { text: 'Группы', href: '#tab-1', cb: this.openTabGroups },
        {
          text: 'Дашборды',
          href: '#tab-2',
          cb: this.openTabGroup,
          disabled: this.disabledTab,
        },
      ];

      const { startNavTab } = this.$store.getters['app/userSettings'];
      if (startNavTab === 'tree') {
        return [tabTree, ...tabsGroupAndDashes];
      }

      return [...tabsGroupAndDashes, tabTree];
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
    tabsOrder: {
      get() {
        return this.allDashs;
      },
      set() {
        // this.allDashs = structuredClone(value);
      },
    },
    loading: {
      get() {
        return this.loadingState;
      },
      set(val) {
        if (val && !this.loadingState && !this.loadingInt) {
          this.loadingInt = setTimeout(() => {
            this.loadingState = true;
          }, 200);
        }
        if (!val) {
          clearTimeout(this.loadingInt);
          this.loadingInt = null;
          this.loadingState = false;
        }
      },
    },
  },
  watch: {
    modalCreate(val) {
      if (!val) {
        this.modalExim = false;
        this.curGroup = -1;
        if (this.tab === 'tab-1' || this.tab === 'tab-3') {
          this.getGroups();
        } else {
          this.getDashs(this.cookieId);
        }
      }
    },
  },
  mounted() {
    const { groupId } = this.$route.params;
    if (groupId || this.$route.query?.home) {
      this.tab = 'tab-2';
    } else if (this.$route.path.includes('/tree')) {
      this.tab = 'tab-3';
    }

    this.getGroups().then(() => {
      if (groupId) {
        const group = this.allGroups.find((item) => `${item.id}` === groupId);
        if (group) {
          this.getDash(group);
        } else {
          this.$store.commit('notify/addNotification', {
            id: 'access-error',
            icon: mdiShield,
            message: `Группа с ID ${groupId} не существует либо к ней нет доступа`,
            read: false,
            type: 'error',
            time: 2,
          });
          this.$router.push('/dashboards');
        }
      } else if (this.$route.query?.home) {
        const homeGroupId = this.allGroups.find((group) => group.name === this.$route.query?.home);
        if (homeGroupId) {
          this.getDash(homeGroupId);
        } else {
          this.tab = 'tab-1';
        }
      }
    });

    this.$root.$emit('setDocumentTitle', 'Конструирование дашбордов');
    this.loadSettings();
  },
  methods: {
    ...mapActions('app', [
      'loadSettings',
      'saveGroupOrder',
    ]),
    getOrder(dash) {
      return dash?.groups.find((groupEl) => groupEl.name === this.curName)?.order;
    },
    dragend(e) {
      const oldIndex = e.moved.oldIndex - 1;
      const newIndex = e.moved.newIndex - 1;
      if (newIndex === oldIndex) return;
      const element = this.allDashs[oldIndex];
      this.draggedDash = element.name;
      this.createEssence({
        id: element.id,
        groups: [
          {
            name: this.curName,
            order: newIndex,
          },
        ],
      }, 'PUT', 'dash');

      this.allDashs = this.allDashs.map((dash) => {
        const result = {
          ...dash,
        };
        if (dash.id === element.id) {
          result.order = newIndex;
        } else if (newIndex > oldIndex && dash.order <= newIndex && dash.order > oldIndex) {
          result.order -= 1;
        } else if (newIndex < oldIndex && dash.order >= newIndex && dash.order < oldIndex) {
          result.order += 1;
        }
        return result;
      }).sort((a, b) => a.order - b.order);
      // this.getDashs(this.curGroup);
    },
    createEssence(group, method, essence) {
      const response = this.$store.dispatch('auth/setEssence', {
        formData: JSON.stringify(group),
        essence,
        method,
      });
      response.then((res) => {
        if (res.status === 200) {
          if (essence === 'dash') {
            res.json().then((data) => {
              this.createDash({
                id: data.id,
                name: group.name,
                idgroup: group.idGroup,
                modified: data.modified,
              });
            });
          }
          // передаем в родителя чтобы выключили модалку
          this.active = false;
        } else if (res.status === 409) {
          //  показываем предупреждение
          this.showwarning = true;
          this.nameWarn = essence === 'group' ? 'Такая группа уже есть.' : 'Такой дашборд уже есть.';
          setTimeout(() => {
            this.showwarning = false;
          }, 2000);
        }
      });
    },
    createDash(dash) {
      this.$store.commit('setDash', {
        data: dash,
        getters: (payload) => this.$store.dispatch('checkAlreadyDash', payload),
      });
      this.$store.dispatch(
        'auth/putLog',
        `Создан дашборд ${this.toHichName(this.draggedDash)} с id ${dash.id}`,
      );
      this.draggedDash = '';
    },
    toHichName(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    updateModalCreateFrom(dashIndex) {
      this.groupFrom = this.allGroups.find((group) => group.id === this.curGroup) || this.curGroup;
      this.dashFrom = this.actionBtn === 'create' ? null : this.allDashs[dashIndex];
    },
    deleteGroup(groupId, index) {
      this.nameDelete = this.allGroups[index].name;
      this.modalDelete = true;
      this.elemDelete = 'group';
      this.curGroup = groupId;
    },
    editGroup(groupId) {
      this.isEdit = true;
      this.modalCreate = true;
      this.createGroupFlag = true;
      this.actionBtn = false;
      this.curGroup = groupId;
      this.updateModalCreateFrom();
    },
    createNewGroup() {
      this.modalCreate = true;
      this.createGroupFlag = true;
      this.actionBtn = true;
      this.curGroup = -1;
      this.updateModalCreateFrom();
    },
    deleteDashboard(dashId) {
      this.nameDelete = this.allDashs.find((dash) => dash.id === dashId).name;
      this.modalDelete = true;
      this.elemDelete = 'dash';
      this.curDash = dashId;
    },
    createDashboard() {
      this.isEdit = false;
      this.modalCreate = true;
      this.createGroupFlag = false;
      this.actionBtn = 'create';
      this.updateModalCreateFrom();
      // this.curGroup = curGroup;
    },
    editDashboard(groupId, dashIndex) {
      this.isEdit = true;
      this.modalCreate = true;
      this.createGroupFlag = false;
      this.actionBtn = false;
      this.curGroup = groupId;
      this.updateModalCreateFrom(dashIndex);
    },
    onClickMiddle(dash) {
      const routeData = this.$router.resolve(`/dashboards/${dash.id}`);
      window.open(routeData.href, '_blank');
    },
    getGroups() {
      this.loading = true;
      return this.$store.dispatch('getGroups').then((res) => {
        this.loading = false;
        const groupIds = this.$store.getters['app/groupOrder'];
        this.allGroups = res.map((item) => ({
          ...item,
          order: item.order || groupIds.indexOf(item.id),
        })).sort((a, b) => a.order - b.order);
        return res;
      });
    },
    getDashs(id) {
      this.loading = true;
      this.allDashs = [];
      return this.$store.dispatch('getDashs', id).then((res) => {
        this.allDashs = res.sort((a, b) => a.order - b.order);
        this.loading = false;
      });
    },
    getDash(group) {
      this.curName = group.name;
      this.curGroup = group.id;
      this.cookieId = group.id;
      this.cookieName = group.name;
      this.curColor = group.color;
      this.disabledTab = false;
      this.tab = 'tab-2';
      this.getDashs(this.curGroup);
      this.openTabGroup();
    },
    setPermissions(event) {
      this.editDashPermission = false;
      this.editGroupPermission = false;
      if (event.includes('admin_all') || event.includes('managedash')) {
        this.editDashPermission = true;
      }
      if (event.includes('admin_all') || event.includes('managegroup')) {
        this.editGroupPermission = true;
      }
    },
    closeModal() {
      this.modalCreate = false;
      this.modalExim = false;
      if (this.tab === 'tab-1' || this.tab === 'tab-3') {
        this.getGroups();
      } else {
        this.getDashs(this.cookieId);
      }
    },
    goToDash(i) {
      this.$router.push(`/dashboards/${this.allDashs[i].id}`);
    },
    deleteElem() {
      this.modalDelete = false;
      let response = null;
      let data = null;
      let id = -1;
      if (this.elemDelete === 'group') {
        data = this.allGroups;
        id = this.curGroup;
      } else {
        data = this.allDashs;
        id = this.curDash;
      }
      response = this.$store.dispatch('auth/deleteEssence', {
        essence: this.elemDelete,
        id,
      });
      response.then((res) => {
        if (res.status === 200) {
          if (this.elemDelete === 'group') {
            this.getGroups();
          } else {
            this.getDashs(this.cookieId);
          }
        }
      });
      if (data?.length > 0) {
        this.$store.commit('deleteDashFromMain', [...data].find((dash) => dash.id === id));
      }
    },
    openTabTree() {
      window.history.replaceState({}, '', '/eva/dashboards/tree');
    },
    openTabGroup() {
      window.history.replaceState({}, '', `/eva/dashboards/group/${this.curGroup}`);
    },
    openTabGroups() {
      window.history.replaceState({}, '', '/eva/dashboards');
      this.deleteCookie();
    },
    deleteCookie() {
      document.cookie = 'eva-dashPage=\'\'; max-age=0; path=/';
      if (this.$route.query?.home) {
        this.$route.query.home = '';
      }
    },
    checkName(name, len = 12) {
      let newName = name;
      if (name.length > len) {
        newName = `${name.slice(0, len)}...`;
      }
      return newName;
    },
    groupDragEnd() {
      const groupIds = this.allGroups.map(({ id }) => id);
      this.saveGroupOrder(groupIds)
        .catch((err) => {
          this.$store.commit('notify/addNotification', {
            id: 'saveGroupOrder_error',
            message: `Не удалось сохранить порядок групп: ${err.statusText}`,
          });
        });
    },
  },
};
</script>

<style lang="scss">
// подключаем стили для этого компонента

@import '../sass/mainPageDash.sass';
.groups-of-dash-draggable {
  min-height: 560px;
  align-items: start !important;
}
</style>
