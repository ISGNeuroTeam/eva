<template>
  <div
    class="field-profile more-data"
    :data-active="active"
    :style="{ borderColor: theme.$main_border }"
  >
    <div class="headline" :style="{ color: theme.$title }">
      {{ alldata[essence][`${subessence}Name`] }}
    </div>
    <v-tabs
      v-model="alldata[essence].tab[subessence]"
      :color="theme.$main_text"
      :style="{ background: theme.$main_bg }"
      @change="switchTab"
    >
      <v-tabs-slider />
      <v-tab :href="`#tab-1`">
        {{ alldata[essence][`${subessence}TabName`].tab1 }}
      </v-tab>
      <v-tab :href="`#tab-2`">
        {{ alldata[essence][`${subessence}TabName`].tab2 }}
      </v-tab>
      <v-tab-item class="item" :value="'tab-1'">
        <v-skeleton-loader
          v-if="loaders[essence][subessence]"
          type="table-tbody"
          tile
          class="skeleton-loader"
        />
        <v-text-field
          v-if="!loaders[essence][subessence]"
          v-model="searchText"
          :append-icon="search"
          label="Поиск"
          class="search-row"
          :color="theme.$accent_ui_color"
          :style="{ color: theme.$main_text }"
          single-line
          hide-details
        />
        <div v-if="!loaders[essence][subessence]" class="table-profile-block">
          <v-data-table
            v-model="alldata[essence][subessence].selected"
            :style="{
              background: theme.$main_bg,
              color: theme.$main_text,
              borderColor: theme.$main_border,
            }"
            hide-default-header
            :no-data-text="alldata[essence][subessence].nodata"
            :headers="alldata[essence][subessence].titles"
            :items="alldata[essence][subessence].data"
            item-key="name"
            show-select
            :search="searchText"
          />
        </div>
        <div class="control-btn">
          <v-btn
            small
            :color="theme.$primary_button"
            class="control-btn-itself"
            @click="deleteSelected(subessence)"
          >
            {{ alldata[essence][`${subessence}DeleteName`].del1 }}
          </v-btn>
        </div>
      </v-tab-item>
      <v-tab-item class="item" :value="'tab-2'">
        <v-skeleton-loader
          v-if="loaders[essence][`all${subessence}`]"
          type="table-tbody"
          tile
          class="skeleton-loader"
        />
        <v-text-field
          v-if="!loaders[essence][`all${subessence}`]"
          v-model="searchText"
          :append-icon="search"
          label="Поиск"
          class="search-row"
          :color="theme.$accent_ui_color"
          :style="{ color: theme.$main_text }"
          single-line
          hide-details
        />
        <div
          v-if="!loaders[essence][`all${subessence}`]"
          class="table-profile-block"
        >
          <v-data-table
            v-model="alldata[essence][`all${subessence}`].selected"
            :style="{
              background: theme.$main_bg,
              color: theme.$main_text,
              borderColor: theme.$main_border,
            }"
            hide-default-header
            :no-data-text="alldata[essence][subessence].nodata"
            :headers="alldata[essence][`all${subessence}`].titles"
            :items="alldata[essence][`all${subessence}`].data"
            item-key="name"
            show-select
            :search="searchText"
          />
        </div>
        <div class="control-btn">
          <v-btn
            small
            :color="theme.$primary_button"
            class="control-btn-itself"
            @click="addSelected(subessence)"
          >
            {{ alldata[essence][`${subessence}DeleteName`].del2 }}
          </v-btn>
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import { mdiMagnify } from '@mdi/js';

export default {
  props: {
    essence: null,
    subessence: null,
    create: null,
    activeFrom: null,
    dataFrom: null,
    nameGroupFrom: null,
  },
  data() {
    return {
      search: mdiMagnify,
      searchText: '',
      alldata: {
        user: {
          tab: {
            roles: 'tab-1',
            groups: 'tab-1',
          },
          rolesName: 'Управление ролями',
          rolesTabName: {
            tab1: 'Роли пользователя',
            tab2: 'Все роли',
          },
          rolesDeleteName: {
            del1: 'Удалить роли пользователя',
            del2: 'Добавить роли пользователю',
          },
          roles: {},
          allroles: {},
          groupsName: 'Управление группами',
          groupsTabName: {
            tab1: 'Группы пользователя',
            tab2: 'Все группы',
          },
          groupsDeleteName: {
            del1: 'Удалить группы пользователя',
            del2: 'Добавить группы пользователю',
          },
          groups: {},
          allgroups: {},
        },
        role: {
          tab: {
            users: 'tab-1',
            permissions: 'tab-1',
          },
          usersName: 'Управление пользователями',
          usersTabName: {
            tab1: 'Пользователи роли',
            tab2: 'Все пользователи',
          },
          usersDeleteName: {
            del1: 'Удалить  пользователя',
            del2: 'Добавить  пользователя',
          },
          users: {},
          allusers: {},
          permissionsName: 'Управление привилегиями',
          permissionsTabName: {
            tab1: 'Привилегии роли',
            tab2: 'Все привилегии',
          },
          permissionsDeleteName: {
            del1: 'Удалить  привилегию',
            del2: 'Добавить  привилегию',
          },
          permissions: {},
          allpermissions: {},
        },
        permission: {
          tab: {
            users: 'tab-1',
          },
          rolesName: 'Управление ролями',
          rolesTabName: {
            tab1: 'Роли пользователя',
            tab2: 'Все роли',
          },
          rolesDeleteName: {
            del1: 'Удалить роли пользователя',
            del2: 'Добавить роли пользователю',
          },
          roles: {},
          allroles: {},
        },
        group: {
          tab: {
            users: 'tab-1',
            dashs: 'tab-1',
            indexes: 'tab-1',
          },
          usersName: 'Управление пользователями',
          usersTabName: {
            tab1: 'Пользователи группы',
            tab2: 'Все пользователи',
          },
          usersDeleteName: {
            del1: 'Удалить  пользователя',
            del2: 'Добавить  пользователя',
          },
          users: {},
          allusers: {},
          dashsName: 'Управление дашбордами',
          dashsTabName: {
            tab1: 'Дашборды группы',
            tab2: 'Все дашборды',
          },
          dashsDeleteName: {
            del1: 'Удалить дашборды группы',
            del2: 'Добавить дашборды группе',
          },
          dashs: {},
          alldushs: {},
          indexesName: 'Управление индексами',
          indexesTabName: {
            tab1: 'Индексы группы',
            tab2: 'Все индексы',
          },
          indexesDeleteName: {
            del1: 'Удалить индексы группы',
            del2: 'Добавить индексы группе',
          },
          indexes: {},
          allindexes: {},
        },
        index: {
          tab: {
            groups: 'tab-1',
          },
          groupsName: 'Управление группами',
          groupsTabName: {
            tab1: 'Группы индекса',
            tab2: 'Все группы',
          },
          groupsDeleteName: {
            del1: 'Удалить группы индекса',
            del2: 'Добавить группы индексу',
          },
          groups: {},
          allgroups: {},
        },
        dash: {
          tab: {
            groups: 'tab-1',
          },
          groupsName: 'Управление группами',
          groupsTabName: {
            tab1: 'Группы дашборда',
            tab2: 'Все группы',
          },
          groupsDeleteName: {
            del1: 'Удалить группы дашборда',
            del2: 'Добавить группы дашборду',
          },
          groups: {},
          allgroups: {},
        },
      },
      loaders: {
        user: {
          roles: true,
          allroles: true,
          groups: true,
          allgroups: true,
        },
        role: {
          users: true,
          allusers: true,
          permissions: true,
          allpermissions: true,
        },
        permission: {
          roles: true,
          allroles: true,
        },
        group: {
          users: true,
          allusers: true,
          dashs: true,
          alldashs: true,
          indexes: true,
          allindexes: true,
        },
        index: {
          groups: true,
          allgroups: true,
        },
        dashGroup: {
          dashs: true,
          alldashs: true,
        },
        dash: {
          groups: true,
          allgroups: true,
        },
      },
      noneText: {
        users: 'Пользователи не выбраны',
        roles: 'Роли не выбраны',
        permissions: 'Привилегии не выбраны',
        groups: 'Группы не выбраны',
        indexs: 'Индексы не выбраны',
        dashs: 'Дашборды не выбраны',
      },
    };
  },
  computed: {
    active: function () {
      let essence = this.essence;
      if (this.create) {
        this.alldata[essence].tab.users = 'tab-2';
        this.alldata[essence].tab.roles = 'tab-2';
        this.alldata[essence].tab.permissions = 'tab-2';
        this.alldata[essence].tab.groups = 'tab-2';
        this.alldata[essence].tab.indexes = 'tab-2';
        this.alldata[essence].tab.dashs = 'tab-2';
      } else {
        this.alldata[essence].tab.users = 'tab-1';
        this.alldata[essence].tab.roles = 'tab-1';
        this.alldata[essence].tab.permissions = 'tab-1';
        this.alldata[essence].tab.groups = 'tab-1';
        this.alldata[essence].tab.indexes = 'tab-1';
        this.alldata[essence].tab.dashs = 'tab-1';
      }
      if (this.activeFrom) {
        this.switchTab();
      }
      return this.activeFrom;
    },
    theme: function () {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    getData: async function () {
      let essence = this.essence;
      let subessence = this.subessence;
      let data = await this.dataFrom;

      if (this.create) {
        if (essence == 'dash') {
          this.alldata[essence][subessence] = {
            selected: [],
            nodata: this.noneText[subessence],
            titles: [{ text: 'Название', value: 'name' }],
            data: [{ name: this.nameGroupFrom }],
          };
          this.$emit('changeData', {
            data: this.translateToArray([{ name: this.nameGroupFrom }]),
            essence: essence,
            subessence: subessence,
          });
        } else {
          this.alldata[essence][subessence] = {
            selected: [],
            nodata: this.noneText[subessence],
            titles: [{ text: 'Название', value: 'name' }],
            data: [],
          };
        }
      } else {
        this.alldata[essence][subessence] = {
          selected: [],
          nodata: this.noneText[subessence],
          titles: [{ text: 'Название', value: 'name' }],
          data: this.translateToObj(data.data[subessence]),
        };
      }

      this.alldata[essence][`all${subessence}`] = {
        selected: [],
        nodata: this.noneText[subessence],
        titles: [{ text: 'Название', value: 'name' }],
        data: this.translateToObj(data[subessence]),
      };

      this.loaders[essence][subessence] = false;
      this.loaders[essence][`all${subessence}`] = false;
    },
    switchTab: function () {
      Object.keys(this.loaders[this.essence]).forEach((item) => {
        this.loaders[this.essence][item] = true;
      });
      this.getData();
    },
    translateToObj: function (array) {
      return array.map((item) => {
        return { name: item };
      });
    },
    deleteSelected: function (subj) {
      let essence = this.essence;
      let subessence = this.subessence;
      let deleted = this.alldata[essence][subj].selected.map((item) => {
        return item.name;
      });

      this.alldata[essence][subj].data = this.alldata[essence][
        subj
      ].data.filter((item) => {
        if (!deleted.includes(item.name)) {
          return item;
        }
      });
      this.alldata[essence][subj].selected = [];
      this.$emit('changeData', {
        data: this.translateToArray(this.alldata[essence][subj].data),
        essence: essence,
        subessence: subessence,
      });
    },
    addSelected: function (subj) {
      let essence = this.essence;
      let subessence = this.subessence;
      let added = this.alldata[essence][`all${subj}`].selected.map((item) => {
        return item.name;
      });
      let already = this.alldata[essence][subj].data.map((item) => {
        return item.name;
      });
      this.alldata[essence][`all${subj}`].data.forEach((item) => {
        if (added.includes(item.name) && !already.includes(item.name)) {
          this.alldata[essence][subj].data.push(item);
        }
      });
      this.alldata[essence][`all${subj}`].selected = [];
      this.alldata[essence].tab[subj] = 'tab-1';
      this.$emit('changeData', {
        data: this.translateToArray(this.alldata[essence][subj].data),
        essence: essence,
        subessence: subessence,
      });
    },
    translateToArray: function (array) {
      return array.map((item) => {
        return item.name;
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dataForProfile.sass';
</style>
