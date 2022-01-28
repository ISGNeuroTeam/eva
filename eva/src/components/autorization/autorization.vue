<template>
  <v-app class="application-aut">
    <v-content>
      <v-container
        class="main-container container-app"
        :style="{ backgroundColor: theme.$secondary_bg }"
      >
        <div class="aut-container">
          <v-card
            ref="authForm"
            class="card-aut"
            :style="{ backgroundColor: theme.$main_bg }"
          >
            <v-card-title
              class="title-aut"
              :style="{ color: theme.$main_text }"
            >
              Авторизация
            </v-card-title>
            <v-card-text class="text-aut" :style="{ color: theme.$main_text }">
              <v-text-field
                v-model="user.username"
                label="Логин"
                :color="theme.$accent_ui_color"
                class="field-aut"
                outlined
                hide-details
                clearable
              />
              <v-text-field
                v-model="user.password"
                label="Пароль"
                :color="theme.$accent_ui_color"
                class="field-aut"
                type="password"
                outlined
                hide-details
                clearable
              />
              <div
                class="error-msg"
                :style="{ color: theme.$error_color }"
                :class="{ errormsgshow: msg }"
              >
                {{ msgText }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                class="btn-aut"
                :color="theme.$primary_button"
                @click="sendAut"
              >
                Подтвердить
              </v-btn>
            </v-card-actions>
            <div class="example" v-html="msgg" />
          </v-card>
        </div>
      </v-container>
    </v-content>
    <footer-bottom />
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      user: {},
      msg: false,
      msgText: '',
      msgg: '',
    };
  },
  computed: {
    theme: function () {
      return this.$store.getters.getTheme;
    },
  },
  mounted() {
    this.getCookie();
    this.$refs.authForm.$el.addEventListener('keypress', (event) => {
      if (event.keyCode === 13) {
        this.sendAut();
      }
    });
  },
  methods: {
    sendAut: async function () {
      if (
        this.user.username &&
        this.user.username.length !== 0 &&
        this.user.password &&
        this.user.password.length !== 0
      ) {
        let response = await fetch(`/api/auth/login`, {
          // сперва нужно подать post запрос
          method: 'POST',
          credentials: 'same-origin',
          body: JSON.stringify(this.user),
          // mode: 'no-cors'
        }).catch((error) => {
          console.log(error);
          return {
            status: 300,
            result: 'Post не создался, возможно из-за неточностей в запросе',
          };
        });

        if (response.status === 200) {
          // если получилось
          await response.json().then((res) => {
            // переводим полученные данные из json в нормальный объект
            this.$store.auth.getters.putLog(
              `status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}&nbsp;&nbsp;login: ${this.user.username}`
            );
            this.$store.commit('clearState');
            this.$router.push(`/main`);
            return res;
          });
        } else {
          this.$store.auth.getters.putLog(
            `status: ${response.status}&nbsp;&nbsp;url: ${response.url}&nbsp;&nbsp;statusText: ${response.statusText}`
          );
          this.msgText = 'Логин или пароль введены неверно';
          this.msg = true;
          setTimeout(() => {
            this.msg = false;
          }, 2000);
        }
      } else {
        this.msgText = 'Логин или пароль не могут быть пустыми';
        this.msg = true;

        setTimeout(() => {
          this.msg = false;
        }, 2000);
      }
    },
    getCookie: function () {
      if (this.$jwt.hasToken()) {
        this.$router.push(`/main`);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/autorization.sass';
</style>
