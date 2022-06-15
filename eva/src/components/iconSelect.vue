<template>
  <div class="icon-select">
    <v-menu offset-x>
      <template v-slot:activator="{ on }">
        <v-btn
          v-if="!!iconName"
          tile
          icon
          ripple
          :color="theme.$main_text"
          v-on="on"
        >
          <v-icon>
            {{ buttonPlaceholder }}
          </v-icon>
        </v-btn>
        <v-btn
          v-else
          small
          :color="theme.$primary_button"
          v-on="on"
        >
          Иконка
        </v-btn>
      </template>
      <v-card class="icon-list-container">
        <v-virtual-scroll
          :items="icons"
          height="200"
          width="370"
          item-height="36"
        >
          <template v-slot:default="{ item }">
            <div class="d-flex">
              <v-btn
                v-for="(icon, index) of item"
                :key="index"
                class="d-flex align-center justify-center"
                ripple
                tile
                icon
                :color="theme.$main_text"
              >
                <v-icon
                  @click="buttonPlaceholder = icon"
                >
                  {{ icon }}
                </v-icon>
              </v-btn>
            </div>
          </template>
        </v-virtual-scroll>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import iconlist from '@/fonts/eva-iconfont/eva-iconlist.json';

export default {
  name: 'IconSelect',
  model: {
    prop: 'iconName',
    event: 'change',
  },
  props: {
    iconName: {
      type: String,
      default: '',
    },
  },
  computed: {
    icons() {
      const perChunk = 10;
      return ['', ...iconlist].reduce((all, one, i) => {
        const ch = Math.floor(i / perChunk);
        all[ch] = [].concat((all[ch] || []), one);
        return all;
      }, []);
    },
    buttonPlaceholder: {
      get() {
        return this.iconName;
      },
      set(newIconName) {
        this.$emit('change', newIconName);
      },
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
};
</script>
