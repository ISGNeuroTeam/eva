<template>
  <modal-persistent
    ref="confirmModal"
    v-model="active"
    :width="width"
    :theme="theme"
    :is-confirm="isChanged"
    :persistent="isChanged"
    @cancelModal="cancelModal"
  >
    <v-card
      v-if="passway"
      class="passcard"
      :style="{ backgroundColor: theme.$main_bg }"
    >
      <v-card-text
        class="card-text-profile"
        :style="{ color: theme.$title }"
      >
        <div class="headline">
          Изменить пароль
        </div>
        <v-text-field
          v-model="oldpass"
          label="Старый пароль"
          :color="theme.$accent_ui_color"
          :style="{ color: theme.$main_text }"
          class="field-profile"
          type="password"
          outlined
          hide-details
          clearable
          @input="toggleIsChanged"
        />
        <v-text-field
          v-model="newpass"
          label="Новый пароль"
          :color="theme.$accent_ui_color"
          :style="{ color: theme.$main_text }"
          class="field-profile"
          type="password"
          outlined
          hide-details
          clearable
          @input="toggleIsChanged"
        />
        <div
          class="msg-profile"
          :class="{ openMsg: openMsg }"
          :style="{ color: theme.$error_color }"
        >
          {{ msg }}
        </div>
        <v-card-actions>
          <v-btn
            small
            :color="theme.$primary_button"
            class="profile-btn mx-auto mb-4"
            @click="changeBtn('pass')"
          >
            Изменить пароль
          </v-btn>
        </v-card-actions>
        <user-settings
          :fields="userSettings"
          @change="onChangeUserSettingsForm"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="changeBtn(false)"
        >
          Применить
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="cancelModal"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      v-else
      class="profile-tab"
      :style="{ backgroundColor: theme.$main_bg }"
    >
      <v-card-text
        class="card-text-profile"
        :style="{ color: theme.$title }"
      >
        <div class="headline">
          {{ titleModal }}
        </div>

        <div
          v-if="showBlock.users"
          class="profile-block"
        >
          <v-row>
            <v-col>
              <v-text-field
                v-model="userData.username"
                label="Логин пользователя"
                :color="theme.$accent_ui_color"
                :style="{ color: theme.$main_text }"
                class="field-profile"
                outlined
                hide-details
                clearable
                @input="toggleIsChanged"
              />
              <v-text-field
                v-model="userData.pass"
                label="Пароль пользователя"
                :color="theme.$accent_ui_color"
                :style="{ color: theme.$main_text }"
                autocomplete="new-password"
                class="field-profile"
                placeholder="********"
                type="password"
                outlined
                hide-details
                clearable
                @input="toggleIsChanged"
              />
              <v-autocomplete
                v-model="homePage"
                :items="[{text:'--Нет--', value: ''}, ...dataRest.groups]"
                class="field-profile"
                label="Значение для группы по умолчанию"
                :style="{ color: theme.$main_text }"
                outlined
              />
            </v-col>
            <v-col>
              <user-settings
                :fields="userSettings"
                @change="onChangeUserSettingsForm"
              />
            </v-col>
          </v-row>
          <data-profile
            v-for="item in Object.keys(user.tab)"
            :key="item"
            :color-from="colorFrom"
            essence="user"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="active"
            @changeData="changeDataEvent"
            @update:is-changed="toggleIsChanged"
          />
        </div>

        <div
          v-if="showBlock.roles"
          class="profile-block"
        >
          <v-text-field
            v-model="curItem.name"
            label="Название роли"
            :color="colorFrom.controls"
            class="field-profile"
            outlined
            hide-details
            clearable
            @input="toggleIsChanged"
          />
          <data-profile
            v-for="item in Object.keys(role.tab)"
            :key="item"
            essence="role"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="active"
            @changeData="changeDataEvent"
            @update:is-changed="toggleIsChanged"
          />
        </div>

        <div
          v-if="showBlock.permissions"
          class="profile-block"
        >
          <v-text-field
            v-model="curItem.name"
            label="Название привилегии"
            :color="colorFrom.controls"
            class="field-profile"
            outlined
            hide-details
            clearable
            @input="toggleIsChanged"
          />
          <data-profile
            v-for="item in Object.keys(permission.tab)"
            :key="item"
            essence="permission"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="active"
            @changeData="changeDataEvent"
            @update:is-changed="toggleIsChanged"
          />
        </div>
        <div
          v-if="showBlock.groups"
          class="profile-block"
        >
          <v-text-field
            v-model="curItem.name"
            label="Название группы"
            :color="colorFrom.controls"
            class="field-profile"
            outlined
            hide-details
            clearable
            @input="toggleIsChanged"
          />
          <div class="zagolovok-values">
            Изменить цвет группы
          </div>
          <v-color-picker
            v-model="curItem.color"
            class="colorPicker"
            @input="toggleIsChanged"
          />
          <data-profile
            v-for="item in Object.keys(group.tab)"
            :key="item"
            essence="group"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="active"
            @changeData="changeDataEvent"
            @update:is-changed="toggleIsChanged"
          />
        </div>
        <div
          v-if="showBlock.indexes"
          class="profile-block"
        >
          <v-text-field
            v-model="curItem.name"
            label="Название индекса"
            :color="theme.$accent_ui_color"
            class="field-profile"
            outlined
            hide-details
            clearable
            @input="toggleIsChanged"
          />
          <data-profile
            v-for="item in Object.keys(index.tab)"
            :key="item"
            essence="index"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="active"
            @changeData="changeDataEvent"
            @update:is-changed="toggleIsChanged"
          />
        </div>
      </v-card-text>

      <div
        class="msg-profile"
        :class="{ openMsg: openMsg }"
        :style="{ color: theme.$error_color }"
      >
        {{ msg }}
      </div>
      <v-card-actions class="action-btn">
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="changeBtn(create)"
        >
          {{ btnMsg }}
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="cancelModal"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>
import UserSettings from './userSettings.vue';

export default {
  name: 'ModalProfile',
  components: { UserSettings },
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    passway: {
      type: Boolean,
      required: true,
    },
    create: {
      type: Boolean,
      required: true,
    },
    userFrom: {
      type: Object,
      required: true,
    },
    keyFrom: {
      type: [Number, String],
      default: '',
    },
    curItemFrom: {
      type: Object,
      default: () => ({}),
    },
    curUserId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      oldpass: '',
      newpass: '',
      msg: '',
      openMsg: false,
      colorMsg: '',
      userData: {},
      essence: ['user', 'role', 'permission', 'group', 'index'],
      user: {
        tab: {
          roles: null,
          groups: null,
        },
      },
      role: {
        tab: {
          users: null,
          permissions: null,
        },
      },
      permission: {
        tab: {
          roles: null,
        },
      },
      group: {
        tab: {
          users: null,
          dashs: null,
          indexes: null,
        },
      },
      index: {
        tab: {
          groups: null,
        },
      },
      showBlock: {
        users: true,
        roles: false,
        permissions: false,
        groups: false,
        indexes: false,
      },
      curItem: {},
      changedData: null,
      colorFrom: {},
      isChanged: false,
      homePage: '',
      userSettings: {},
    };
  },
  computed: {
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    width() {
      return this.passway ? '400px' : '90%';
    },
    titleModal() {
      if (this.create) {
        switch (this.keyFrom) {
          case 1:
            return 'Создать нового пользователя';
          case 2:
            return 'Создать новую роль';
          case 3:
            return 'Создать новую привилегию';
          case 4:
            return 'Создать новую группу';
          case 5:
            return 'Создать новый индекс';
          default:
            return '';
        }
      } else {
        switch (this.keyFrom) {
          case 1:
            return 'Редактировать данные пользователя';
          case 2:
            return 'Редактировать роль';
          case 3:
            return 'Редактировать привилегию';
          case 4:
            return 'Редактировать группу';
          case 5:
            return 'Редактировать индекс';
          default:
            return '';
        }
      }
    },
    btnMsg() {
      return this.create ? 'Создать' : 'Применить';
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dataRest: {
      get() {
        const essence = this.$store.getters['auth/essence'];
        return this.changedData ? this.changedData : essence;
      },
      set(newVal) {
        this.changedData = structuredClone(newVal);
      },
    },
  },
  mounted() {
    this.colorFrom = this.theme;

    if (this.active) {
      this.userData.username = Object.keys(this.userFrom).length !== 0 ? this.userFrom.username : '';
      this.userData.pass = '';
      Object.keys(this.showBlock).forEach((item) => {
        this.showBlock[item] = false;
      });

      switch (this.keyFrom) {
        case 1:
          this.showBlock.users = true;
          break;
        case 2:
          this.showBlock.roles = true;
          break;
        case 3:
          this.showBlock.permissions = true;
          break;
        case 4:
          this.showBlock.groups = true;
          break;
        case 5:
          this.showBlock.indexes = true;
          break;
        default:
          break;
      }
      if (this.create) {
        this.$set(this.userData, 'username', '');
        this.$set(this.userData, 'pass', '');
        this.$set(this.curItem, 'color', '#FF0000');
        this.$set(this.curItem, 'name', '');
      } else {
        this.$set(this.userData, 'username', this.curItemFrom.name);
        this.curItem = { ...this.curItemFrom };
      }
      this.getDataForEssence();
      this.isChanged = false;
    }
    if (this.userFrom.id) {
      this.$store.dispatch('getUserSettings', this.userFrom.id).then((res) => {
        if (res.setting) {
          const {
            homePage = '',
          } = res.setting;
          this.homePage = homePage;
          this.userSettings = res.setting;
        }
      });
    }
  },
  methods: {
    async getDataForEssence() {
      if (this.create) {
        const role = this.essence[this.keyFrom - 1];
        const allData = {};
        const keys = [];
        const promise = Object.keys(this.$data[role].tab).map((item) => {
          keys.push(item);
          return this.$store.dispatch('auth/getEssenceList', {
            role: item,
            create: true,
          });
        });

        const result = await Promise.all(promise);

        result.forEach((item, i) => {
          allData[keys[i]] = item;
        });
        allData.data = {};
        this.$store.commit('auth/setEssence', allData);
        return allData;
      }
      let result;
      await this.$store
        .dispatch('auth/getEssence', {
          essence: this.userFrom.tab,
          id: this.userFrom.id,
        })
        .then((res) => {
          result = res;
        });
      return result;
    },
    cancelModal(isClearChanges = true) {
      this.$store.commit('auth/dropEssence');
      this.$emit('cancelModal', isClearChanges);
    },
    showErrorMsg(msg, color) {
      if (this.openMsg) return;
      this.msg = msg;
      this.openMsg = true;
      this.colorMsg = color;
      setTimeout(() => {
        this.openMsg = false;
      }, 2000);
    },
    checkPassLength(pass) {
      if (pass.length < 7) {
        this.showErrorMsg(
          'Пароль должен быть больше 7 символов',
          this.colorFrom.controlsActive,
        );
        return false;
      } if (pass.length > 20) {
        this.showErrorMsg(
          'Пароль должен быть меньше 20 символов',
          this.colorFrom.controlsActive,
        );
        return false;
      }
      return true;
    },
    changeBtn(act) {
      let method = 'POST';
      const formData = {}; // формируем объект для передачи RESTy
      let sameMsg = '';
      let forbiddenError = '';
      switch (this.keyFrom) {
        case 1:
          formData.id = this.userFrom.id;
          method = 'PUT';
          forbiddenError = 'Старый пароль введен неверно';
          if (act === true) {
            method = 'POST';
            if (!this.userData.pass || this.userData.pass.length === 0) {
              this.showErrorMsg(
                'Логин или пароль не могут быть пустыми',
                this.colorFrom.controlsActive,
              );
              return;
            }
            if (!this.checkPassLength(this.userData.pass)) return;
            formData.password = this.userData.pass;
          } else if (act === 'pass') {
            if (
              this.oldpass == null
              || this.oldpass.length === 0
              || !this.oldpass
            ) {
              this.showErrorMsg(
                'Введите старый пароль',
                this.colorFrom.controlsActive,
              );
              return;
            }
            if (
              this.newpass == null
              || this.newpass.length === 0
              || !this.newpass
            ) {
              this.showErrorMsg(
                'Введите новый пароль',
                this.colorFrom.controlsActive,
              );
              return;
            }
            if (!this.checkPassLength(this.newpass)) return;
            if (this.newpass === this.oldpass) {
              this.showErrorMsg(
                'Пароли не должны совпадать',
                this.colorFrom.controlsActive,
              );
              return;
            }
            formData.old_password = this.oldpass;
            formData.new_password = this.newpass;
          } else if (this.userData.pass && this.userData.pass.length !== 0) {
            if (!this.checkPassLength(this.userData.pass)) return;
            formData.password = this.userData.pass;
          }
          formData.name = this.userData.username;
          sameMsg = 'Такой пользователь уже есть';
          break;
        case 2:
          if (!this.create) {
            formData.id = this.userFrom.id;
            method = 'PUT';
          }
          formData.name = this.curItem.name;
          sameMsg = 'Такая роль уже есть';
          break;
        case 3:
          if (!this.create) {
            formData.id = this.userFrom.id;
            method = 'PUT';
          }
          formData.name = this.curItem.name;
          sameMsg = 'Такая привилегия уже есть';
          break;
        case 4:
          if (!this.create) {
            formData.id = this.userFrom.id;
            method = 'PUT';
          }
          formData.name = this.curItem.name;
          formData.color = this.curItem.color;
          sameMsg = 'Такая группа уже есть';
          break;
        case 5:
          if (!this.create) {
            formData.id = this.userFrom.id;
            method = 'PUT';
          }
          formData.name = this.curItem.name;
          sameMsg = 'Такой индекс уже есть';
          break;
        default:
          break;
      }
      if (Object.keys(this.dataRest.data).length !== 0) {
        const essence = this.dataRest.data;
        Object.keys(essence).forEach((item) => {
          if (Array.isArray(essence[item])) {
            if (essence[item].length !== 0) {
              essence[item].forEach((itemEs) => {
                if (!formData[item]) {
                  formData[item] = [];
                }
                formData[item].push(itemEs);
              });
            } else {
              formData[item] = [];
            }
          }
        });
      }
      const response = this.$store.dispatch('auth/setEssence', {
        formData: JSON.stringify(formData),
        essence: this.essence[this.keyFrom - 1],
        method,
      });
      response.then(async (res) => {
        if (res.status === 200) {
          await res.json().then((responseData) => {
            const { setting } = this.$store.dispatch('getUserSettings', this.userFrom.id || responseData.id);
            const newSettings = {
              ...setting,
              ...this.userSettings,
              homePage: this.homePage,
            };
            this.$store.dispatch(
              'setUserSettings',
              JSON.stringify({
                user_id: this.userFrom.id || responseData.id[0],
                setting: newSettings,
              }),
            );
            this.$store.commit('app/setUserSettings', newSettings);
          });
          if (this.userFrom.id === this.curUserId) {
            this.$store.commit('auth/setUserName', this.userData.username);
          }
          this.cancelModal(false);
        } else if (res.status === 409) {
          this.showErrorMsg(sameMsg, '#FF6D70');
        } else if (res.status === 403) {
          this.showErrorMsg(forbiddenError, '#FF6D70');
        }
      });
    },
    changeDataEvent(event) {
      this.$refs.confirmModal.focusOnModal();
      const dataRest = structuredClone(this.dataRest);
      dataRest.data[event.subessence] = structuredClone(event.data);
      this.dataRest = dataRest;
      this.toggleIsChanged();
    },
    toggleIsChanged() {
      this.isChanged = true;
    },
    onChangeUserSettingsForm(fields) {
      this.toggleIsChanged();
      Object.keys(fields).forEach((key) => {
        this.userSettings[key] = fields[key];
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalProfile.sass';
</style>
