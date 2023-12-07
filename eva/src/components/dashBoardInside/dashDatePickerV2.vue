<template>
  <portal
    :to="idVisual"
    :disabled="!isFullScreen"
  >
    <div
      class="date-picker"
      :style="{
        maxHeight: parentHeight,
        maxWidth: parentWidth,
      }"
    >
      <div class="date-picker__wrapper">
        <div class="date-picker__text">
          {{ formattedValue || 'Дата не установлена' }}
        </div>
        <v-btn
          icon
          :color="getTheme.$main_text"
        >
          <v-icon>
            {{ mdiCalendarMonthOutline }}
          </v-icon>
        </v-btn>
      </div>
    </div>
  </portal>
</template>

<script>
import {
  mdiCalendarMonthOutline,
  mdiCheckBold,
} from '@mdi/js';

export default {
  name: 'DashDatePickerV2',
  props: {
    idDashFrom: {
      type: String,
      required: true,
    },
    idFrom: {
      type: String,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    mdiCalendarMonthOutline,
    mdiCheckBold,
    formattedValue: '',
  }),
  computed: {
    idDash() {
      return this.idDashFrom;
    },
    idVisual() {
      return this.idFrom || '';
    },
    isFullScreen() {
      return !!this.fullScreenMode;
    },
    parentHeight() {
      return this.sizeFrom.height;
    },
    parentWidth() {
      return this.sizeFrom.width;
    },
    getTheme() {
      return this.$store.getters.getTheme;
    },
  },
};
</script>

<style lang="scss" scoped>
.date-picker {
  padding: 6px;
  color: var(--main_text);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  &__wrapper {
    padding: 6px 10px;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--main_text);
    border-radius: 4px;
    max-width: 350px;
  }
  &__text {
    //white-space: nowrap;
  }
}
</style>
