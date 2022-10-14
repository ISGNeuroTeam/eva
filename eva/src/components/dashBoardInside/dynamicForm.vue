<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div

      :style="{
        ...customStyle,
        height: `${height}px`
      }"
      :class="customClass"
      v-bind="$attrs"
      style="overflow: auto; padding-top: 15px; padding-bottom: 15px "
    >
      <div
        v-if="parsedFormOptions.length > 0"
        class="dynamicForm"
      >
        <div class="form-group">
          <div
            v-for="(field, index) in parsedFormOptions"
            :key="field.name"
            :style="index < formOptions.length && 'margin-bottom:20px'"
            class="input-container"
          >
            <div
              v-if="field.label"
              class="label"
            >
              {{ field.label }}
            </div>
            <v-text-field
              v-if="field.type === 'textfield'"
              v-model="formData[field.name]"
              :color="theme.$accent_ui_color"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              outlined
              class="text-input"
              hide-details
            />

            <v-switch
              v-if="field.type === 'switch'"
              v-model="formData[field.name]"
              :color="theme.$primary_button"
              :style="{ color: theme.$main_text }"
            />

            <v-select
              v-if="field.type === 'select'"
              v-model="formData[field.name]"
              :items="field.items"
              :append-icon="mdiChevronDown"
              :color="theme.$accent_ui_color"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              :multiple="!!field.multiple"
              item-text="label"
              item-value="value"
              class="text-input"
              hide-details
              outlined
              :attach="true"
              dense
              menu-props="offsetY"
            />

            <v-slider
              v-if="field.type === 'slider'"
              v-model="formData[field.name]"
              :color="theme.$primary_button"
              class=" align-center"
              hide-details
              :max="field.max"
              :min="field.min"
            >
              <template v-slot:append>
                <v-text-field
                  v-model.number="formData[field.name]"
                  outlined
                  dense
                  class="text-input"
                  hide-details
                  single-line
                  type="number"
                  style="width: auto"
                  :max="field.max"
                  :min="field.min"
                  @blur="(event) => validateMinMax(event, field.name, index)"
                />
              </template>
            </v-slider>

            <v-checkbox
              v-if="field.type === 'checkbox'"
              v-model="formData[field.name]"
              :color="theme.$primary_button"
              hide-details
              dark
              class="mb-3"
            >
              <template v-slot:label>
                <span :style="`color: ${theme.$main_text} !important`">
                  Включить отображение легенды
                </span>
              </template>
            </v-checkbox>

            <v-radio-group
              v-if="field.type === 'radioGroup'"
              v-model="formData[field.name]"
            >
              <v-radio
                v-for="option in field.options"
                :key="field.name + option.label"
                :color="theme.$primary_button"
                :label="`Radio ${option.label}`"
                :value="option.value"
              />
            </v-radio-group>
          </div>
        </div>
        <v-btn
          @click="apply()"
        >
          Применить
        </v-btn>
      </div>
      <div
        v-else
        class="no-data-table"
      >
        {{ props.message }}
      </div>
    </div>
  </portal>
</template>

<script>
import { mdiChevronDown, mdiMagnify } from '@mdi/js';

export default {
  name: 'DashDynamicForm',
  components: {},
  inheritAttrs: false,
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      default: null,
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
  data() {
    return {
      mdiChevronDown,
      slider1: 5,
      max: 10,
      min: 0,
      formData: {
      },
      metricCountList: [1, 2, 3, 4, 5, 6],
      mdiMagnify,
      eventRows: [],
      props: {
        titles: [],
        message: 'В настройках отсутствуют исходные данные для формы',
        actions: [
          { name: 'apply', capture: [] },
        ],
      },
    };
  },
  computed: {
    height() {
      return this.sizeFrom.height - 30;
    },
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },

    theme() {
      return this.$store.getters.getTheme;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }
      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.formOptions) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'formOptions',
          value: JSON.stringify([]),
        }]);
      }
      return this.dashFromStore.options;
    },
    formOptions() {
      return this.getOptions.formOptions;
    },
    parsedFormOptions() {
      return JSON.parse(this.formOptions);
    },
  },
  watch: {
    formOptions(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.generateForm();
      }
    },
  },
  beforeMount() {
    if (this.parsedFormOptions) {
      this.generateForm();
    }
  },
  mounted() {
    this.$store.commit('setActions', {
      actions: JSON.parse(JSON.stringify(this.props.actions)),
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    apply() {
      const exportingObject = JSON.stringify(
        this.parsedFormOptions.reduce((acc, item) => [
          ...acc,
          {
            ...item,
            value: this.formData[item.name],
          },
        ], []),
      );

      this.$store.commit('setState', [{
        object: this.dashFromStore.options,
        prop: 'formOptions',
        value: exportingObject,
      }]);

      const tokens = this.$store.state[this.idDash].tockens;
      tokens.forEach((token) => {
        if (
          token.elem === this.id
          && token.action === 'apply'
        ) {
          let value = this.formData[token.capture];
          if (value instanceof Array) {
            if (token.delimetr && token.delimetr !== '') {
              value = value.join(token.delimetr);
            } else if (value) {
              value = value.join(',');
            }
            if (token.prefix && token.prefix !== '') {
              value = value.map((item) => `${token.prefix}${item}`);
            }
            if (token.sufix && token.sufix !== '') {
              value = value.map((item) => `${item}${token.sufix}`);
            }
          } else {
            if (token.prefix && token.prefix !== '') {
              value = `${token.prefix}${value}`;
            }
            if (token.sufix && token.sufix !== '') {
              value = `${value}${token.sufix}`;
            }
          }

          this.$store.commit('setTocken', {
            token,
            idDash: this.idDash,
            store: this.$store,
            value,
          });
        }
      });
    },
    getDefaultValueByType(item) {
      switch (item.type) {
        case 'textfield':
          return '';
        case 'switch':
          return false;
        case 'select':
          if (item.multiple) {
            return [];
          }
          return null;
        case 'slider':
          return item.min;
        case 'checkbox':
          return false;
        case 'radioGroup':
          return null;
        default:
          return null;
      }
    },
    generateForm() {
      this.formData = {};
      this.parsedFormOptions.forEach((item) => {
        this.$set(
          this.formData,
          item.name,
          item?.value || this.getDefaultValueByType(item),
        );
      });

      this.createTockens();
    },
    createTockens() {
      const captures = Object.keys(this.formData);
      this.props.actions.forEach((item, i) => {
        this.$set(this.props.actions[i], 'capture', captures);
      });
      this.$store.commit('setActions', {
        actions: JSON.parse(JSON.stringify(this.props.actions)),
        idDash: this.idDash,
        id: this.id,
      });
    },
    validateMinMax(event, fieldName, index) {
      const { min, max } = this.parsedFormOptions[index];
      if (+event.target.value < +min) {
        event.target.value = +min;
      } else if (+event.target.value > +max) {
        event.target.value = +max;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.dynamicForm {
  text-align: start;

  .form-group {

  }

  .input-container {
    ::v-deep {

      .text-input {
        font-size: 14px;

        .v-input__slot {
        }

        label {
          color: inherit;
        }
      }

      .v-select .v-input__icon--append .v-icon {
        color: var(--main_text) !important;
      }

      .v-slider--horizontal {
        margin-left: 0;
      }

      .v-slider__track-background {
        background-color: var(--secondary_border) !important;
        border-color: var(--secondary_border) !important;
      }

      .v-radio, .v-input--checkbox {
        .v-label {
        }
        .v-icon {
          color: var(--secondary_text)
        }
      }
    }
  }
}

</style>
