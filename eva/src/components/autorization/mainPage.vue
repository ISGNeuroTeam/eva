<template>
  <v-app
    class="aut-app-main"
    :style="{ backgroundColor: theme.$secondary_bg }"
  >
    <header-top :inside="false" />
    <v-main>
      <v-navigation-drawer
        v-model="openTree"
        fixed
        temporary
        :style="{ color: theme.$main_text, background: theme.$main_bg }"
        class="nav-panel-drawer"
      >
        <navigation-tree-view
          class="navigation-tree"
        />
      </v-navigation-drawer>
      <v-container class="main-container container-product">
        <div class="product-block">
          <v-card
            class="product-block-itself"
            :style="{ backgroundColor: theme.$main_bg }"
            @click="openDash"
            @click.middle="windowOpen('/dashboards')"
          >
            <v-card-text
              class="product-text"
              :style="{ color: theme.$title }"
            >
              Конструирование <br>
              дашбордов
              <p
                class="delimetr"
                :style="{ backgroundColor: theme.$title }"
              />
            </v-card-text>
          </v-card>
          <v-card
            class="product-block-itself"
            :style="{ backgroundColor: theme.$main_bg }"
            @click="openDataResearch"
            @click.middle="windowOpen('/data-research')"
          >
            <v-card-text
              class="product-text"
              :style="{ color: theme.$title }"
            >
              Исследование <br>
              данных
              <p
                class="delimetr"
                :style="{ backgroundColor: theme.$title }"
              />
            </v-card-text>
          </v-card>
          <v-card
            v-if="false"
            class="product-block-itself"
            :style="{ backgroundColor: theme.$main_bg }"
            @click="openQuis"
          >
            <v-card-text
              class="product-text"
              :style="{ color: theme.$title }"
            >
              Вопрос <br>
              ответ
              <p
                class="delimetr"
                :style="{ backgroundColor: theme.$title }"
              />
            </v-card-text>
          </v-card>
        </div>
      </v-container>
    </v-main>
    <footer-bottom />
  </v-app>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    openTree: {
      get() {
        return this.$store.getters['app/isOpenTree'];
      },
      set(val) {
        return this.$store.commit('app/setOpenTree', val);
      },
    },
  },
  mounted() {
    this.$root.$emit('setDocumentTitle', null);
  },
  methods: {
    openDash() {
      this.$router.push('/dashboards');
    },
    windowOpen(link) {
      window.open(link, '_blank');
    },
    openDataResearch() {
      this.$router.push('/data-research');
    },
    openQuis() {
      window.location.href = '/quiz/list'; // используем window.location.href потому что /quiz/list внешняя ссылка а не часть приложения
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/mainPage.sass';
</style>
