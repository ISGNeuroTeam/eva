<template>
  <div
    class="field-profile more-data"
    :data-active="active"
    :style="{ borderColor: theme.$main_border }"
  >
    <div
      class="headline"
      :style="{ color: theme.$title }"
    >
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
      <v-tab-item
        class="item"
        :value="'tab-1'"
      >
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
          @input="$emit('update:is-changed', true)"
        />
        <div
          v-if="!loaders[essence][subessence]"
          class="table-profile-block"
        >
          <v-data-table
            v-model="toRemove"
            :style="{
              background: theme.$main_bg,
              color: theme.$main_text,
              borderColor: theme.$main_border,
            }"
            hide-default-header
            :no-data-text="alldata[essence][subessence].nodata"
            :headers="alldata[essence][subessence].titles"
            :items="userListAdded"
            item-key="name"
            show-select
            :search="searchText"
            @input="$emit('update:is-changed', true)"
          />
        </div>
        <div class="control-btn">
          <v-btn
            small
            :color="theme.$primary_button"
            class="control-btn-itself"
            @click="deleteSelected()"
          >
            {{ alldata[essence][`${subessence}DeleteName`].del1 }}
          </v-btn>
        </div>
      </v-tab-item>
      <v-tab-item
        class="item"
        :value="'tab-2'"
      >
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
          @input="$emit('update:is-changed', true)"
        />
        <div
          v-if="!loaders[essence][`all${subessence}`]"
          class="table-profile-block"
        >
          <v-data-table
            v-model="selectedToAdd"
            :style="{
              background: theme.$main_bg,
              color: theme.$main_text,
              borderColor: theme.$main_border,
            }"
            hide-default-header
            :no-data-text="alldata[essence][subessence].nodata"
            :headers="alldata[essence][`all${subessence}`].titles"
            :items="fullData"
            item-key="name"
            show-select
            :search="searchText"
            @input="$emit('update:is-changed', true)"
          />
        </div>
        <div class="control-btn">
          <v-btn
            small
            :color="theme.$primary_button"
            class="control-btn-itself"
            @click="addSelected()"
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
    nameGroupFrom: {
      type: String,
      default: '',
    },
    essence: {
      type: String,
      required: true,
    },
    subessence: {
      type: String,
      required: true,
    },
    create: {
      type: Boolean,
      required: true,
    },
    activeFrom: {
      type: Boolean,
      required: true,
    },
    dataFrom: {
      type: [Promise, Object],
      required: true,
    },
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
      added: null,
      toAdd: null,
      toRemove: [],
    };
  },
  computed: {
    fullData() {
      return this.translateToObj(this.dataFrom[this.subessence]);
    },
    data() {
      return this.translateToObj(this.dataFrom?.data?.[this.subessence]);
    },
    selectedToAdd: {
      get() {
        return this.toAdd ? this.toAdd : this.userListAdded;
      },
      set(newVal) {
        this.toAdd = structuredClone(newVal);
      },
    },
    userListAdded: {
      get() {
        return this.added ? this.added : this.data;
      },
      set(newVal) {
        this.added = structuredClone(newVal);
      },
    },
    active() {
      if (this.activeFrom) {
        this.$nextTick(() => {
          const { essence } = this;
          const tabs = [
            'users',
            'roles',
            'permissions',
            'groups',
            'indexes',
            'dashs',
          ];
          this.setTabs(essence, tabs);
          this.switchTab();
        });
      }
      return this.activeFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    setTabs(essence, tabs) {
      tabs.forEach((tab) => {
        this.alldata[essence].tab[tab] = this.create ? 'tab-2' : 'tab-1';
      });
    },
    async getData() {
      const { essence } = this;
      const { subessence } = this;
      if (this.create) {
        if (essence === 'dash') {
          this.alldata[essence][subessence] = {
            selected: [],
            nodata: this.noneText[subessence],
            titles: [{ text: 'Название', value: 'name' }],
            data: [{ name: this.nameGroupFrom }],
          };
          this.$emit('changeData', {
            data: this.translateToArray([{ name: this.nameGroupFrom }]),
            essence,
            subessence,
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
          data: this.userListAdded,
        };
      }
      this.alldata[essence][`all${subessence}`] = {
        selected: [],
        nodata: this.noneText[subessence],
        titles: [{ text: 'Название', value: 'name' }],
        data: this.data[subessence],
      };

      this.loaders[essence][subessence] = false;
      this.loaders[essence][`all${subessence}`] = false;
    },
    switchTab() {
      Object.keys(this.loaders[this.essence]).forEach((item) => {
        this.loaders[this.essence][item] = true;
      });
      this.getData();
    },
    translateToObj(array) {
      if (array?.length > 0) {
        return array.map((item) => ({ name: item }));
      }
      return [];
    },
    deleteSelected() {
      const { essence } = this;
      const { subessence } = this;
      const userListAdded = this.userListAdded.filter(
        (item) => !this.toRemove.some(
          (toRemoveItem) => toRemoveItem.name === item.name,
        ),
      );
      this.$emit('changeData', {
        data: this.translateToArray(userListAdded),
        essence,
        subessence,
      });
      this.selectedToAdd = userListAdded;
      this.toRemove = [];
    },
    addSelected() {
      const { essence } = this;
      const { subessence } = this;
      const toAdd = !this.userListAdded.length
        ? this.selectedToAdd
        : this.selectedToAdd.filter(
          (selected) => !this.userListAdded.some((item) => item.name === selected.name),
        );
      this.userListAdded.push(...toAdd);
      this.alldata[essence].tab[subessence] = 'tab-1';
      this.$emit('changeData', {
        data: this.translateToArray(this.userListAdded),
        essence,
        subessence,
      });
      this.selectedToAdd = structuredClone(this.userListAdded);
    },
    translateToArray(array) {
      return array.map((item) => item.name);
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dataForProfile.sass';
</style>
