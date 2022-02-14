<template>
  <v-dialog
    v-model="active"
    :width="width"
    persistent
    @keydown="checkEsc($event)"
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
        />
      </v-card-text>
      <div
        class="msg-profile"
        :class="{ openMsg: openMsg }"
        :style="{ color: theme.$error_color }"
      >
        {{ msg }}
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="changeBtn('pass')"
        >
          Изменить
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
      v-if="!passway"
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
          <v-text-field
            v-model="userData.username"
            label="Логин пользователя"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text }"
            class="field-profile"
            outlined
            hide-details
            clearable
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
            ide-details
            clearable
          />
          <data-profile
            v-for="item in Object.keys(user.tab)"
            :key="item"
            :color-from="colorFrom"
            essence="user"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="activeFrom"
            @changeData="changeData"
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
          />
          <data-profile
            v-for="item in Object.keys(role.tab)"
            :key="item"
            essence="role"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="activeFrom"
            @changeData="changeData"
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
          />
          <data-profile
            v-for="item in Object.keys(permission.tab)"
            :key="item"
            essence="permission"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="activeFrom"
            @changeData="changeData"
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
          />
          <div class="zagolovok-values">
            Изменить цвет группы
          </div>
          <v-color-picker
            v-model="curItem.color"
            class="colorPicker"
          />
          <data-profile
            v-for="item in Object.keys(group.tab)"
            :key="item"
            essence="group"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="activeFrom"
            @changeData="changeData"
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
          />
          <data-profile
            v-for="item in Object.keys(index.tab)"
            :key="item"
            essence="index"
            :color-from="colorFrom"
            :data-from="dataRest"
            :subessence="item"
            :create="create"
            :active-from="activeFrom"
            @changeData="changeData"
          />
        </div>
      </v-card-text>

      <div
        class="msg-profile"
        :class="{ openMsg: openMsg }"
        :style="{ color: colorMsg }"
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
  </v-dialog>
</template>

<script>
export default {
  props: {
    activeFrom: {
      type: Boolean,
      required: true,
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
      type: Number,
    },
    curItemFrom: {
      type: Object,
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
      changedData: {},
      dataRest: {},
      colorFrom: {},
    };
  },
  computed: {
    active() {
      return this.activeFrom;
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
      return this.create ? 'Создать' : 'Редактировать';
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    active() {
      if (this.activeFrom) {
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
        }
        if (this.create) {
          this.$set(this.userData, 'username', '');
          this.$set(this.userData, 'pass', '');
          this.$set(this.curItem, 'color', '');
          this.$set(this.curItem, 'name', '');
        } else {
          this.$set(this.userData, 'username', this.curItemFrom.name);
          this.curItem = { ...this.curItemFrom };
        }
        this.dataRest = this.getDataForEssence();
      }
    },
  },
  mounted() {
    this.colorFrom = this.theme;
  },
  methods: {
    async getDataForEssence() {
      if (this.create) {
        const role = this.essence[this.keyFrom - 1];
        const allData = {};
        const keys = [];
        const promise = Object.keys(this.$data[role].tab).map((item) => {
          keys.push(item);
          return this.$store.auth.getters.getEssenceList(item, true);
        });

        const result = await Promise.all(promise);
        result.forEach((item, i) => {
          allData[keys[i]] = item;
        });

        return allData;
      }
      return this.$store.auth.getters.getEssence(
        this.userFrom.tab,
        this.userFrom.id,
      );
    },
    cancelModal() {
      this.$emit('cancelModal');
    },
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.cancelModal();
      }
    },
    showErrorMsg(msg, color) {
      this.msg = msg;
      this.openMsg = true;
      this.colorMsg = color;
      setTimeout(() => {
        this.openMsg = false;
      }, 2000);
    },
    changeBtn(act) {
      let method = 'POST';
      const formData = {}; // формируем объект для передачи RESTу
      let sameMsg = '';
      switch (this.keyFrom) {
        case 1:
          formData.id = this.userFrom.id;
          method = 'PUT';
          this.msg = 'Пароль не может быть пустым';
          if (act === true) {
            method = 'POST';
            if (this.userData.pass.length === 0 || !this.userData.pass) {
              this.showErrorMsg(
                'Логин или пароль не могут быть пустыми',
                this.colorFrom.controlsActive,
              );
              return false;
            }
            if (this.userData.pass.length < 7) {
              this.showErrorMsg(
                'Пароль должен быть больше 7 символов',
                this.colorFrom.controlsActive,
              );
              return false;
            }
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
              return false;
            } if (
              this.newpass == null
              || this.newpass.length === 0
              || !this.newpass
            ) {
              this.showErrorMsg(
                'Введите новый пароль',
                this.colorFrom.controlsActive,
              );
              return false;
            } if (this.newpass.length < 7) {
              this.showErrorMsg(
                'Пароль должен быть больше 7 символов',
                this.colorFrom.controlsActive,
              );
              return false;
            } if (this.newpass === this.oldpass) {
              this.showErrorMsg(
                'Пароли не должны совпадать',
                this.colorFrom.controlsActive,
              );
              return false;
            }
            formData.old_password = this.oldpass;
            formData.new_password = this.newpass;
          } else if (this.userData.pass.length !== 0 && this.userData.pass) {
            if (this.userData.pass.length < 7) {
              this.showErrorMsg(
                'Пароль должен быть больше 7 символов',
                this.colorFrom.controlsActive,
              );
              return false;
            }
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
      }

      if (Object.keys(this.changedData).length !== 0) {
        const essence = this.changedData[this.essence[this.keyFrom - 1]];
        Object.keys(essence).forEach((item) => {
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
        });
      }

      const response = this.$store.auth.getters.setEssence({
        formData: JSON.stringify(formData),
        essence: this.essence[this.keyFrom - 1],
        method,
      });

      response.then((res) => {
        if (res.status === 200) {
          this.cancelModal();
        } else if (res.status === 409) {
          this.showErrorMsg(
            sameMsg,
            '#FF6D70',
          );
        } else if (res.status === 403) {
          this.showErrorMsg(
            '',
            '#FF6D70',
          );
        }
      });
    },
    changeData(event) {
      if (!this.changedData[event.essence]) {
        this.changedData[event.essence] = {};
      }
      this.changedData[event.essence][event.subessence] = event.data;
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalProfile.sass';
</style>
