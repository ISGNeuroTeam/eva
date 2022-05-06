<template>
  <div class="settings-dash">
  <v-dialog
    ref="fullScreenModal"
    v-model="fullScreenMode"
    width="100%"
  >
    <template v-slot:activator="{ on: onFullScreen }">
      <v-btn
        v-on="onFullScreen"
      >
        open
      </v-btn>
    </template>
    <div
      class="full-screen-dialog"
      :style="{ height: '80vh' }"
    >
      <v-card
        class="dash-block"
        :style="{
          background: theme.$main_bg,
          boxShadow: `0 3px 1px -2px ${theme.$main_border},
          0 2px 2px 0 ${theme.$main_border},0 1px 5px 0 ${theme.$main_border}`,
        }"
      >
        <!-- <v-card-title
          v-show="props.disappear"
          class="card-title open_title"
        >
          <div class="name-dash">
            <v-icon
              v-if="dataFromDB"
              class="icon"
              :color="theme.$main_border"
            >
              {{ mdiDatabaseSearch }}
            </v-icon>
            <v-icon
              v-show="dataMode"
              class="icon chart"
              :color="theme.$accent_ui_color"
            >
              {{ props.icons[elemIcon] }}
            </v-icon>
            <div class="dash-capture">
              <div
                v-if="props.edit"
                class="dash-title"
                :style="{ color: theme.$main_text }"
              >
                {{ boardTitle }}
              </div>
              <div
                v-if="props.edit"
                v-show="dataMode"
                class="dash-block-id"
                :style="{ color: theme.$main_text }"
              >
                [ {{ element }} ]
                <span
                  v-if="dataSourceId !== ''"
                  class="ml-1"
                >
                  {{ dataSourceTitle }}
                </span>
              </div>
              <div
                v-if="props.edit"
                v-show="dataMode"
                class="dash-block-sid"
                :style="{
                  color: theme.$main_text,
                  borderColor: theme.$main_border,
                }"
              >
                {{ props.sid }}
              </div>
              <v-text-field
                v-if="!props.edit"
                v-show="dataMode"
                v-model="props.name"
                clearable
                :color="theme.$accent_ui_color"
                :style="{ color: theme.$title }"
                class="dash-edit-title"
                hide-details
              />
            </div>
          </div>
          <div class="settings-dash-block">
            <div class="settings-dash">
              <v-tooltip
                v-if="isMultiline"
                bottom
                :color="theme.$accent_ui_color"
                :open-delay="tooltipOpenDelay"
              >
                <template v-slot:activator="{ on }">
                  <v-icon
                    class="datasource"
                    :color="theme.$main_border"
                    v-on="on"
                    @click="resetRange()"
                  >
                    {{ props.mdiMagnifyMinusOutline }}
                  </v-icon>
                </template>
                <span>Сбросить зум</span>
              </v-tooltip>
              <v-tooltip
                bottom
                :color="theme.$accent_ui_color"
                :open-delay="tooltipOpenDelay"
              >
                <template v-slot:activator="{ on }">
                  <v-icon
                    class="expand"
                    :color="theme.$main_border"
                    v-on="on"
                    @click="fullScreenMode = !fullScreenMode"
                  >
                    {{ props.mdiArrowCollapse }}
                  </v-icon>
                </template>
                <span>Свернуть</span>
              </v-tooltip>
            </div>
          </div>
        </v-card-title> -->
      </v-card>
    </div>
  </v-dialog>
  <!-- <v-tooltip
    v-if="isMultiline"
    bottom
    :color="theme.$accent_ui_color"
    :open-delay="tooltipOpenDelay"
  >
    <template v-slot:activator="{ on }">
      <v-icon
        class="datasource"
        :color="theme.$main_border"
        v-on="on"
        @click="resetRange()"
      >
        {{ props.mdiMagnifyMinusOutline }}
      </v-icon>
    </template>
    <span>Сбросить зум</span>
  </v-tooltip> -->
</div>
</template>

<script>
export default {
  name: 'modalVisualisation',
  props: {
    visualisation: {
      type: String
    },
    data: {
      type: String
    }
  },
  data: () => ({

  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  }
}
</script>

<style>

</style>