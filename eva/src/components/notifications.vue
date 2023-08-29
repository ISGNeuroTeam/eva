<template>
  <div
    style="position:absolute; right: 0;"
    class="ma-3"
  >
    <template
      v-for="item in alerts"
    >
      <v-alert
        v-if="!item.read"
        :key="item.id+item.time"
        :value="!!item"
        dismissible
        dense
        :type="item.type || 'warning'"
        class="mb-3"
        :icon="item.icon || mdiSyncAlert"
        @input="dismissAlert(item.id)"
      >
        {{ item.message }}
      </v-alert>
    </template>
  </div>
</template>
<script>
import { mdiSyncAlert } from '@mdi/js';
import { mapGetters } from 'vuex';

export default {
  name: 'Notifications',
  data() {
    return {
      mdiSyncAlert,
    };
  },
  computed: {
    alerts: {
      get() {
        return this.$store.state.notify.notifications;
      },
    },
  },
  methods: {
    dismissAlert(id) {
      this.$store.commit('notify/dismiss', id);
    },
  },
};
</script>
