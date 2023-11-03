<template>
  <modal-persistent
    ref="persistentModal"
    v-model="active"
    :theme="theme"
    :is-confirm="isChanged"
    :persistent="isChanged"
    width="600"
  >
    <v-card
      class="notify-block"
      :style="{ background: theme.$main_bg }"
    >
      <v-card-text
        class="card-notify"
        :style="{ color: theme.$main_text }"
      >
        <div
          class="notify-body"
        >
          <template
            v-for="item in alerts"
          >
            <v-alert
              :key="item.id+item.time"
              :value="!!item"
              dismissible
              dense
              :type="item.type || 'warning'"
              class="mb-3"
              :icon="item.icon || mdiSyncAlert"
              style=" word-break: break-word;"
              @input="removeAlert(item.id)"
            >
              {{ item.message }}
            </v-alert>
          </template>
        </div>
      </v-card-text>
      <v-card-actions
        class="btn-notify"
        :style="{ background: theme.$main_bg }"
      >
        <v-btn
          small
          :color="theme.$primary_button"
          class="notify-btn"
          @click="removeAllAlert()"
        >
          {{ clear }}
        </v-btn>
        <div class="right-btn">
          <v-btn
            small
            :color="theme.$primary_button"
            class="notify-btn"
            @click="confirmCloseModal"
          >
            Закрыть
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>
import { mdiSyncAlert } from '@mdi/js';

export default {
  name: 'ModalNotify',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mdiSyncAlert,
      clear: 'Очистить',
      colorError: '',
      isChanged: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    alerts: {
      get() {
        return this.$store.state.notify.notifications;
      },
    },
  },
  methods: {
    removeAlert(id) {
      this.$store.commit('notify/removeAlert', id);
    },
    removeAllAlert() {
      this.$store.commit('notify/removeAllAlert');
    },

    confirmCloseModal() {
      this.$refs.persistentModal.openConfirmModal();
    },
  },
};
</script>

<style lang="scss">
.notify-block {

  .card-notify {
    padding-top: 20px !important
  }

  .notify-body {
    padding: 30px;
    line-height: 30px;
    overflow: auto;
    max-height: 75vh;
  }

  .notify-btn {
    color: #FFFFFF;
  }

  .btn-notify {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

  }
}
</style>
