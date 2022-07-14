<template>
  <div
    style="position:absolute; right: 0;"
    class="ma-3"
  >
    <template
      v-for="(item, index) in alerts"
    >
      <v-alert
        v-if="!item.read"
        :key="`${index}/${item}`"
        :value="!!item"
        dismissible
        dense
        type="warning"
        class="mb-3"
        :icon="item.icon || mdiSyncAlert"
        @input="dismissAllert(index)"
      >
        {{ item.message }}
      </v-alert>
    </template>
  </div>
</template>
<script>
import { mdiSyncAlert } from '@mdi/js';

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
    dismissAllert(index) {
      this.$store.commit('notify/dismiss', index);
    },
  },
};
</script>
