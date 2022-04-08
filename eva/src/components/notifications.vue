<template>
  <div
    style="position:absolute; right: 0;"
  >
    <template
      v-for="(item, index) in alerts"
    >
      <v-alert
        v-if="!item.readed"
        :key="`${index}/${item}`"
        :value="!!item"
        dismissible
        type="warning"
        @input="dismissAllert(index)"
      >
        {{ item.message }}
      </v-alert>
    </template>
  </div>
</template>
<script>
export default {
  name: 'Notifications',
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
