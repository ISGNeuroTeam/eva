<template>
  <div class="title-actions-select options-block">
    <div class="title-actions-select__list">
      <draggable
        v-model="titleActions"
        handle=".action-drag"
      >
        <div
          v-for="(element, index) of titleActions"
          :key="index"
          class="list-elem options-item-tooltip"
        >
          <div class="list-elem__data">
            <span
              class="data-name"
              :style="{color: theme.$main_text}"
            >{{ index+1 }}. {{ element.name }}:</span>
            <div
              v-if="element.type === 'modal'"
              class="data-modal"
            >
              <v-text-field
                v-if="element.edit"
                v-model="element.title"
                clearable
                placeholder="Введите название"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                outlined
                class="item-link"
                hide-details
              />
              <v-select
                v-if="element.edit"
                v-model="element.tool"
                label="Визуализации"
                :items="tools"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                class="tools"
                outlined
                dense
                hide-details
              />
              <v-select
                v-if="element.edit"
                v-model="element.search"
                label="Источники данных"
                :items="searches"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                class="searches"
                outlined
                dense
                hide-details
              />
              <span v-else>
                <span
                  v-if="element.title"
                  :style="{color: theme.$main_text}"
                >Название: {{ element.title }} </span>
                <span
                  v-if="element.tool"
                  :style="{color: theme.$main_text}"
                >Тип: {{ getNameFromSettings(element.tool) }} </span>
                <span
                  v-if="element.search"
                  :style="{color: theme.$main_text}"
                >Источник данных: {{ getSid(element.search) }}</span>
              </span>
            </div>
            <div
              v-else
              class="data-link"
            >
              <v-text-field
                v-if="element.edit"
                v-model="element.title"
                clearable
                placeholder="Введите название ссылки"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  borderColor: theme.$main_border,
                }"
                style="background: transparent"
                outlined
                class="item-link"
                hide-details
              />
              <v-text-field
                v-if="element.edit"
                v-model="element.url"
                clearable
                placeholder="Введите текст ссылки"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  borderColor: theme.$main_border,
                }"
                style="background: transparent"
                outlined
                class="item-link"
                hide-details
              />
              <a
                v-else
                :href="element.url"
                :target="element.type"
                rel="noopener noreferrer"
                @click="openInNewWindow(element, $event)"
              >
                {{ element.title }}
              </a>
            </div>
          </div>
          <div class="list-elem__actions">
            <v-btn
              icon
              @click="editHandler(element)"
            >
              <v-icon :color="theme.$main_text">
                {{ element.edit ? confirm_edit_icon : edit_icon }}
              </v-icon>
            </v-btn>
            <v-btn
              icon
              :color="theme.$error_color"
              @click="removeFromList(element)"
            >
              <v-icon>{{ delete_icon }}</v-icon>
            </v-btn>
            <v-icon
              class="action-drag"
              :color="theme.$main_text"
            >
              {{ drag_icon }}
            </v-icon>
          </div>
        </div>
      </draggable>
    </div>
    <div class="title-actions-select__select options-item-tooltip">
      <v-select
        v-model="val"
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text, fill: theme.$main_text }"
        placeholder="Выберите тип события"
        class="subnumber"
        outlined
        dense
        hide-details
        :items="items"
      />
      <v-btn
        small
        :color="theme.$primary_button"
        class="add-btn"
        @click="addToList(val)"
      >
        Добавить
      </v-btn>
    </div>
  </div>
</template>

<script>
import {
  mdiPlusBox, mdiPencil, mdiClose, mdiMenu, mdiCheckBold,
} from '@mdi/js';
import draggable from 'vuedraggable';
import settings from '../../js/componentsSettings';

export default {
  name: 'TitleAtionSelect',
  components: {
    draggable,
  },
  props: {
    items: {
      type: Array,
      default: () => [
        {
          text: 'Внешняя ссылка (новая вкладка)',
          value: '_blanc',
        },
        {
          text: 'Внешняя ссылка (новое окно)',
          value: 'window',
        },
        {
          text: 'Внешняя ссылка (в тойже вкладке)',
          value: '_self',
        },
        {
          text: 'Всплывающее окно с визуализацией',
          value: 'modal',
        },
      ],
    },
    list: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    plus_icon: mdiPlusBox,
    edit_icon: mdiPencil,
    confirm_edit_icon: mdiCheckBold,
    delete_icon: mdiClose,
    drag_icon: mdiMenu,
    localList: null,
    val: null,
    id: 0,
  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    tools() {
      return settings.tools.map((tool) => ({
        text: tool.name,
        value: tool.type,
      }));
    },
    idDash() {
      return this.$route.params.id;
    },
    searches() {
      const { searches } = this.$store.state[this.idDash];
      return searches ? searches.map((search) => ({
        text: search.sid,
        value: { sid: search.sid, search: search.id },
      })) : [];
    },
    titleActions: {
      get() {
        return this.localList || this.list;
      },
      set(newVal) {
        this.localList = newVal;
      },
    },
  },
  watch: {
    titleActions: {
      handler(newVal) {
        this.$emit('change', newVal);
      },
      deep: true,
    },
  },
  mounted() {
    this.titleActions = structuredClone(this.list);
    this.id = this.list.length ? Math.max.apply(0, this.list.map((elem) => elem.id)) : 0;
  },
  methods: {
    getNameFromSettings(name) {
      return settings.tools.find((elem) => elem.type === name)?.name;
    },
    getSid(search) {
      return search?.sid;
    },
    addToList(val) {
      if (!val) return;
      const item = this.items.find((elem) => elem.value === val);
      const list = structuredClone(this.titleActions);
      this.id += 1;
      list.push({
        id: this.id,
        name: item.text,
        type: item.value,
        edit: true,
      });
      this.titleActions = structuredClone(list);
    },
    removeFromList(element) {
      const list = structuredClone(this.titleActions);
      list.splice(list.findIndex((elem) => elem.id === element.id), 1);
      this.titleActions = structuredClone(list);
    },
    openInNewWindow(data, e) {
      if (data.type === 'window') {
        e.preventDefault();
        window.open(data.url, 'name', 'width=auto,height=auto');
      }
    },
    editHandler(element) {
      element.edit = !element.edit;
    },
  },
};
</script>

<style lang="sass">
  @import '../../sass/modalSettings.sass'
</style>
<style lang="scss">
  .title-actions-select {
    padding: 0 20px;
    &__list {
      width: 95%;
      .list-elem {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &__data {
          display: flex;
          align-items: center;
          flex-grow: 1;

          .data-name {
            margin-right: 10px;
          }

          .data-modal {
            display: flex;

            .tools,.searches {
              margin-right: 20px;
            }
          }

          .data-link {
            display: flex;
          }
        }

        &__actions {
          display: flex;
          justify-content: end;
          flex-shrink: 0;
        }
      }
    }

    &__select {
      display: flex;
      align-items: center;
      width: max-content;

      .add-btn {
        margin-left: 20px;
      }
    }
  }
</style>
