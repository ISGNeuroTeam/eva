<template>
  <v-app :style="{ background: theme.$secondary_bg }">
    <header-top @permissions="setPermissions" />
    <v-main>
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
                :href="`#tab-1`"
                @click="deleteCookie"
              >
                Группы
              </v-tab>
              <v-tab
                :href="`#tab-2`"
                :disabled="disabledTab"
              >
                Дашборды
              </v-tab>
              <v-tab-item
                :value="'tab-1'"
                class="groups-of-dash"
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
                    @click="
                      getDash({
                        id: group.id,
                        color: group.color,
                        name: group.name,
                      })
                    "
                  >
                    <p class="group-text">
                      {{ checkName(group.name) }}
                    </p>
                  </v-card-text>
                </v-card>
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
                :value="'tab-2'"
                class="groups-of-dash"
              >
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
                    <p class="group-text">
                      {{ checkName(dash.name) }}
                    </p>
                  </v-card-text>
                </v-card>
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
} from '@mdi/js';

export default {
  name: 'MainPageDash',
  data() {
    return {
      tab: 'tab-1',
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
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    modalCreate(val) {
      if (!val) {
        this.modalExim = false;
        this.curGroup = -1;
        if (this.tab === 'tab-1') {
          this.getGroups();
        } else {
          this.getDashs(this.cookieId);
        }
      }
    },
  },
  mounted() {
    this.checkCookie();
    document.title = 'EVA | Конструирование дашбордов';
  },
  methods: {
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
    getGroups() {
      this.$store.dispatch('getGroups').then((res) => {
        this.allGroups = res;
      });
    },
    getDashs(id) {
      this.$store.dispatch('getDashs', id).then((res) => {
        this.allDashs = res;
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
      document.cookie = `eva-dashPage=${JSON.stringify(
        group,
      )}; max-age=3600; path=/`;
      this.getDashs(this.curGroup);
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
      if (this.tab === 'tab-1') {
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
    checkCookie() {
      const cookie = document.cookie.split(';').find((item) => item.indexOf('eva-dashPage') !== -1);
      if (cookie) {
        this.cookieId = JSON.parse(cookie.split('=')[1]).id;
        this.cookieName = JSON.parse(cookie.split('=')[1]).name;
        this.getDash(JSON.parse(cookie.split('=')[1]));
      } else {
        this.getGroups();
      }
    },
    deleteCookie() {
      document.cookie = 'eva-dashPage=\'\'; max-age=0; path=/';
      this.getGroups();
    },
    checkName(name) {
      let newName = name;
      if (name.length > 12) {
        newName = `${name.slice(0, 12)}...`;
      }
      return newName;
    },
  },
};
</script>

<style lang="scss">
// подключаем стили для этого компонента

@import '../sass/mainPageDash.sass';
</style>
