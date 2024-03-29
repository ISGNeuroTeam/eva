<template>
  <modal-persistent
    ref="modalPersistent"
    v-model="showModal"
    width="400"
    :theme="theme"
    :persistent="isChanged"
    :is-confirm="isChanged"
    @cancelModal="closeModal"
  >
    <div class="themes-modal-wrapper">
      <v-card
        :style="{ backgroundColor: theme.$secondary_bg, borderRadius: '12px' }"
      >
        <v-toolbar
          :style="{ backgroundColor: theme.$main_bg, color: theme.$title }"
        >
          <v-icon :color="theme.$title">
            {{ mdiCompare }}
          </v-icon>
          <v-card-title class="modal-title">
            Настройки темы
          </v-card-title>
          <svg
            v-if="mode === 'manual'"
            class="ml-auto"
            style="margin-right: 10px"
            width="10"
            height="18"
            viewBox="0 0 10 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            @click="mode = 'create'"
          >
            <path
              d="M8.5348 0.514893L0.0498047 8.99989L8.5348
               17.4849L9.9498 16.0709L2.8778 8.99989L9.9498
               1.92889L8.5348 0.514893Z"
              :fill="theme.$main_text"
            />
          </svg>
          <v-icon
            v-else
            class="ml-auto"
            :color="theme.$title"
            @click="closeModal"
          >
            {{ mdiWindowClose }}
          </v-icon>
        </v-toolbar>
        <v-card-text
          v-if="mode === 'select'"
          :style="{ color: theme.$main_text, fontSize: '15px' }"
        >
          Выберите тему
          <v-select
            v-model="select"
            :color="theme.$accent_ui_color"
            hide-details
            outlined
            :items="themeTitles"
            item-text="title"
            item-value="name"
          />
          <div
            v-if="admin && select !== 'dark' && select !== 'light'"
            class="theme-control-btn-block"
          >
            <div
              :style="{ color: theme.$ok_color, marginRight: '30px' }"
              class="btn"
              @click="editTheme"
            >
              <v-icon
                :color="theme.$ok_color"
                :style="{ width: '19px', height: '19px' }"
              >
                {{ mdiPencil }}
              </v-icon>
              Редактировать
            </div>
            <div
              :style="{ color: theme.$error_color }"
              class="btn"
              @click="openConfirmModal"
            >
              <v-icon
                :color="theme.$error_color"
                :style="{ width: '19px', height: '19px' }"
              >
                {{ mdiTrashCanOutline }}
              </v-icon>
              Удалить
            </div>
            <modal-delete />
            <modal-confirm
              v-model="isConfirmModal"
              :theme="theme"
              :modal-text="`Вы точно хотите удалить тему - <strong>${select}</strong>?`"
              btn-confirm-text="Удалить"
              btn-cancel-text="Отмена"
              @result="deleteTheme"
            />
          </div>
          <div class="d-flex align-center justify-space-between mt-2">
            <div
              v-if="admin"
              :style="{
                color: theme.$accent_ui_color,
                width: '170px',
                fontWeight: '600',
              }"
              class="add-theme-button"
              @click="mode = 'create'"
            >
              <v-icon
                :color="theme.$accent_ui_color"
                :style="{ marginRight: '5px' }"
              >
                {{ mdiPlusCircleOutline }}
              </v-icon>
              Создать свою тему
            </div>
            <div
              :style="{
                color: theme.$accent_ui_color,
                fontWeight: '600',
                cursor: 'pointer',
              }"
              @click="downloadTheme(
                select,
                JSON.stringify(theme).replaceAll('#', '@')
              )"
            >
              Скачать тему
            </div>
          </div>
        </v-card-text>
        <v-card-text
          v-if="mode === 'create' || mode === 'edit'"
          :style="{ color: theme.$main_text, fontSize: '15px' }"
        >
          Название темы
          <v-text-field
            v-model="newTitle"
            :style="{ color: theme.$secondary_bg }"
            :background-color="theme.$secondary_bg"
            :color="theme.$primary_button"
            outlined
            hide-details
            @input="isChanged = true"
            @focus="clearError"
          />
          <div
            v-show="errorTitle"
            class="error-message"
          >
            {{ errorMessages }}
          </div>
          <div class="helper-title">
            <p @click="mode = 'manual'">
              Руководство по настройке темы
            </p>
          </div>
          <v-row>
            <v-col
              v-for="row in fields"
              :key="row.title"
              cols="6"
            >
              {{ row.title }}
              <v-row justify="space-between">
                <v-col cols="2">
                  <div
                    class="color-box"
                    :style="{ backgroundColor: row.value }"
                  />
                </v-col>
                <v-col
                  cols="9"
                  :style="{ paddingLeft: '3px', position: 'relative' }"
                >
                  <v-text-field
                    v-model="row.value"
                    outlined
                    hide-details
                  />
                  <v-menu :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                      <v-icon
                        small
                        :color="theme.$title"
                        :style="{
                          position: 'absolute',
                          right: '19px',
                          top: '19px',
                        }"
                        v-on="on"
                      >
                        {{ mdiPencil }}
                      </v-icon>
                    </template>
                    <v-color-picker
                      v-model="row.value"
                      dot-size="17"
                      @input="isChanged = true"
                    />
                  </v-menu>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <div class="image-preview-title">
            Фоновое изображение (необязательно)
          </div>
          <div class="upload-wrapper">
            <div v-if="imagePreview">
              <img
                :src="imagePreview"
                alt=""
                :style="{ opacity: opacity }"
              >
              <v-icon @click="removeImage">
                {{ mdiWindowClose }}
              </v-icon>
            </div>
            <div v-else>
              <input
                ref="imageInput"
                class="file-upload-input"
                type="file"
                accept="image/*"
                @change="uploadImage"
              >
              <div class="upload-text">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 18H2C0.89543 18 0 17.1046 0 16V2C0 0.89543 0.89543 0 2
                     0H16C17.1046 0 18 0.89543 18 2V16C18 17.1046 17.1046 18 16
                     18ZM2 2V16H16V2H2ZM15 14H3L6 10L7 11L10 7L15 14ZM5.5 8C4.67157
                     8 4 7.32843 4 6.5C4 5.67157 4.67157 5 5.5 5C6.32843 5 7 5.67157
                     7 6.5C7 7.32843 6.32843 8 5.5 8Z"
                    :fill="theme.$secondary_text"
                  />
                </svg>
                <div>Загрузить изображение</div>
              </div>
            </div>
          </div>
          <div v-if="imagePreview">
            Прозрачность изображения
            <v-row>
              <v-col cols="9">
                <v-slider
                  v-model="opacity"
                  :max="1"
                  :min="0"
                  step="0.1"
                  :color="theme.$primary_button"
                  :track-color="theme.$secondary_border"
                  hide-details
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="opacity"
                  outlined
                  hide-details
                />
              </v-col>
            </v-row>
          </div>
          <div class="mt-2">
            Загрузить тему
            <v-file-input
              :color="theme.$main_text"
              :style="{ color: theme.$main_text }"
              class="modal-themes__input"
              type="file"
              @click:clear="clearTheme"
              @change="loadTheme($event)"
            />
          </div>
        </v-card-text>
        <v-card-text
          v-if="mode === 'manual'"
          :style="{ color: theme.$main_text, fontSize: '12px' }"
        >
          <div class="manual-block">
            <h2>Руководство по настройке темы</h2>
            <p>
              По возможности старайтесь не использовать светлые оттенки
              красного, желтого и зеленого цветов, так как они используются для
              технических сообщений.
            </p>
            <p>
              Основной фон является главным цветом для фона в приложении.
              Дополнительный фон используется для выделения отдельных частей
              окон или для фона визуальных компонентов.
            </p>
            <p>
              Основной цвет линий используется для компонентов форм или для
              главных линий в схемах и графиках. Дополнительный цвет нужен для
              неважных линий или дополнительных линий в схемах и графиках.
            </p>
            <p>
              Цвета текста также делятся на гавный и дополнительный. Для
              основного текста используется основной цвет, для примечаний или
              пояснений - дополнительный.
            </p>
            <p>
              Цвет заголовка используется в шапке приложения или в шапках
              отдельных компонентов или окон.
            </p>
            <p>
              Акцентный цвет используется для дополнительных органов управления,
              иконок компонентов приложения и выделения активных элементов
              интерфейса.
            </p>
            <p>
              Цвета взаимодействия используются для различных кнопок и органов
              управления в настройках. Дополнительный цвет должен отличаться от
              основного на несколько тонов, он используется для эффекта
              наведения.
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <div v-if="mode === 'create' || mode === 'edit'">
            <v-btn
              :color="theme.$main_bg"
              :style="{ color: theme.$main_text }"
              @click="toSelectMode"
            >
              Отмена
            </v-btn>
            <v-btn
              :color="theme.$primary_button"
              :style="{ color: '#FFF', marginLeft: '10px' }"
              @click="saveNewTheme"
            >
              Сохранить
            </v-btn>
          </div>
          <div v-if="mode === 'manual'">
            <v-btn
              :color="theme.$primary_button"
              :style="{ color: '#FFF' }"
              @click="mode = 'create'"
            >
              Понятно
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </div>
  </modal-persistent>
</template>

<script>
import {
  mdiCompare,
  mdiPlusCircleOutline,
  mdiWindowClose,
  mdiPencil,
  mdiTrashCanOutline,
} from '@mdi/js';

export default {
  name: 'ModalThemes',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    admin: {
      type: Boolean,
      required: true,
    },
    modalValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mdiCompare,
      mdiPlusCircleOutline,
      mdiWindowClose,
      mdiPencil,
      mdiTrashCanOutline,
      select: this.$store.getters.getThemeTitle,
      themeTitles: [],
      newTitle: '',
      opacity: 1,
      fields: [
        {
          title: 'Основной фон',
          propName: '$main_bg',
          value: '#8F8F9C',
        },
        {
          title: 'Дополнительный фон',
          propName: '$secondary_bg',
          value: '#8F8F9C',
        },
        {
          title: 'Основные линии',
          propName: '$main_border',
          value: '#8F8F9C',
        },
        {
          title: 'Дополнительные линии',
          propName: '$secondary_border',
          value: '#8F8F9C',
        },
        {
          title: 'Основной текст',
          propName: '$main_text',
          value: '#8F8F9C',
        },
        {
          title: 'Дополнительный текст',
          propName: '$secondary_text',
          value: '#8F8F9C',
        },
        {
          title: 'Заголовки',
          propName: '$title',
          value: '#8F8F9C',
        },
        {
          title: 'Иконки и акценты',
          propName: '$accent_ui_color',
          value: '#8F8F9C',
        },
        {
          title: 'Взаимодейтсвия',
          propName: '$primary_button',
          value: '#8F8F9C',
        },
        {
          title: 'Взаимодейтсвия (доп.)',
          propName: '$primary_button_hover',
          value: '#8F8F9C',
        },
      ],
      defaultFieldsValue: [
        {
          title: 'Основной фон',
          propName: '$main_bg',
          value: '#8F8F9C',
        },
        {
          title: 'Дополнительный фон',
          propName: '$secondary_bg',
          value: '#8F8F9C',
        },
        {
          title: 'Основные линии',
          propName: '$main_border',
          value: '#8F8F9C',
        },
        {
          title: 'Дополнительные линии',
          propName: '$secondary_border',
          value: '#8F8F9C',
        },
        {
          title: 'Основной текст',
          propName: '$main_text',
          value: '#8F8F9C',
        },
        {
          title: 'Дополнительный текст',
          propName: '$secondary_text',
          value: '#8F8F9C',
        },
        {
          title: 'Заголовки',
          propName: '$title',
          value: '#8F8F9C',
        },
        {
          title: 'Иконки и акценты',
          propName: '$accent_ui_color',
          value: '#8F8F9C',
        },
        {
          title: 'Взаимодейтсвия',
          propName: '$primary_button',
          value: '#8F8F9C',
        },
        {
          title: 'Взаимодейтсвия (доп.)',
          propName: '$primary_button_hover',
          value: '#8F8F9C',
        },
      ],
      imagePreview: null,
      mode: 'select',
      error: false,
      isChanged: false,
      isConfirmModal: false,
      newFields: null,
      errorTitle: false,
      errorMessages: '',
    };
  },
  computed: {
    currentThemeName() {
      return this.$store.getters.getThemeTitle;
    },
    showModal: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    async select(selectedTheme) {
      this.$store.dispatch('setUserSettingsItem', {
        key: 'theme',
        value: selectedTheme,
      });
      this.$refs.modalPersistent.focusOnModal();
      if (selectedTheme !== 'dark' && selectedTheme !== 'light') {
        const response = await fetch(`/api/theme?themeName=${selectedTheme}`);
        const themeData = await response.json();
        const content = JSON.parse(themeData.content);
        this.$store.commit('setTheme', content);
      } else this.$store.commit('setDefaultTheme', selectedTheme);
    },
    showModal(val) {
      if (!val) {
        this.isChanged = false;
        this.mode = 'select';
      }
    },
  },
  async created() {
    await this.getThemeList().then(() => {
      this.$set(this, 'select', this.currentThemeName);
    });
  },
  methods: {
    resetForm() {
      this.newTitle = '';
      this.opacity = 1;
      this.imagePreview = null;
      this.fields.forEach((field) => {
        field.value = '#8F8F9C';
      });
    },
    closeModal() {
      this.toSelectMode();
      this.$nextTick(() => {
        this.showModal = false;
      });
    },
    toSelectMode() {
      this.mode = 'select';
      this.resetForm();
      this.isChanged = false;
      this.$refs.modalPersistent.focusOnModal();
    },
    editTheme() {
      const themeObject = this.$store.getters.getTheme;
      const themeTitle = this.$store.getters.getThemeTitle;
      this.fields.forEach((field) => {
        field.value = themeObject[field.propName];
      });
      this.opacity = themeObject.$image_opacity;
      this.imagePreview = themeObject.$background_image
        ? themeObject.$background_image.slice(4, -1)
        : themeObject.$background_image;
      this.newTitle = themeTitle;
      this.mode = 'edit';
    },
    openConfirmModal() {
      this.isConfirmModal = true;
    },
    async deleteTheme(isConfirm) {
      if (!isConfirm) {
        return;
      }
      try {
        await fetch('/api/theme/delete', {
          method: 'DELETE',
          body: JSON.stringify({
            themeName: this.select,
          }),
        });
        await this.getThemeList();
        this.select = 'dark';
      } catch (e) {
        console.error(e);
      }
    },
    uploadImage() {
      this.isChanged = true;
      const image = this.$refs.imageInput.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
    },
    removeImage() {
      this.imagePreview = null;
      this.opacity = 1;
    },
    async saveNewTheme() {
      if (this.newTitle) {
        if (this.mode === 'edit') {
          try {
            await fetch('/api/theme/delete', {
              method: 'DELETE',
              body: JSON.stringify({
                themeName: this.select,
              }),
            });
          } catch (e) {
            console.error(e);
          }
        }
        const themeObject = {
          themeName: this.newTitle,
          settings: {
            $image_opacity: this.opacity,
            $background_image: this.imagePreview
              ? `url(${this.imagePreview})`
              : null,
          },
        };
        this.fields.forEach((field) => {
          themeObject.settings[field.propName] = field.value;
        });

        try {
          const res = await fetch('/api/theme/create', {
            method: 'POST',
            body: JSON.stringify(themeObject),
          });
          if (res.status === 409) {
            this.errorTitle = true;
            this.errorMessages = 'Такое имя уже занято!';
            return;
          }
          if (res.status !== 200) return;
          const themeData = await res.json();
          const content = JSON.parse(themeData);
          this.$store.commit('setTheme', content);
          this.$set(this, 'select', this.currentThemeName);
          this.mode = 'select';
          await this.getThemeList().then(() => {
            this.isChanged = false;
            this.$refs.modalPersistent.focusOnModal();
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        this.error = true;
      }
    },
    async getThemeList() {
      try {
        const response = await fetch('/api/themes');
        const themeTitles = await response.json();
        const newThemeTitles = themeTitles.map((them) => ({ title: them.name, ...them }));
        this.themeTitles = [{ title: 'Тёмная', name: 'dark' },
          { title: 'Светлая', name: 'light' }].concat(
          newThemeTitles,
        );
      } catch (e) {
        console.error(e);
      }
    },
    downloadTheme(fileName, data = '', postfix = (+(new Date())).toString()) {
      const lnk = document.createElement('a');
      lnk.href = `data:text/plain;content-disposition=attachment;filename=${fileName},${data}`;
      lnk.download = fileName;
      lnk.target = '_blank';
      lnk.style.display = 'none';
      lnk.id = `downloadlnk-${postfix}`;
      document.body.appendChild(lnk);
      lnk.click();
      document.body.removeChild(lnk);
    },
    loadTheme(event) {
      if (event) {
        const reader = new FileReader();
        reader.readAsText(event);
        reader.onload = () => {
          this.newFields = JSON.parse(reader.result.replaceAll('@', '#'));
          this.newTitle = event.name.replaceAll('.txt', '');
          if (this.newFields.$background_image) {
            this.imagePreview = this.newFields.$background_image.replaceAll(/(url)[(]|(\))/g, '');
          } else {
            this.imagePreview = null;
          }
          this.fields = this.fields.map((theme) => {
            theme.value = this.newFields[theme.propName];
            return theme;
          });
        };
      }
    },
    clearTheme() {
      this.newTitle = '';
      this.imagePreview = null;
      this.fields = this.defaultFieldsValue;
    },
    clearError() {
      this.errorTitle = false;
      this.errorMessages = '';
    },
  },
};
</script>

<style lang="scss">
@import '../sass/modalThemes.sass';
</style>
