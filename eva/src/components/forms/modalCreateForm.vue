<template>
  <v-dialog
    v-model="modal"
    width="550"
    persistent
  >
    <!--  <div class="create-modal-block" :class={create_warning:create_warning} > -->
    <div class="create-modal-form-block">
      <v-card>
        <v-card-text
          class="headline"
        >
          <div class="create-title">
            Создать новую форму
          </div>
        </v-card-text>
        <div class="rowform">
          <p>Имя формы</p>
          <v-text-field
            v-model="options.name"
            hide-details
            solo
            class="input"
          />
        </div>
        <div class="rowform">
          <p>Количество строк</p>
          <v-text-field
            v-model="options.rows"
            hide-details
            solo
            class="input mini"
          />
        </div>
        <div class="rowform">
          <p>Количество столбцов</p>
          <v-text-field
            v-model="options.columns"
            hide-details
            solo
            class="input mini"
          />
        </div>
        <div
          class="warn"
          :class="{ showwarning: showwarning }"
        >
          {{ warnText }}
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            small
            color="teal"
            class="create-btn"
            @click="createBtn"
          >
            Создать
          </v-btn>
          <v-btn
            small
            color="#FF6D70"
            class="create-btn"
            @click="cancelModal"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
      <!-- <div class="warning-block" :style="{background:color.backElement}">
                    <div class="warning-text"  :style="{color:color.text}">Такой DashBoard существует. Хотите заменить его?</div>
                    <div class="btn-warning">
                        <v-btn small :color="color.controls" class="warning-btn" @click="yesDashBoards">Да</v-btn>
                        <v-btn small :color="color.controlsActive" class="warning-btn" @click="noDashBoards">Нет</v-btn>
                    </div>
        </div> -->
    </div>
  </v-dialog>
</template>

<script>
export default {
  props: {
    modalFrom: null,
  },
  data() {
    return {
      options: {
        name: '',
        rows: '',
        columns: '',
        disabled: false,
      },
      showwarning: false,
      warnText: 'Имя не может быть пустым',
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    modal() {
      return this.modalFrom;
    },
  },
  methods: {
    createBtn() {
      if (this.options.name == '') {
        this.showwarning = true;
        this.warnText = 'Имя не может быть пустым';
        this.disapear();
      } else if (!Number(this.options.rows) && Number(this.options.rows) != 0) {
        this.showwarning = true;
        this.warnText = 'Количество строк должно быть числом';
        this.disapear();
      } else if (
        !Number(this.options.columns)
        && Number(this.options.columns) != 0
      ) {
        this.showwarning = true;
        this.warnText = 'Количество столбцов должно быть числом';
        this.disapear();
      } else {
        // this.$router.push({path:`/forms/create`, props: { options: 'hello'} });
        this.$store.form.commit('setCreateForm', this.options);
        this.$router.push('/forms/open?editable=true');
        // console.log(this.options);
      }
    },
    disapear() {
      setTimeout(() => {
        this.showwarning = false;
      }, 2000);
    },
    cancelModal() {
      this.$emit('hideForm');
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalCreateForm.sass';
</style>
