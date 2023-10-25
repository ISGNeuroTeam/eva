<template>
  <div
    :class="{
      'dash-constructor-schemes-keymap--is-open': modelValue,
    }"
    class="dash-constructor-schemes-keymap"
  >
    <div class="dash-constructor-schemes-keymap__wrapper">
      <button
        class="dash-constructor-schemes-keymap__close"
        @click="close"
      >
        <v-icon
          class="control-button edit-icon theme--dark"
          :style="{ color: theme.$secondary_text }"
        >
          {{ iconClose }}
        </v-icon>
      </button>
      <div class="d-flex flex-wrap align-center">
        <div class="column align-center text-left">
          <div class="dash-constructor-schemes-keymap__title">
            Горячие клавиши
          </div>
          <div class="dash-constructor-schemes-keymap__subtitle">
            (работают только в режиме редактирования)
          </div>
        </div>
        <div class="dash-constructor-schemes-keymap__tab-list">
          <div
            v-for="(item, index) in tabs"
            :key="index"
            class="dash-constructor-schemes-keymap__tab-item"
            :class="{
              'dash-constructor-schemes-keymap__tab-item--active': activeTab === item.value,
            }"
            @click="setActiveTab(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div class="dash-constructor-schemes-keymap__row justify-space-between px-4">
        <div
          v-for="(item, index) in activeTabContent"
          :key="index"
          class="dash-constructor-schemes-keymap__item"
        >
          <div class="d-flex mb-2">
            <div class="column text-left">
              <div class="dash-constructor-schemes-keymap__label">
                {{ item.label }}:
              </div>
              <div
                v-if="item.secondLabel"
                class="dash-constructor-schemes-keymap__second-label"
              >
                {{ item.secondLabel }}
              </div>
            </div>
          </div>
          <div class="d-flex">
            <div class="d-flex justify-space-between align-center">
              <template v-for="(keyItem, keyIndex) in item.keys">
                <div
                  :key="`key-item-${keyIndex}`"
                  class="dash-constructor-schemes-keymap__button"
                >
                  {{ keyItem }}
                </div>
                <div
                  v-if="(keyIndex + 1) < item.keys.length"
                  :key="`key-separator-${keyIndex}`"
                  class="dash-constructor-schemes-keymap__separator"
                >
                  +
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mdiClose } from '@mdi/js';

export default {
  name: 'DashConstructorSchemesKeymap',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeTab: 0,
      tabs: [
        {
          value: 0,
          label: 'Общие',
          // Список горячих клавиш с описанием
          content: [
            {
              label: 'Перемещение графа',
              keys: ['Ctrl', 'ЛКМ'], // Ctrl + ЛКМ
            },
            {
              label: 'Удаление выделенного элемента',
              keys: ['Delete'],
            },
          ],
        },
        {
          value: 1,
          label: 'Блоки',
          content: [
            {
              label: 'Создание линии от блока',
              keys: ['ЛКМ', 'Move'],
            },
            {
              label: 'Перемещение блока',
              keys: ['ЛКМ x2', 'Move'],
            },
          ],
        },
        {
          value: 2,
          label: 'Линии',
          content: [
            {
              label: 'Создание линии',
              keys: ['ЛКМ', 'Move'],
            },
            {
              label: 'Перемещение линии ',
              secondLabel: '(без перемещения точек начала и конца линии)',
              keys: ['ЛКМ x2', 'Move'],
            },
            {
              label: 'Добавление изгиба на линию',
              keys: ['⇧ Shift', 'ЛКМ', 'Move'],
            },
            {
              label: 'Отмена последней точки изгиба линии',
              secondLabel: '(во время создания линии)',
              keys: ['ПКМ'],
            },
            {
              label: 'Остановить создание линии в указанной точке',
              secondLabel: '(во время создания линии)',
              keys: ['⇧ Shift', 'ЛКМ'],
            },
          ],
        },
        {
          value: 3,
          label: 'Подписи к блокам',
          content: [
            {
              label: 'Выделить указанную подпись',
              keys: ['⇧ Shift', 'ЛКМ'],
            },
            {
              label: 'Перемещение подписи',
              keys: ['⇧ Shift', 'ЛКМ x2', 'Move'],
            },
            {
              label: 'Редактирование текста подписи',
              secondLabel: '(для сохранения необходимо нажать ENTER)',
              keys: ['⇧ Shift', 'ЛКМ x2'],
            },
          ],
        },
        {
          value: 4,
          label: 'Порты',
          content: [
            {
              label: 'Выделить указанный порт',
              keys: ['⇧ Shift', 'ЛКМ'],
            },
            {
              label: 'Перемещение порта',
              keys: ['⇧ Shift', 'ЛКМ x2', 'Move'],
            },
          ],
        },
      ],
      iconClose: mdiClose,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    activeTabContent() {
      const tabContent = [];
      let arr = [];
      this.tabs[this.activeTab].content.forEach((item, index) => {
        if ((index + 1) % 4 === 0) {
          arr.push(item);
          tabContent.push([...arr]);
          arr = [];
        } else {
          arr.push(item);
        }
      });
      tabContent.push([...arr]);
      return this.tabs[this.activeTab].content;
    },
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false);
    },
    setActiveTab(tabNum) {
      this.$emit('changeKeymapTab');
      this.activeTab = tabNum;
    },
  },
};
</script>

<style lang="scss" scoped>
.dash-constructor-schemes-keymap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -100%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: all .2s ease;
  background-color: var(--main_bg);
  padding-top: 10px;
  padding-bottom: 39px;
  min-height: 400px;
  &--is-open {
    bottom: 0;
    opacity: 1;
    pointer-events: all;
  }
  &__close {
    position: absolute;
    right: 23px;
    top: 23px;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  &__wrapper {
    position: relative;
  }
  &__tab-list {
    width: fit-content;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    padding: 2px;
    background-color: var(--secondary_bg);
  }
  &__tab-item {
    padding: 0 20px;
    margin-right: 2px;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    color: var(--main_text);
    cursor: pointer;
    transition: .3s cubic-bezier(.25,.8,.5,1);
    position: relative;
    white-space: nowrap;
    &:last-child {
      margin-right: 0;
    }
    &:after {
      bottom: 0;
      content: "";
      pointer-events: none;
      position: absolute;
      top: 0;
      z-index: 1;
      border: 1px solid transparent;
      border-radius: 6px;
      transition: .3s cubic-bezier(.25,.8,.5,1);
    }
    &--active {
      &:after {
        border: 1px solid var(--primary_button);
        left: 0;
        right: 0;
      }
    }
  }
  &__row {
    display: flex;
    justify-content: space-evenly;
    align-items: flex-start;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 40px 50px;
    height: 325px;
    overflow: auto;
  }
  &__title {
    color: var(--accent_ui_color);
    font-weight: 600;
    font-size: 24px;
    line-height: 29px;
  }
  &__subtitle {
    color: var(--main_border);
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
  }
  &__item {
    min-width: 600px;
    gap: 0px 30px;
  }
  &__label {
    font-weight: 600;
    font-size: 20px;
    line-height: 29px;
    white-space: nowrap;
    color: var(--main_text);
  }
  &__second-label {
    font-weight: 600;
    font-size: 15px;
    line-height: 18px;
    color: var(--main_text);
  }
  &__button {
    padding: 0 8px;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--main_bg);
    background-color: var(--main_text);
    border-radius: 4px;
    pointer-events: none;
    white-space: nowrap;
  }
  &__separator {
    font-weight: 400;
    font-size: 40px;
    line-height: 24px;
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--main_text);
    margin: 0 8px;
    pointer-events: none;
  }
}
</style>
