<!-- Модальное окно удаления различных элементов -->

<template>
  <v-dialog
    v-model="active"
    class="modal-delete"
    width="600"
    :theme="theme"
    @click:outside="cancelModal"
    @keydown.esc="cancelModal"
  >
    <v-card :style="{ background: theme.$main_bg }">
      <v-card-text class="headline">
        <div
          :style="{ color: theme.$main_text }"
          class="delete-title"
        >
          Вы точно хотите удалить
          <span
            :style="{ color: theme.$main_text }"
            class="delete-name"
          >
            {{ deleteName }}
          </span>
          <span
            v-if="idTitle"
            :style="{ color: theme.$main_text }"
            class="delete-id"
          >
            {{ deleteId }}
          </span>
          ?
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          @click="deleteBtn"
        >
          Удалить
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          @click="cancelModal"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import visualisation from '@/js/visualisationCRUD';

export default {
  name: 'ModalDelete',
  props: {
    idDashFrom: {
      type: String,
      required: true,
    },
    dataPageFrom: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      title: 'dsds',
      deleteId: '',
      deleteName: '',
      page: '',
    };
  },
  computed: {
    idDash() {
      // получаем название элемнета от родителя
      return this.idDashFrom;
    },
    parent() {
      // получаем родителя
      return this.$el;
    },
    idTitle() {
      // смотрим окно было вызвано на странице элемнета или на главной странице
      let title = false;
      if (this.dataPage === 'dash') {
        title = true;
      } else if (this.dataPage === 'layout') {
        title = false;
      }
      return title;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dataPage() {
      return this.dataPageFrom;
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    // получаем объект модального окна в котором храним тот элемнет что хотим удалить
    getModalDelete() {
      if (!this.dashFromStore.modalDelete) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'modalDelete',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.modalDelete,
            prop: 'active',
            value: false,
          },
          {
            object: this.dashFromStore.modalDelete,
            prop: 'id',
            value: '',
          },
          {
            object: this.dashFromStore.modalDelete,
            prop: 'name',
            value: '',
          },
        ]);
      }
      return this.dashFromStore.modalDelete;
    },
    active: {
      get() {
        if (this.idDash) {
          return this.getModalDelete.active;
        }
        return false;
      },
      set(value) {
        if (this.idDash) {
          this.$store.commit('setModalDelete', {
            id: this.idDash,
            status: value,
            elem: '',
            name: '',
            page: this.page,
          });
        } else {
          this.modalValue = false;
        }
      },
    },
  },
  watch: {
    active() {
      // если уже получили имя элемнета
      if (this.idDash) {
        // то вызываем окно с удалением чего-либо
        const modal = this.getModalDelete;
        this.setData(modal);
      }
    },
  },
  created() {
    this.$store.commit('setModalDelete', {
      id: this.idDash,
      active: false,
      elem: '',
      name: '',
      page: this.dataPage,
    }); // при создании моащдльного окна закрываем вс еоктрытые окна
  },
  updated() {
    this.changeStyle();
  },
  methods: {
    setData(modal) {
      this.deleteId = `[ ${modal.id} ]`; // добовляем скобки для id элемнета для красоты
      this.deleteName = modal.name; // получаем имя удаляемого элемента
      if (modal.page === 'tocken') {
        // если удаляем токен
        this.deleteId = ''; // то у него нет id
      } else if (modal.page === 'search') {
        // если удаляем ИС
        this.deleteId = ''; // то прибавляем для красоты кое что к id
        this.deleteName = modal.id; // и заносим имя ИС
      }
      this.page = modal.page;
    },
    deleteBtn() {
      // кнопка удаления
      const id = this.deleteId.replace(/\[|\]|\s/g, ''); // получаем id и отсеиваем все лишние знаки

      // удаление модальных визуализаций
      const elements = this.dashFromStore[id]?.options?.titleActions?.filter((elem) => elem.type === 'modal');
      if (elements?.length) {
        elements.forEach((element) => {
          const nameElem = this.dashFromStore[element.elemName]?.name_elem;
          visualisation.delete({
            idDash: this.idDash,
            id: element.elemName,
            name: nameElem,
            spaceName: element.type,
          });
        });
      }

      this.$store.commit('deleteDashboardVisualization', {
        idDash: this.idDash,
        id,
        page: this.page,
        name: this.deleteName,
      }); // отправляем информацию про удаляемый объект в хранилище
      if (this.page === 'search') {
        const searchesId = [];
        searchesId.push(this.deleteName);
        this.$store.dispatch('deleteFromDb', { ids: searchesId, idDash: this.idDash });
      }
      this.$store.commit('setModalDelete', {
        id: this.idDash,
        status: false,
        elem: '',
        name: '',
        page: this.page,
      }); // и закрываем окно с удалением
    },
    // кнопка отмены удаления
    cancelModal() {
      // просто закрываем окно
      this.active = false;
    },
    changeStyle() {
      if (this.active) {
        document.querySelector(
          '.v-dialog',
        ).style.boxShadow = `0 3px 1px -2px ${this.theme.$main_border},0 2px 2px 0 ${this.theme.$main_border},0 1px 5px 0 ${this.theme.$main_border}`;
      }
    },
  },
};
</script>

<style>
.delete-btn span {
  color: white;
}
.delete-title {
  font-size: 1.2rem !important;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.8);
  padding-top: 15px;
  text-align: center;
}
.delete-title .delete-name {
  font-weight: bold;
  font-size: 1.5rem !important;
  color: rgba(0, 0, 0, 1);
}
.delete-title .delete-id {
  font-weight: bold;
  font-size: 1rem !important;
  color: rgba(0, 0, 0, 0.8);
}
</style>
