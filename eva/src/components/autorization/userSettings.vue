<template>
  <div>
    <div class="title">
      Настройки TTL
    </div>
    <v-switch
      v-model="settings.userTtlEnabled"
      label="Заменять TTL в запросах"
      persistent-placeholder
      dense
      outlined
      hide-details
      @input="$emit('isChanged', true)"
    />
    <v-text-field
      v-model="settings.userTtl"
      label="TTL в секундах"
      :disabled="!settings.userTtlEnabled"
      class="field-profile"
      outlined
      persistent-placeholder
      hide-details
      :style="{ color: theme.$main_text }"
      @input="$emit('isChanged', true)"
      @change="onChangeTTL"
    />

    <div class="title">
      Настройки форматирования
    </div>
    <v-select
      v-model="settings.numberFormat"
      :items="numberFormatItems"
      label="Формат чисел"
      hide-details
      class="field-profile"
      outlined
      dense
      :style="{ color: theme.$main_text }"
      @input="$emit('isChanged', true)"
    />
    <v-text-field
      v-model="settings.decimalPlacesLimits"
      :min="1"
      :max="12"
      label="Число десятичных знаков"
      type="number"
      hide-details
      class="field-profile"
      outlined
      dense
      :style="{ color: theme.$main_text }"
      @input="$emit('isChanged', true)"
      @change="onChangeDecimalPlacesLimits"
    />

    <div class="title">
      Настройки навигации
    </div>
    <v-select
      v-model="settings.startNavTab"
      :items="startNavTabItems"
      label="Порядок вкладок навигации"
      hide-details
      class="field-profile"
      outlined
      dense
      :style="{ color: theme.$main_text }"
      @input="$emit('isChanged', true)"
    />
    <!--<v-row>
      <v-col>
        <pre>{{ fields }}</pre>
      </v-col>
      <v-col>
        <pre class="green&#45;&#45;text">{{ settings }}</pre>
      </v-col>
    </v-row>-->
  </div>
</template>

<script>
export default {
  name: 'UserSettings',
  props: {
    fields: {
      type: Object,
      require: true,
      default: () => ({}),
    },
  },
  data() {
    const numberFormatExample = 1000.01;
    return {
      settings: {},
      defaultSettings: {
        homePage: '',
        userTtlEnabled: false,
        userTtl: 60,
        numberFormat: false,
        startNavTab: null,
        decimalPlacesLimits: 10,
      },
      numberFormatItems: [
        { value: false, text: `${numberFormatExample.toLocaleString()} - Автоматический` },
        ...['en-US', 'ru-RU', 'tr-CY'].map((value) => ({
          text: numberFormatExample.toLocaleString(value),
          value,
        })),
      ],
      startNavTabItems: [
        { text: 'Группы/Дашборды/Дерево (Default)', value: null },
        { text: 'Дерево/Группы/Дашборды', value: 'tree' },
      ],
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    fields: {
      deep: false,
      handler(val) {
        this.settings = { ...this.defaultSettings, ...structuredClone(val) };
      },
    },
    settings: {
      deep: true,
      handler(val) {
        this.$emit('change', structuredClone(val));
      },
    },
  },
  mounted() {
    this.settings = {
      ...this.defaultSettings,
    };
  },
  methods: {
    onChangeTTL() {
      this.settings.userTtl = +this.settings.userTtl.replace(/\D/ig, '')
        || this.defaultSettings.userTtl;
    },
    onChangeDecimalPlacesLimits() {
      let decimalPlacesLimits = +this.settings.decimalPlacesLimits.replace(/\D/ig, '')
        || this.defaultSettings.decimalPlacesLimits;
      if (decimalPlacesLimits > 12) decimalPlacesLimits = 12;
      if (decimalPlacesLimits < 1) decimalPlacesLimits = 1;
      this.settings.decimalPlacesLimits = decimalPlacesLimits;
    },
  },
};
</script>
<style lang="scss">
pre {
  color: orange;
  font-size: 12px;
  line-height: 1.4;
}
</style>
