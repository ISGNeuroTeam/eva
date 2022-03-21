<!-- Модальное окно для создания дашборда -->

<template>
  <modal-persistent
    ref="confirmModal"
    v-model="active"
    width="90%"
    :theme="theme"
    :is-confirm="isChanged"
    :persistent="isChanged"
    @cancelModal="cancelModal"
  >
    <div
      v-if="groupCheck"
      class="create-modal-block-group"
    >
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div
            class="create-title"
            :style="{ color: theme.$title }"
          >
            {{ nameTitle }}
          </div>
        </v-card-text>
        <div class="create-block">
          <v-text-field
            v-model="newElement.name"
            hide-details
            class="input-create"
            :style="{ color: theme.$main_text }"
            :background-color="theme.$main_bg"
            label="Имя группы"
            :color="theme.$primary_button"
            outlined
            clearable
          />
          <div
            class="title-field input-create"
            :style="{ color: theme.$main_text }"
          >
            Цвет группы
          </div>
          <div class="color-picker-wrapper">
            <div
              v-for="color in colors"
              :key="color"
              class="color-box"
              :class="{
                active: colorInputMode === 'preset' && newElement.color === color,
              }"
              :style="{ backgroundColor: color }"
              @click="setPresetGroupColor(color)"
            >
              <svg
                v-show="colorInputMode === 'preset' && newElement.color === color"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.99992 14.6666C4.31802 14.6666 1.33325 11.6818 1.33325 7.99992C1.33325
                   4.31802 4.31802 1.33325 7.99992 1.33325C11.6818 1.33325 14.6666 4.31802
                   14.6666 7.99992C14.6625 11.6801 11.6801 14.6625 7.99992 14.6666ZM7.98925
                   13.3333H7.99992C10.9444 13.3303 13.3294 10.9417 13.3279 7.99725C13.3264
                   5.05278 10.9391 2.66659 7.99459 2.66659C5.05011 2.66659 2.66272 5.05278
                   2.66125 7.99725C2.65978 10.9417 5.04478 13.3303 7.98925 13.3333ZM6.66659
                   11.3333L3.99992 8.66659L4.93992 7.72659L6.66659 9.44659L11.0599
                   5.05325L11.9999 5.99992L6.66659 11.3333Z"
                  fill="white"
                />
              </svg>
            </div>
            <div class="custom-color-block">
              <div
                class="color-box custom-color"
                :style="{ backgroundColor: pickedColor }"
                @click="setCustomGroupColor(pickedColor)"
              >
                <svg
                  v-show="colorInputMode === 'custom'"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.99992 14.6666C4.31802 14.6666 1.33325 11.6818 1.33325 7.99992C1.33325
                     4.31802 4.31802 1.33325 7.99992 1.33325C11.6818 1.33325 14.6666 4.31802
                     14.6666 7.99992C14.6625 11.6801 11.6801 14.6625 7.99992 14.6666ZM7.98925
                     13.3333H7.99992C10.9444 13.3303 13.3294 10.9417 13.3279 7.99725C13.3264
                     5.05278 10.9391 2.66659 7.99459 2.66659C5.05011 2.66659 2.66272 5.05278
                     2.66125 7.99725C2.65978 10.9417 5.04478 13.3303 7.98925 13.3333ZM6.66659
                     11.3333L3.99992 8.66659L4.93992 7.72659L6.66659 9.44659L11.0599
                     5.05325L11.9999 5.99992L6.66659 11.3333Z"
                    fill="white"
                  />
                </svg>
              </div>
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ on }">
                  <svg
                    id="edit-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    v-on="on"
                  >
                    <path
                      d="M4.41999 20.5789C4.13948 20.5784 3.87206 20.4601 3.68299 20.2529C3.49044
                       20.0474 3.39476 19.7694 3.41999 19.4889L3.66499 16.7949L14.983
                       5.48091L18.52 9.0169L7.20499 20.3299L4.51099 20.5749C4.47999 20.5779
                       4.44899 20.5789 4.41999
                       20.5789ZM19.226 8.30991L15.69 4.77391L17.811 2.65291C17.9986 2.46513 18.2531
                       2.35962 18.5185 2.35962C18.7839 2.35962 19.0384 2.46513 19.226 2.65291L21.347
                       4.77391C21.5348 4.96147 21.6403 5.216 21.6403 5.48141C21.6403 5.74681 21.5348
                       6.00134 21.347 6.18891L19.227 8.30891L19.226 8.30991Z"
                      :fill="theme.$main_border"
                    />
                  </svg>
                </template>
                <v-color-picker
                  v-model="pickedColor"
                  dot-size="17"
                />
              </v-menu>
              Свой цвет
            </div>
          </div>
          <div class="profile-block">
            <data-profile
              v-for="item in Object.keys(group.tab)"
              :key="item"
              essence="group"
              :data-from="dataRest"
              :subessence="item"
              :color-from="theme"
              :create="actionFrom"
              :active-from="modalValue"
              @changeData="changeDataEvent"
            />
          </div>
          <div
            class="warn"
            :class="{ showwarning: showwarning }"
            :style="{ color: theme.$accent_ui_color }"
          >
            {{ nameWarn }}
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn
              small
              :color="theme.$primary_button"
              class="create-btn"
              @click="createBtn(newElement.name)"
            >
              {{ nameBtn.create }}
            </v-btn>
            <v-btn
              small
              :color="theme.$primary_button"
              class="create-btn"
              @click="cancelModal(nameBtn.cancel)"
            >
              {{ nameBtn.cancel }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </div>
    <div
      v-if="!groupCheck"
      class="create-modal-block-group"
      :class="{ create_warning: create_warning }"
    >
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div
            class="create-title"
            :style="{ color: theme.$main_text }"
          >
            {{ nameTitle }}
          </div>
        </v-card-text>
        <div class="create-block">
          <v-text-field
            v-model="newElement.name"
            hide-details
            class="input-create"
            :style="{ color: theme.$main_text }"
            :background-color="theme.$main_bg"
            label="Имя дашборда"
            :color="theme.$accent_ui_color"
            outlined
            clearable
          />
          <div class="profile-block">
            <data-profile
              essence="dash"
              subessence="groups"
              :name-group-from="nameGroupFrom"
              :data-from="dataRest"
              :create="actionFrom"
              :color-from="theme"
              :active-from="modalValue"
              @changeData="changeDataEvent"
            />
          </div>
          <div
            class="warn"
            :class="{ showwarning: showwarning }"
            :style="{ color: theme.$accent_ui_color }"
          >
            {{ nameWarn }}
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn
              small
              :color="theme.$primary_button"
              class="create-btn"
              @click="createBtn(newElement.name)"
            >
              {{ nameBtn.create }}
            </v-btn>
            <v-btn
              small
              :color="theme.$primary_button"
              class="create-btn"
              @click="cancelModal(nameBtn.cancel)"
            >
              {{ nameBtn.cancel }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </div>
  </modal-persistent>
</template>

<script>
export default {
  name: 'ModalCreate',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    groupFlagFrom: {
      type: Boolean,
      default: false,
    },
    groupFrom: {
      type: Array,
      required: true,
    },
    dashsFrom: {
      type: Array,
      required: true,
    },
    actionFrom: {
      type: [Boolean, String],
      default: false,
    },
    dataFrom: {
      type: [Number, Object],
      required: true,
    },
    dashFrom: {
      type: Object,
      default: () => ({}),
    },
    curGroupFrom: {
      type: [Number, Object],
      required: true,
    },
    nameGroupFrom: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: '',
      newElement: {
        name: '',
        id: '',
        color: '',
      },
      nameBtn: {
        create: 'Создать',
        cancel: 'Отмена',
      },
      nameTitle: '',
      nameWarn: 'Имя не может быть пустым',
      showwarning: false,
      newLayout: {},
      create_warning: false,
      dataRest: {},
      changedData: {},
      group: {
        tab: {
          users: null,
          dashs: null,
          indexes: null,
        },
      },
      dash: {
        tab: {
          groups: null,
        },
      },
      colorInputMode: 'preset',
      pickedColor: '',
      isChanged: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    colors() {
      return [
        this.theme.$coral,
        this.theme.$beet,
        this.theme.$raspberry,
        this.theme.$peach,
        this.theme.$orange,
        this.theme.$sun,
        this.theme.$kiwi,
        this.theme.$grass,
        this.theme.$forest,
        this.theme.$sea,
        this.theme.$blue,
        this.theme.$plum,
        this.theme.$purple,
      ];
    },
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    groupCheck() {
      return this.groupFlagFrom;
    },
    groups() {
      return this.groupFrom;
    },
    dashs() {
      return this.dashsFrom;
    },
  },
  watch: {
    pickedColor(color) {
      if (this.colorInputMode === 'custom') this.setGroupColor(color);
    },
    // проверяем изменилось ли что-то в основных полях
    'newElement.name': {
      handler(val, oldVal) {
        if (this.dataFrom) {
          this.isChanged = val !== oldVal && val !== this.dataFrom?.name;
        } else {
          this.isChanged = val !== oldVal;
        }
      },
    },
    'newElement.id': {
      handler(val, oldVal) {
        if (this.dataFrom) {
          this.isChanged = !!(val && oldVal && val !== this.dataFrom?.color);
        } else {
          this.isChanged = !!(val && oldVal);
        }
      },
    },
    'newElement.color': {
      handler(val, oldVal) {
        if (this.dataFrom) {
          this.isChanged = !!(
            val !== '#FFA9A4'
              && oldVal
              && val !== this.dataFrom?.color
          );
        } else {
          this.isChanged = !!(val !== '#FFA9A4' && oldVal);
        }
      },
    },
  },
  created() {
    this.resetModal(this.modalValue);
    if (this.active) {
      this.setData();
    }
  },
  mounted() {
    this.create_warning = false; // выключаем все предупреждения что были включены
    this.pickedColor = this.theme.$main_bg;
  },
  methods: {
    resetModal(val) {
      if (!val) {
        this.name = '';
        this.nameTitle = '';
        this.$set(this, 'newElement', {
          name: '',
          id: '',
          color: '',
        });
        this.nameBtn = {
          create: 'Создать',
          cancel: 'Отмена',
        };
        this.group = {
          tab: {
            users: null,
            dashs: null,
            indexes: null,
          },
        };
        this.isChanged = false;
      }
    },
    setDashData() {
      if (this.dashFrom && Object.keys(this.dashFrom)?.length > 0) {
        this.$set(this.newElement, 'name', this.dashFrom?.name);
        this.$set(this.newElement, 'id', this.dashFrom?.id);
      } else {
        this.newElement.name = '';
        this.$set(this.newElement, 'name', '');
        this.$set(this.newElement, 'id', '');
      }
    },
    setGroupData() {
      if (this.dataFrom && this.dataFrom !== -1) {
        this.$set(this.newElement, 'name', this.dataFrom.name);
        this.$set(this.newElement, 'color', this.dataFrom.color);
        if (this.colors.includes(this.dataFrom.color)) {
          this.colorInputMode = 'preset';
        } else {
          this.colorInputMode = 'custom';
          this.pickedColor = this.dataFrom?.color;
        }
      } else {
        this.$set(this.newElement, 'name', '');
        [this.newElement.color] = this.colors;
        this.colorInputMode = 'preset';
      }
    },
    setData() {
      this.pickedColor = this.theme.$main_bg;
      if (this.modalValue) {
        if (this.groupFlagFrom) {
          this.setGroupData();
        } else {
          this.setDashData();
        }
        if (this.actionFrom) {
          if (this.groupCheck) {
            this.nameTitle = 'Создать новую группу';
          } else {
            this.nameTitle = 'Создать новый дашборд';
          }
          this.nameBtn.create = 'Создать';
        } else {
          if (this.groupCheck) {
            this.nameTitle = 'Редактировать группу';
          } else {
            this.nameTitle = 'Редактировать дашборд';
          }
          this.nameBtn.create = 'Редактировать';
        }
        this.dataRest = this.getDataForEssence();
      }
    },
    setGroupColor(color) {
      this.$set(this.newElement, 'color', color);
    },
    setPresetGroupColor(color) {
      this.colorInputMode = 'preset';
      this.setGroupColor(color);
    },
    setCustomGroupColor(color) {
      this.colorInputMode = 'custom';
      this.setGroupColor(color);
    },
    showWarningMessage(message, autoHide = true) {
      this.nameWarn = message;
      this.showwarning = true;
      if (autoHide) {
        setTimeout(() => {
          this.showwarning = false;
        }, 3000);
      }
    },
    createBtn(name) {
      if (name) {
        const dataObj = {
          name,
        };
        // Группа
        if (this.groupCheck) {
          dataObj.color = this.newElement.color;
          this.setElement(name, 'group', dataObj);
        // Дашборд
        } else {
          this.setElement(name, 'dash', dataObj);
        }
      } else {
        // Имя не введено
        this.showWarningMessage('Имя не может быть пустым');
      }
    },
    setElement(name, type, data) {
      // Метод отправки данных
      let method = 'POST';
      // Объект с данными
      const dataObj = data;
      // Проверка на существование текущего элемента
      const hasSimilarModel = this.checkSimilarModel(type, name);
      // Создание нового элемента
      if (!this.isEdit) {
        if (type === 'dash') {
          // Id группы из которой создается дашборд
          dataObj.idGroup = this.dataFrom?.id || this.dataFrom;
        }
        // Если группа\дашборд существует и об этом еще небыло оповещения
        if (hasSimilarModel) {
          if (!this.showwarning) {
            // Выводим сообщение
            this.showWarningMessage(
              type === 'group'
                ? 'Такая группа уже существует. Хотите изменить её?'
                : 'Такой дашборд уже существует. Хотите изменить его?',
              false,
            );
            // Меняем текст кнопок
            this.nameBtn.create = 'Да';
            this.nameBtn.cancel = 'Нет';
          } else {
            // Меняем текст кнопок
            this.nameBtn.create = this.actionFrom === 'create' ? 'Создать' : 'Редактировать';
            this.nameBtn.cancel = 'Отмена';
            // Скрываем сообщение
            this.showwarning = false;
            // Удаляем старый дашборд
            this.deleteOldElement(this.findElementId(name, type), type);
          }
        }
      // Редактирование существующего элемента
      } else {
        // Меняем метод отправки данных
        method = 'PUT';
        // Id элемента который редактируем
        if (type === 'group') {
          dataObj.id = this.curGroupFrom;
        } else {
          dataObj.id = this.dashFrom.id;
        }
      }
      // Если изменились группы\пользователи\дашборды доступные этому элементу
      if (Object.keys(this.changedData).length !== 0) {
        const keys = this.changedData[type];
        // Добавляем эти поля в объект для отправки на сервер
        Object.keys(keys).forEach((item) => {
          dataObj[item] = keys[item];
        });
      }
      // Если подтвердили замену дашборда
      if (!this.showwarning) {
        this.createEssence(dataObj, method, type);
      }
    },
    async deleteOldElement(id, type) {
      let data = null;
      let element = null;
      if (type === 'group') {
        data = this.groupFrom;
      } else {
        data = this.dashsFrom;
      }
      element = data.find((el) => el.id === id);
      await this.$store.dispatch('auth/deleteEssence', {
        essence: type,
        id: element.id,
      });
      this.$store.commit('deleteDashFromMain', element);
    },
    findElementId(name, type) {
      const fieldName = type === 'dash' ? `${type}sFrom` : `${type}From`;
      return this[fieldName]
        .find((el) => el.name.toLowerCase() === name.toLowerCase())
        .id;
    },
    checkSimilarModel(type, name) {
      const fieldName = type === 'dash' ? `${type}sFrom` : `${type}From`;
      return this[fieldName].some((item) => item.name.toLowerCase() === name.toLowerCase());
    },
    // есл инажали на отмену создания
    cancelModal(btn) {
      if (btn === 'Отмена') {
        // передаем в родителя чтобы выключили модалку
        this.active = false;
        // очищаем имя
        this.name = '';
      }
      this.showwarning = false;
      this.nameBtn.create = this.actionFrom === 'create' ? 'Создать' : 'Редактировать';
      this.nameBtn.cancel = 'Отмена';
      this.nameWarn = 'Имя не может быть пустым';
    },
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.cancelModal('Отмена');
      }
    },
    // если нажали на отмену
    noDashBoards() {
      // просто убираем предупреждение
      this.create_warning = false;
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
        `Создан дашборд ${this.toHichName(dash.name)} с id ${dash.id}`,
      );
    },
    toHichName(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    async getDataForEssence() {
      let role = '';
      let data = '';
      if (this.groupCheck) {
        role = 'group';
        data = this.groups;
      } else {
        role = 'dash';
        data = this.dashs;
      }
      if (this.actionFrom) {
        const allData = {};
        const keys = [];
        const promise = Object.keys(this.$data[role].tab).map((item) => {
          keys.push(item);
          return this.$store.dispatch('auth/getEssenceList', { role: item, create: true });
        });
        const result = await Promise.all(promise);
        result.forEach((item, i) => {
          allData[keys[i]] = item;
        });
        return allData;
      }
      if (this.groupFlagFrom) {
        return this.$store.dispatch('auth/getEssence', {
          essence: role,
          id: data.find((el) => el.id === this.curGroupFrom).id,
        });
      }
      return this.$store.dispatch('auth/getEssence', {
        essence: role,
        id: data.find((el) => el.id === this.dashFrom.id).id,
      });
    },
    setEnter(event) {
      if (event.code === 'Enter') {
        this.createBtn();
      }
    },
    changeDataEvent(event) {
      this.$refs.confirmModal.focusOnModal();
      if (!this.changedData[event.essence]) {
        this.changedData[event.essence] = {};
      }
      this.changedData[event.essence][event.subessence] = event.data;
      this.isChanged = true;
    },
  },
};
</script>

<style lang="scss">
@import '../sass/modalCreate.sass';
</style>
