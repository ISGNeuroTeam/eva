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
                  v-for="i in allGroups.length"
                  :key="i"
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
                      :style="{ borderColor: allGroups[i - 1].color }"
                    />
                    <div class="controls-group">
                      <v-tooltip
                        bottom
                        :color="theme.$accent_ui_color"
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon
                            v-if="editGroupPermission"
                            class="edit control-group"
                            :color="theme.$primary_button"
                            v-on="on"
                            @click="
                              () => {
                                modalCreateGroup = true;
                                createGroupFlag = true;
                                actionBtn = false;
                                curGroup = i - 1;
                              }
                            "
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
                            v-if="editGroupPermission"
                            class="delete control-group"
                            :color="theme.$primary_button"
                            v-on="on"
                            @click="
                              () => {
                                (nameDelete = allGroups[i - 1].name),
                                (modalDelete = true),
                                (elemDelete = 'group'),
                                (curGroup = i - 1);
                              }
                            "
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
                        id: allGroups[i - 1].id,
                        color: allGroups[i - 1].color,
                        name: allGroups[i - 1].name,
                      })
                    "
                  >
                    <p class="group-text">
                      {{ checkName(allGroups[i - 1].name) }}
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
                  @click="
                    () => {
                      modalCreateGroup = true;
                      createGroupFlag = true;
                      actionBtn = true;
                      curGroup = -1;
                    }
                  "
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
                  v-for="i in allDashs.length"
                  :key="i"
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
                    <div class="controls-group">
                      <v-tooltip
                        bottom
                        :color="theme.$accent_ui_color"
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon
                            v-if="editDashPermission"
                            class="edit control-group"
                            :color="theme.$primary_button"
                            v-on="on"
                            @click="
                              () => {
                                modalCreateGroup = true;
                                createGroupFlag = false;
                                actionBtn = false;
                                curGroup = i - 1;
                              }
                            "
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
                            v-if="editDashPermission"
                            class="delete control-group"
                            :color="theme.$primary_button"
                            v-on="on"
                            @click="
                              () => {
                                (nameDelete = allDashs[i - 1].name),
                                (modalDelete = true),
                                (elemDelete = 'dash'),
                                (curDash = i - 1);
                              }
                            "
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
                    @click="goToDash(i - 1)"
                  >
                    <p class="group-text">
                      {{ checkName(allDashs[i - 1].name) }}
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
                  @click="
                    () => {
                      modalCreateGroup = true;
                      createGroupFlag = false;
                      actionBtn = 'create';
                      curGroup = curGroup;
                    }
                  "
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
      :active="modalExim"
      :cur-name="curName"
      :dashboards="allDashs"
      :groups="allGroups"
      :element="element"
      @closeModal="closeModal"
    />
    <modal-create
      :modal-from="modalCreateGroup"
      :action-from="actionBtn"
      :group-from="allGroups"
      :name-group-from="cookieName"
      :dashs-from="allDashs"
      :data-from="allGroups[curGroup]"
      :dash-from="allDashs[curGroup]"
      :cur-group-from="curGroup"
      :group-flag-from="createGroupFlag"
      @createGroup="createGroup($event)"
      @closeModal="closeModal"
    />
    <modal-delete-main
      :modal-from="modalDelete"
      :name-from="nameDelete"
      @deleteElem="deleteElem"
      @closeModal="modalDelete = false"
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
      editGroupPermission: false,
      editDashPermission: false,
      modalExim: false,
      modalCreateGroup: false,
      element: 'dash',
      createGroupFlag: false,
      nameDelete: '',
      modalDelete: false,
      elemDelete: '',
      actionBtn: '',
      cookieId: -1,
      cookieName: '',
    };
  },
  computed: {
    // adminRool: function() {
    //   return this.adminRoot
    // },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  mounted() {
    this.checkCookie();
    document.title = 'EVA | Конструирование дашбордов';
  },
  methods: {
    getGroups() {
      const response = this.$store.getters.getGroups();
      response.then((res) => {
        this.allGroups = res;
      });
    },
    getDashs(id) {
      const response = this.$store.getters.getDashs(id);
      response.then((res) => {
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
      this.modalCreateGroup = false;
      this.modalExim = false;
      if (this.tab == 'tab-1') {
        this.getGroups();
      } else {
        this.getDashs(this.cookieId);
      }
    },
    goToDash(i) {
      // this.$store.commit('setDash',{data: this.allDashs[i], getters: this.$store.getters.checkAlreadyDash});
      this.$router.push(`/dashboards/${this.allDashs[i].id}`);
    },
    deleteElem() {
      this.modalDelete = false;
      let response = null;
      let data = null;
      let id = -1;
      if (this.elemDelete == 'group') {
        data = this.allGroups;
        id = this.curGroup;
      } else {
        data = this.allDashs;
        id = this.curDash;
      }
      response = this.$store.auth.getters.deleteEssence({
        essence: this.elemDelete,
        id: data[id].id,
      });
      response.then((res) => {
        if (res.status == 200) {
          if (this.elemDelete == 'group') {
            this.getGroups();
          } else {
            this.getDashs(this.cookieId);
          }
        }
      });
      this.$store.commit('deleteDashFromMain', data[id]);
    },
    checkCookie() {
      const cookie = document.cookie.split(';').filter((item) => {
        if (item.indexOf('eva-dashPage') != -1) {
          return item;
        }
      });
      if (cookie.length != 0) {
        this.cookieId = JSON.parse(cookie[0].split('=')[1]).id;
        this.cookieName = JSON.parse(cookie[0].split('=')[1]).name;
        this.getDash(JSON.parse(cookie[0].split('=')[1]));
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
