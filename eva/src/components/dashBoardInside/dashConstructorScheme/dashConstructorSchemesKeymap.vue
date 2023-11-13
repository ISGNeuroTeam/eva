<template>
  <div
    :class="{
      'dash-scheme-keymap--is-open': modelValue,
    }"
    class="dash-scheme-keymap"
  >
    <div class="dash-scheme-keymap__close">
      <v-btn
        icon
        :color="theme.$main_text"
        @click="close"
      >
        <v-icon>{{ mdiClose }}</v-icon>
      </v-btn>
    </div>
    <div class="dash-scheme-keymap__wrapper">
      <div class="dash-scheme-keymap__header">
        <div class="dash-scheme-keymap__title">
          Горячие клавиши
        </div>
        <div class="dash-scheme-keymap__subtitle">
          (Работают <span>только</span> в режиме редактирования)
        </div>
      </div>
      <div class="dash-scheme-keymap__tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="`${id}-tab-${index}`"
          class="dash-scheme-keymap__tab-item"
          :class="{
            'dash-scheme-keymap__tab-item--active': activeTab === index,
          }"
          @click="setActiveTab(index)"
        >
          {{ tab.label }}
        </div>
      </div>
      <div class="dash-scheme-keymap__tab-content">
        <div
          v-for="(content, index) in activeTabContent"
          :key="`${id}-tab-content-${index}`"
          class="dash-scheme-keymap__tab-content-item"
        >
          <div class="dash-scheme-keymap__hotkey-label">
            {{ content.label }}:
          </div>
          <div class="dash-scheme-keymap__hotkey-value">
            <div
              v-for="(hotkey, hotkeyIndex) in content.keys"
              :key="`${id}-hotkey-${index}-${hotkeyIndex}`"
              class="dash-scheme-keymap__hotkey-item"
            >
              <div class="dash-scheme-keymap__hotkey-btn">
                {{ hotkey }}
              </div>
              <div
                v-if="hotkeyIndex < content.keys.length - 1"
                class="px-1"
              >
                +
              </div>
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
    id: {
      type: String,
      required: true,
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
              keys: ['Del'],
            },
            {
              label: 'Копирование выделенных элементов',
              keys: ['Ctrl', 'C'],
            },
            {
              label: 'Дублирование выделенных элементов',
              keys: ['Ctrl', 'D'],
            },
            {
              label: 'Вырезание выделенных элементов',
              keys: ['Ctrl', 'X'],
            },
            {
              label: 'Вставка скопированных/вырезанных элементов',
              keys: ['Ctrl', 'V'],
            },
            {
              label: 'Откат изменений(назад/вперед)',
              keys: ['Ctrl', 'Z/Y'],
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
          label: 'Подписи',
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
      mdiClose,
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
$padding-top: 16px;
$padding-x: 24px;
.dash-scheme-keymap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -100%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: all .2s ease;
  background-color: var(--main_bg);
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
    display: grid;
    min-height: inherit;
    grid-template-columns: minmax(120px, auto) 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "header header"
      "tab tab-content";
  }
  &__tabs {
    grid-area: tab;
    align-content: flex-start;
    align-self: flex-start;

    display: grid;
    grid-template-columns: 1fr;
    grid-auto-rows: max-content;
    gap: 8px 0;
    padding-top: $padding-top;
  }
  &__tab-item {
    padding: 4px 16px;
    border: 1px solid var(--main_border);
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background-color: var(--secondary_bg);
    }
    &--active {
      border-color: var(--primary_button);
    }
  }
  &__header {
    grid-area: header;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: min-content min-content;
    align-content: center;
    justify-content: center;
  }
  &__tab-content {
    grid-area: tab-content;
    display: grid;
    grid-auto-rows: min-content;
    grid-template-columns: 1fr;
    gap: 10px 10px;
    padding: $padding-top $padding-x;
    font-size: 18px;
  }
  &__tab-content-item {
    display: grid;
    grid-auto-rows: auto;
    grid-template-columns: 1fr auto;
    gap: 0 10px;
    grid-template-areas:
        "label hotkeys";
  }
  &__hotkey-label {
    grid-area: label;
    text-align: left;
  }
  &__hotkey-value {
    grid-area: hotkeys;
    display: flex;
    flex-wrap: nowrap;
    justify-content: end;
  }
  &__hotkey-item {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
  }
  &__hotkey-btn {
    border: 1px solid var(--main_border);
    background-color: var(--main_text);
    color: var(--main_bg);
    border-radius: 4px;
    padding: 4px 6px;
    line-height: 1;
    align-self: center;
    font-weight: 500;
    min-width: 58px;
  }
  &__title {
    font-size: 24px;
    color: var(--main_text);
  }
  &__subtitle {
    font-size: 16px;
    color: var(--secondary_text);
    line-height: 1;
  }
}
</style>
