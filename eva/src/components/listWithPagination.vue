<template>
  <div class="interesting-fields-popup">
    <v-data-table
      :style="{
        backgroundColor: theme.$main_bg,
        color: theme.$main_text,
        'max-height': '500px',
      }"
      disable-pagination
      hide-default-footer
      :headers="[
        { text: 'Значение', value: 'value' },
        { text: 'Количество', value: 'count' },
        { text: 'Процент', value: '%' },
      ]"
      :items="filteredItems[currentPage - 1]"
    />
    <div class="interesting-fields-popup__pagination">
      <v-pagination
        v-if="filteredItems.length > 1"
        ref="pagination"
        v-model="currentPage"
        :length="filteredItems.length"
        :total-visible="10"
      />
    </div>

    <div class="interesting-fields-popup__footer">
      <v-select
        v-model="rowsPerPage"
        :items="rowsPerPageVariants"
        dense
        height="20px"
        outlined
        class="interesting-fields-popup__select"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListWithPagination',
  props: {
    theme: {
      type: Object,
      required: true,
    },
    listItems: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      currentPage: 1,
      rowsPerPage: 10,
      rowsPerPageVariants: [
        {
          text: '5',
          value: 5,
        },
        {
          text: '10',
          value: 10,
        },
        {
          text: '15',
          value: 15,
        },
        {
          text: 'Все',
          value: 1,
        },
      ],
    };
  },
  computed: {
    filteredItems() {
      const result = [];
      let group = [];
      this.listItems.forEach((item) => {
        group.push(item);
        if (group.length % this.rowsPerPage === 0 && this.rowsPerPage !== 1) {
          result.push(group);
          group = [];
        }
      });
      if (group.length > 0) {
        result.push(group);
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
.interesting-fields-popup {
  &__pagination ::v-deep {
    li {
      &:first-child {
        margin-right: 20px;
      }
      &:last-child {
        margin-left: 20px;
      }
    }
    .v-pagination__navigation {
      background: transparent;
      box-shadow: none;
      width: 20px;
      height: 20px;
      margin: 0;
      color: var(--primary_button);
    }
    .v-icon {
      color: var(--primary_button);
    }
    .v-pagination__item {
      height: 20px;
      min-width: 20px;
      font-size: 11px;
      line-height: 1;
      margin: 0 2px;
      padding: 0;
      background: transparent;
      color: var(--main_text);
      box-shadow: none;
      &--active {
        color: white;
      }
    }
    .v-pagination__more {
      width: 20px;
      height: 20px;
      margin: 0 2px;
      padding: 0;
      color: var(--main_text);
    }
  }
  //&__select ::v-deep {
  //  width: 58px;
  //  height: 20px;
  //  .v-text-field__details {
  //    display: none;
  //  }
  //  .v-input__slot {
  //    min-height: 20px !important;
  //    padding: 0 8px !important;
  //    font-size: 11px;
  //    line-height: 1;
  //  }
  //  .v-select__selections {
  //    line-height: 1;
  //    max-height: 20px;
  //    padding: 0 !important;
  //    input {
  //      max-height: 20px !important;
  //      padding: 0 !important;
  //    }
  //  }
  //  .v-select__selection--comma {
  //    margin: 0 !important;
  //  }
  //  .v-input__control {
  //    height: inherit;
  //  }
  //  // Icon
  //  .v-input__append-inner {
  //    margin-top: 0 !important;
  //    width: 12px;
  //    height: 12px;
  //  }
  //  .v-icon__svg {
  //    width: 12px;
  //    height: 12px;
  //  }
  //  .v-input__icon {
  //    width: 12px;
  //    height: 12px;
  //  }
  //}
}
</style>
