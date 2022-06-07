<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      class="dash-menu"
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
    >
      <v-list class="profile-dropdown--list">
        <div
          v-for="item in actionList"
          :key="item.id"
        >
          <v-list-item>
            <v-btn
              class="profile-dropdown--button"
              icon
              @click="urlAction(item)"
            >
              <v-icon
                v-if="!!item.icon"
                small
              >
                {{ item.icon }}
              </v-icon>
              {{ item.title || item.name }}
            </v-btn>
          </v-list-item>
        </div>
      </v-list>
    </div>
  </portal>
</template>

<script>
export default {
  name: 'DashMenu',
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    colorFrom: {
      type: Object,
      required: true,
    },
    dataLoadingFrom: null,
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    actionList() {
      return this.$store.state[this.idDashFrom][this.idFrom].options.titleActions;
    },
  },
  methods: {
    urlAction(action) {
      switch (action.type) {
        case 'modal':
          action.open = true;
          this.$store.commit('setVisualisationModalData', { idDash: this.idDashFrom, data: action });
          break;
        case 'window':
          window.open(action.url, '', 'width=auto,height=auto');
          break;
        default:
          window.open(action.url, action.type);
          break;
      }
    },
  },
};
</script>

<style>

</style>
