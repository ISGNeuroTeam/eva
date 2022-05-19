<template>
  <div class="url-select options-block">
    <div class="url-select__list">
      <draggable v-model="urlList"  handle=".action-drag">
        <div v-for="(element, index) of urlList" :key="index" class="list-elem options-item-tooltip">
          <div class="list-elem__data">
            <span class="data-name" :style="{color: theme.$main_text}">{{index+1}}. {{element.name}}:</span>
            <div class="data-modal" v-if="element.type === 'modal'">
              <v-text-field
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
                v-if="element.edit"
              />
              <v-select 
                label="Визуализации"
                :items="tools" 
                v-model="element.tool"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                class="tools"
                outlined
                dense
                hide-details
                v-if="element.edit"/>
              <v-select 
                label="Источники данных"
                :items="searches" 
                v-model="element.search"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                class="searches"
                outlined
                dense
                hide-details
                v-if="element.edit"/>
                <span v-else>
                  <span v-if="element.title" :style="{color: theme.$main_text}">Название: {{element.title}} </span>
                  <span v-if="element.tool" :style="{color: theme.$main_text}">Тип: {{getNameFromSettings(element.tool)}} </span>
                  <span v-if="element.search" :style="{color: theme.$main_text}">Источник данных: {{getSid(element.search)}}</span>
                </span>
            </div>
            <div class="data-link" v-else>
              <v-text-field
                v-model="element.title"
                clearable
                placeholder="Введите название ссылки"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                outlined
                class="item-link"
                hide-details
                v-if="element.edit"
              />
              <v-text-field
                v-model="element.url"
                clearable
                placeholder="Введите текст ссылки"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                outlined
                class="item-link"
                hide-details
                v-if="element.edit"
              />
              <a 
                :href="element.url" 
                :target="element.type"
                @click="openInNewWindow(element, $event)"
                rel="noopener noreferrer"
                v-else
              >
                {{element.title}}
              </a>
            </div>
          </div>
          <div class="list-elem__actions">
            <v-btn 
              icon 
              @click="editHandler(element)" 
            >
              <v-icon :color="theme.$main_text">{{element.edit ? confirm_edit_icon : edit_icon }}</v-icon>
            </v-btn>
            <v-btn 
              icon
              :color="theme.$error_color"
              @click="removeFromList(element)"
            >
              <v-icon>{{delete_icon}}</v-icon> 
            </v-btn>
            <v-icon  class="action-drag" :color="theme.$main_text">{{drag_icon}}</v-icon>
          </div>
        </div>
      </draggable>
    </div>
    <div class="url-select__select options-item-tooltip">
      <v-select 
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text, fill: theme.$main_text }"
        placeholder="Выберите тип события"
        class="subnumber"
        outlined
        dense
        hide-details
        :items="items" 
        v-model="val"
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
import { mdiPlusBox, mdiPencil, mdiClose, mdiMenu, mdiCheckBold } from '@mdi/js';
import settings from '../../js/componentsSettings'
import draggable from 'vuedraggable';
export default {
  name: 'urlSelect',
  components: {
    draggable
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
      ]
    },
    list: {
      type: Array,
      default: () => []
    }
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
      return settings.tools.map(tool => ({
        text: tool.name,
        value: tool.type
      }))
    },
    idDash() {
      return this.$route.params.id;
    },
    searches() {
      const {searches} = this.$store.state[this.idDash]
      return searches ? searches.map(search => ({
        text: search.sid,
        value: {sid: search.sid, search:  search.id}
      })) : []
    },
    urlList: {
      get() {
        return this.localList || this.list
      },
      set(newVal) {
        this.localList = newVal
      }
    }
  },
  methods: {
    getNameFromSettings(name) {
      return settings.tools.find(elem => elem.type === name)?.name
    },
    getSid(search) {
      return search?.sid
    },
    addToList(val) {
      if (!val) return false
      const item = this.items.find(elem => elem.value === val)
      const list = structuredClone(this.urlList)
      this.id = ++this.id
      list.push({
        id: this.id,
        name: item.text,
        type: item.value,
        edit: true,
      })
      this.urlList = structuredClone(list)
    },
    removeFromList(element) {
      const list = structuredClone(this.urlList)
      list.splice(list.findIndex(elem => elem.id === element.id), 1)
      this.urlList = structuredClone(list)
    },
    openInNewWindow(data, e) {
      if (data.type === 'window') {
        e.preventDefault()
        window.open(data.url,'name','width=auto,height=auto')
      }
    },
    editHandler(element) {
      element.edit = !element.edit
    },
  },
  watch: {
    urlList: {
      handler(newVal) {
        this.$emit('change', newVal)
      },
      deep: true
    }
  },
  mounted() {
    this.urlList = structuredClone(this.list)
    this.id = this.list.length ? Math.max.apply(0, this.list.map(elem => elem.id)) : 0
  }
};
</script>


<style lang="sass">
  @import '../../sass/modalSettings.sass'
</style>
<style lang="scss">
  .url-select {
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
          flex: 1;

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
