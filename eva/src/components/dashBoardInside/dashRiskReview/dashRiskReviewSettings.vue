<template>
  <modal-persistent
    ref="confirmModal"
    v-model="isOpen"
    :theme="theme"
    width="560"
    :is-confirm="isChanged"
    :persistent="isChanged"
    :dark="isDarkTheme"
    @cancelModal="close"
    @keydown.esc="close"
  >
    <v-card class="risk-review-settings">
      <v-card-title class="risk-review-settings__header">
        <span class="risk-review-settings__main-title">
          Настройка визуализации
        </span>
      </v-card-title>
      <v-card-text
        v-if="localOptions"
        class="risk-review-settings__group"
      >
        <!--showResidual(switch)-->
        <v-row
          v-if="typeof localOptions[metricKeys.residualMetric] !== 'undefined'"
          align="center"
        >
          <v-col :cols="leftColumnSize">
            <h3>
              Отображать блок остаточного влияния:
            </h3>
          </v-col>
          <v-col :cols="rightColumnSize">
            <v-switch
              v-model="localOptions[metricKeys.residualMetric]"
              class="risk-review-settings__switch mt-0 mb-0"
              dense
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <!--isLegendShow(switch)-->
        <v-row
          v-if="typeof localOptions.isLegendShow !== 'undefined'"
          align="center"
        >
          <v-col :cols="leftColumnSize">
            <h3>
              Отображать легенду:
            </h3>
          </v-col>
          <v-col :cols="rightColumnSize">
            <v-switch
              v-model="localOptions.isLegendShow"
              class="risk-review-settings__switch mt-0 mb-0"
              dense
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <!--leftTitle(text-field)-->
        <v-row
          v-if="typeof localOptions[metricKeys.firstTitle] !== 'undefined'"
          align="center"
        >
          <v-col :cols="leftColumnSize">
            <h3>
              Заголовок левого блока:
            </h3>
          </v-col>
          <v-col :cols="rightColumnSize">
            <v-text-field
              v-model="localOptions[metricKeys.firstTitle]"
              outlined
              class="risk-review-settings__text-field mt-0 mb-0"
              dense
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <!--rightTitle(text-field)-->
        <v-row
          v-if="typeof localOptions[metricKeys.secondTitle] !== 'undefined'"
          align="center"
        >
          <v-col :cols="leftColumnSize">
            <h3>
              Заголовок правого блока:
            </h3>
          </v-col>
          <v-col :cols="rightColumnSize">
            <v-text-field
              v-model="localOptions[metricKeys.secondTitle]"
              outlined
              class="risk-review-settings__text-field mt-0 mb-0"
              dense
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <!--leftValueColor(color-picker)-->
        <v-row
          v-if="typeof localOptions.leftValueColor !== 'undefined'"
          align="center"
        >
          <v-col :cols="leftColumnSize">
            <h3>
              Цвет значений в левом столбце:
            </h3>
          </v-col>
          <v-col :cols="rightColumnSize">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="1000"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': localOptions.leftValueColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="localOptions.leftValueColor"
                dot-size="12"
                class="risk-review-settings__color-picker"
                @input="setWithThrottle(
                  localOptions,
                  'leftValueColor',
                  $event)"
                @update:color="isChanged = true"
              />
            </v-menu>
          </v-col>
        </v-row>
        <!--rightValueColor(color-picker)-->
        <v-row
          v-if="typeof localOptions.rightValueColor !== 'undefined'"
          align="center"
        >
          <v-col :cols="leftColumnSize">
            <h3>
              Цвет значений в правом столбце:
            </h3>
          </v-col>
          <v-col :cols="rightColumnSize">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="1000"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': localOptions.rightValueColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="localOptions.rightValueColor"
                dot-size="12"
                class="risk-review-settings__color-picker"
                @input="setWithThrottle(
                  localOptions,
                  'rightValueColor',
                  $event)"
                @update:color="isChanged = true"
              />
            </v-menu>
          </v-col>
        </v-row>
        <!--metricOptions-->
        <v-row
          v-if="localOptions.metricOptions && localOptions.metricOptions.length > 0"
          align="center"
        >
          <v-col cols="12">
            <h2 class="mb-4">
              Настройка метрик:
            </h2>
          </v-col>
          <v-col cols="12">
            <v-expansion-panels
              class="risk-review-settings__expansion-panels"
            >
              <draggable
                v-model="draggableList"
                handle=".burger"
                class="risk-review-settings__draggable"
              >
                <v-expansion-panel
                  v-for="(item, index) in localOptions.metricOptions"
                  :key="item.id"
                  class="risk-review-settings__expansion-panel"
                >
                  <v-expansion-panel-header class="risk-review-settings__expansion-header">
                    <div class="d-flex align-center">
                      <v-icon
                        size="16"
                        class="burger mr-4"
                        style="cursor: move"
                        :color="theme.$main_border"
                        v-text="mdiMenu"
                      />
                      <h3
                        class="mb-0"
                        :class="item.legend ? 'mr-3' : ''"
                      >
                        {{ item.id }}
                      </h3>
                      <h3
                        v-if="item.legend && item.legend !== item.id && item.isLegendShow"
                        class="mb-0"
                      >
                        "{{ item.legend }}"
                      </h3>
                    </div>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="risk-review-settings__expansion-content">
                    <!--idStart(select)-->
                    <v-row
                      v-if="item.idStartList && item.idStartList.length > 0"
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Название стартовой метрики:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-select
                          v-model="item.idStart"
                          :items="item.idStartList"
                          item-text="label"
                          item-value="value"
                          outlined
                          dense
                          clearable
                          class="risk-review-settings__select"
                          @change="updateIdStart"
                        />
                      </v-col>
                    </v-row>
                    <!--isLegendShow(switch)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Отображать элемент в легенде:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-switch
                          v-model="item.isLegendShow"
                          dense
                          class="risk-review-settings__switch"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--legend(text-field)-->
                    <v-row
                      v-if="item.isLegendShow"
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Наименование для легенды:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-text-field
                          v-model="item.legend"
                          dense
                          outlined
                          class="risk-review-settings__text-field"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--type(select)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Тип:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-select
                          v-model="item.type"
                          item-value="value"
                          item-text="label"
                          dense
                          :items="item.types"
                          outlined
                          class="risk-review-settings__select"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--fill(color-picker)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Цвет заливки:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-menu
                          top
                          offset-x
                          :close-on-content-click="false"
                          z-index="1000"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              :style="{
                                'background-color': item.fill,
                              }"
                              dark
                              v-bind="attrs"
                              v-on="on"
                            />
                          </template>

                          <v-color-picker
                            :value="item.fill"
                            dot-size="12"
                            class="risk-review-settings__color-picker"
                            @input="setWithThrottle(
                              localOptions.metricOptions[index],
                              'fill',
                              $event)"
                            @update:color="isChanged = true"
                          />
                        </v-menu>
                      </v-col>
                    </v-row>
                    <!--textColor(color-picker)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Цвет текста:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-menu
                          top
                          offset-x
                          :close-on-content-click="false"
                          z-index="1000"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              :style="{
                                'background-color': item.textColor,
                              }"
                              dark
                              v-bind="attrs"
                              v-on="on"
                            />
                          </template>

                          <v-color-picker
                            :value="item.textColor"
                            dot-size="12"
                            class="risk-review-settings__color-picker"
                            @input="setWithThrottle(
                              localOptions.metricOptions[index],
                              'textColor',
                              $event)"
                            @update:color="isChanged = true"
                          />
                        </v-menu>
                      </v-col>
                    </v-row>
                    <!--textOffset(text-field\slider)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Отступ текста от элемента:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-row align="center">
                          <v-col cols="4">
                            <v-text-field
                              v-model="item.textOffset"
                              dense
                              outlined
                              class="risk-review-settings__text-field"
                              @change="isChanged = true"
                            />
                          </v-col>
                          <v-col cols="8">
                            <v-slider
                              v-model="item.textOffset"
                              :style="`color: ${theme.$main_text} !important`"
                              class="risk-review-settings__slider align-center"
                              dense
                              max="35"
                              min="-35"
                              @change="isChanged = true"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <!--textPosY(select)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Вертикальная позиция текста:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-select
                          v-model="item.textPosY"
                          :items="item.textPosYItems"
                          item-text="label"
                          item-value="value"
                          outlined
                          dense
                          class="risk-review-settings__select"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--textPosX(select)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Горизонтальная позиция текста:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-select
                          v-model="item.textPosX"
                          :items="item.textPosXItems"
                          item-text="label"
                          item-value="value"
                          outlined
                          dense
                          class="risk-review-settings__select"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--isTitleShow(switch)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Отображать подпись:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-switch
                          v-model="item.isTitleShow"
                          dense
                          class="risk-review-settings__switch"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--isFullHeight(switch)-->
                    <v-row
                      v-if="item.type !== 'line'"
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Отрисовать в полную высоту:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-switch
                          v-model="item.isFullHeight"
                          dense
                          class="risk-review-settings__switch"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                    <!--hideZeroValue(switch)-->
                    <v-row
                      align="center"
                      align-content="center"
                      class="pa-3"
                    >
                      <v-col :cols="leftColumnSize">
                        <h3>
                          Скрыть значения равные нулю:
                        </h3>
                      </v-col>
                      <v-col :cols="rightColumnSize">
                        <v-switch
                          v-model="item.hideZeroValue"
                          dense
                          class="risk-review-settings__switch"
                          @change="isChanged = true"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </draggable>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-else>
        <h3>
          Загрузка...
        </h3>
      </v-card-text>

      <v-card-actions class="risk-review-settings__footer px-4 pt-2">
        <v-btn
          text
          depressed
          class="btn-cancel"
          dark
          :color="theme.$primary_button"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          depressed
          class="btn-save"
          dark
          :color="theme.$primary_button"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>

import { mapGetters } from 'vuex';
import {
  mdiMenu,
} from '@mdi/js';
import draggable from 'vuedraggable';
import { throttle } from '@/js/utils/throttle';

export default {
  name: 'DashRiskReviewSettings',
  components: {
    draggable,
  },
  model: {
    prop: 'modelValue',
    event: 'updateModelValue',
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    metricKeys: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    isChanged: false,
    localOptions: null,
    leftColumnSize: 7,
    rightColumnSize: 5,
    mdiMenu,
  }),
  computed: {
    ...mapGetters({
      theme: 'getTheme',
      themeTitle: 'getThemeTitle',
    }),
    isDarkTheme() {
      return this.themeTitle.indexOf('light') === -1;
    },
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('updateModelValue', value);
      },
    },
    draggableList: {
      get() {
        return this.localOptions.metricOptions;
      },
      set(value) {
        this.localOptions.metricOptions = value;
      },
    },
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.setLocalOptions(this.options);
      }
    },
  },
  mounted() {
    this.setWithThrottle = throttle(this.setWithThrottle, 100);
  },
  methods: {
    setWithThrottle(object, field, value) {
      this.$set(object, field, value);
    },
    updateIdListInMetricOptions(metricOptions) {
      if (metricOptions?.length > 0) {
        const updatedMetricOptions = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const metric of metricOptions) {
          const idStartList = metricOptions
            .filter((el) => el.id !== metric.id)
            .map((el) => ({
              label: el.id,
              value: el.id,
            }));
          updatedMetricOptions.push({
            ...metric,
            idStartList,
          });
        }
        return updatedMetricOptions;
      }
      return [];
    },
    clearLocalOptions() {
      this.localOptions = null;
    },
    setLocalOptions(options) {
      const optionsClone = structuredClone(options);
      const updatedMetricOptions = this.updateIdListInMetricOptions(optionsClone.metricOptions);
      this.localOptions = {
        ...optionsClone,
        metricOptions: updatedMetricOptions,
      };
      this.$nextTick(() => {
        this.isChanged = false;
      });
    },
    updateIdStart() {
      this.isChanged = true;
      this.localOptions.metricOptions = this.updateIdListInMetricOptions(
        structuredClone(this.localOptions.metricOptions),
      );
    },
    save() {
      this.$emit('updateSettings', structuredClone(this.localOptions));
      this.close();
    },
    close() {
      this.isOpen = false;
      this.clearLocalOptions();
    },
  },
};
</script>

<style lang="scss" scoped>
.risk-review-settings {
  position: relative;
  max-height: 750px;
  overflow: auto;
  background-color: var(--main_bg);
  &__metric-options {
    position: relative;
    border: 1px solid var(--main_border);
    border-radius: 4px;
  }
  &__metric-title {
    position: absolute;
    left: 16px;
    top: -26px;
    min-width: 60px;
    padding: 4px 8px;
    transform: translateY(50%);
    border: 1px solid var(--main_border);
    border-radius: 4px;
    background-color: var(--secondary_bg);
  }
  &__draggable {
    width: inherit;
  }
  &__slider::v-deep {
    .v-messages {
      display: none !important;
    }
  }
  &__color-picker::v-deep {
    .v-color-picker__controls {
      background-color: var(--main_bg) !important;
      .v-color-picker__input input, .v-color-picker__input span {
        color: var(--main_text) !important;
        border-color: var(--main_border) !important;
      }
      .v-icon__svg {
        fill: var(--main_text) !important;
      }
    }
  }
  &__text-field::v-deep {
    .v-text-field__details {
      display: none !important;
    }
  }
  &__select::v-deep {
    .v-text-field__details {
      display: none !important;
    }
  }
  &__switch::v-deep {
    .v-messages {
      display: none !important;
    }
  }
  &__expansion-panels::v-deep {
    background-color: var(--main_bg);
    border: none;
    box-shadow: none;
    &::after, ::before {
      display: none;
    }
  }
  &__expansion-panel::v-deep {
    background-color: var(--main_bg);
    border: none;
    box-shadow: none;
    &::after, ::before {
      display: none;
    }
  }
  &__expansion-header::v-deep {
    background-color: var(--main_bg);
    border: none;
    box-shadow: none;
    padding: 6px 8px;
    &::after, ::before {
      display: none;
    }
  }
  &__expansion-content::v-deep {
    background-color: var(--main_bg);
    border: none;
    box-shadow: none;
    &::after, ::before {
      display: none;
    }
  }
  &__footer {
    background-color: var(--main_bg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
}
</style>
