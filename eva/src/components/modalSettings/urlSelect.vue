<template>
  <div class="url-select">
    <div class="url-select__list">
      <draggable v-model="list"  handle=".action-drag">
        <div v-for="(element, index) of list" :key="index" class="list-elem">
          <div class="list-elem__data">
            <span class="data-name" :style="{color: theme.$main_text}">{{index+1}}. {{element.name}}:</span>
            <div class="data-modal" v-if="element.type === 'modal'">
              <v-select 
                :items="tools" 
                v-model="element.tool"
                outlined
                hide-details
                dense 
                v-if="element.edit"/>
              <v-select 
                :items="searches" 
                v-model="element.search"
                outlined
                hide-details
                dense 
                v-if="element.edit"/>
              <modal-visualisation />
            </div>
            <div class="data-link" v-else>
              <v-text-field
                v-model="element.value"
                dense
                hide-details
                @keyup.enter="element.edit = !element.edit"
                v-if="element.edit"
              />
              <a 
                :href="element.value" 
                :target="element.type"
                @click="openInNewWindow(element, $event)"
                rel="noopener noreferrer"
                v-else
              >
                {{element.value}}
              </a>
            </div>
          </div>
          <div class="list-elem__actions">
            <v-btn 
              icon 
              @click="element.edit = !element.edit" 
            >
              <v-icon>{{edit_icon}}</v-icon>
            </v-btn>
            <v-btn 
              icon
              :color="theme.$error_color"
              @click="removeFromList(index)"
            >
              <v-icon>{{delete_icon}}</v-icon> 
            </v-btn>
            <v-icon  class="action-drag">{{drag_icon}}</v-icon>
          </div>
        </div>
      </draggable>
    </div>
    <div class="url-select__select">
      <v-select 
        outlined
        hide-details
        dense
        :items="items" 
        v-model="val"
      />
      <v-icon
        class="icon-inside"
        :color="theme.$primary_button"
        @click="addToList(val)"
      >
        {{ plus_icon }}
      </v-icon>
    </div>
  </div>
</template>

<script>
import { mdiPlusBox, mdiPencil, mdiClose, mdiMenu } from '@mdi/js';
import settings from '../../js/componentsSettings'
import draggable from 'vuedraggable';
import ModalVisualisation from '../modalVisualisation.vue';
export default {
  name: 'urlSelect',
  components: {
    draggable,
    ModalVisualisation
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
  model: {
    prop: 'list',
    event: 'change'
  },
  data: () => ({
    plus_icon: mdiPlusBox,
    edit_icon: mdiPencil,
    delete_icon: mdiClose,
    drag_icon: mdiMenu,
    val: null,
    tool: null,
    search: null,
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
      // получаем id страницы от родителя
      return this.$route.params.id;
    },
    searches() {
      const {searches} = this.$store.state[this.idDash]
      
      return searches ? searches.map(search => ({
        text: search.sid,
        value: search.id
      })) : []
    }
  },
  methods: {
    addToList(val) {
      if (!val) return false
      const item = this.items.find(elem => elem.value === val)
      const list = this.list.slice()
      list.push({
        name: item.text,
        value: '',
        type: item.value,
        edit: true,
      })
      this.$emit('change', list)
    },
    removeFromList(index) {
      this.list.splice(index, 1)
    },
    openInNewWindow(data, e) {
      if (data.type === 'window') {
        e.preventDefault()
        window.open(data.value,'name','width=auto,height=auto')
      }
    }
  },
};
</script>

<style lang="scss" scoped>
  .url-select {
    padding: 0 20px;
    &__list {
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
            //font-weight: 600;
          }

          .data-modal {
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
    }
  }
</style>
