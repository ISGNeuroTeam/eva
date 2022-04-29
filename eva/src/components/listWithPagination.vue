<template>
  <div class="interesting-fields-popup">
    <div class="interesting-fields-popup__title">
      {{ title }}
    </div>
    <div class="interesting-fields-popup__table">
      <v-data-table
        :style="{
          backgroundColor: theme.$main_bg,
          color: theme.$main_text,
        }"
        disable-pagination
        hide-default-footer
        :headers="tableHead"
        :items="filteredItems[currentPage - 1]"
      >
        <template v-slot:item="slotProps">
          <tr>
            <template v-for="(col) in slotProps.headers">
              <td :key="`${col.value}${slotProps.item.value}`">
                <div class="interesting-fields-popup__item">
                  {{ slotProps.item[col.value] }}
                </div>
              </td>
            </template>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div class="interesting-fields-popup__footer">
      <div class="interesting-fields-popup__pagination">
        <v-pagination
          v-if="filteredItems.length > 1"
          ref="pagination"
          v-model="currentPage"
          :length="filteredItems.length"
          :total-visible="10"
        />
      </div>
      <div class="interesting-fields-popup__flex-wrapper">
        <div class="interesting-fields-popup__select">
          <v-select
            v-model="rowsPerPage"
            :items="rowsPerPageVariants"
            dense
            :menu-props="{
              'content-class': 'interesting-fields-popup__menu',
              'nudge-top': 20,
              'offset-y': true,
              top: true,
            }"
            height="20px"
            outlined
          >
            <template #append>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M6.00012 7.85648L9.00512 4.85148L8.29862
                  4.14398L6.00012 6.44398L3.70212
                  4.14398L2.99512 4.85098L6.00012 7.85648Z"
                  fill="currentColor"
                />
              </svg>
            </template>
          </v-select>
        </div>
        <div class="interesting-fields-popup__counter">
          {{ itemsCount }}
        </div>
      </div>
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
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      test: {
        item: {
          value: 'т.вр.к5',
          count: 5,
          '%': 0.5,
        },
        index: 0,
        isSelected: false,
        isExpanded: false,
        isMobile: false,
        headers: [
          {
            text: 'Значение',
            value: 'value',
          },
          {
            text: 'Количество',
            value: 'count',
          },
          {
            text: 'Процент',
            value: '%',
          },
        ],
      },
      currentPage: 1,
      rowsPerPage: 10,
      tableHead: [
        { text: 'Значение', value: 'value' },
        { text: 'Количество', value: 'count' },
        { text: 'Процент', value: '%' },
      ],
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
      ],
    };
  },
  computed: {
    itemsCount() {
      const start = (this.currentPage * this.rowsPerPage - this.rowsPerPage) || 1;
      const end = start + this.filteredItems[this.currentPage - 1].length;
      return `Результаты: ${start} – ${start === 1 ? end - 1 : end} из ${this.listItems.length}`;
    },
    filteredItems() {
      const result = [];
      let group = [];
      if (this.listItems?.length > 0) {
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
      }
      return result;
    },
  },
  watch: {
    rowsPerPage() {
      this.currentPage = 1;
    },
  },
};
</script>

<style lang="scss" scoped>

.interesting-fields-popup {
  padding: 8px 0;
  min-height: 310px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  &__title {
    padding: 0 8px;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: var(--main_text);
    margin-bottom: 8px;
  }
  &__footer {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  &__flex-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
  }
  &__counter {
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    color: var(--main_text);
  }
  &__t-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 100%;
    max-height: 100%;
  }
  &__t-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: nowrap;
    max-width: 100%;
  }
  &__t-col {
    &:nth-child(1) {
      width: 20% !important;
    }
    &:nth-child(2) {
      width: 40%;
    }
    &:nth-child(3) {
      width: 40%;
    }
  }
  &__item {
    max-height: 27px;
    overflow: hidden;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  // Далее правки стилей vuetify
  &__table ::v-deep {
    margin-bottom: 8px;
    .v-data-table {
      .v-data-table-header {
        th {
          color: var(--main_text) !important;
          padding: 2px 8px !important;
          height: 15px !important;
          border-bottom: none !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          line-height: 15px !important;
        }
        tr {
          &:hover {
            background-color: var(--accent_ui_color) !important;
            th {
              color: var(--main_bg) !important;
            }
          }
        }
      }
      &__wrapper {
        table {
          table-layout: fixed;
          tr {
            & > td {
              padding: 2px 8px !important;
              font-weight: 400;
              font-size: 12px;
              line-height: 15px;
              border-bottom: none !important;
              background-color: transparent !important;
              height: 34px;
              max-height: 34px;
            }
            &:hover,
            &:active,
            &:focus {
              color: var(--main_bg);
              background-color: var(--accent_ui_color) !important;
            }
          }
        }
      }
    }
  }
  &__pagination ::v-deep {
    // Костыль
    margin-left: -90px;
    margin-right: -90px;
    margin-bottom: 16px;
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
        background: var(--primary_button);
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
  &__select ::v-deep {
    .v-select {
      flex-grow: 0;
      width: 58px;
      height: 20px;
      background-color: var(--secondary_bg);
      border-color: var(--main_border) !important;
      &__selections {
        line-height: 1;
        max-height: 20px;
        padding: 0 !important;
        input {
          max-height: 20px !important;
          padding: 0 !important;
        }
      }
      &--is-menu-active {
        .v-input__append-inner {
          svg {
            transform: rotate(180deg);
          }
        }
      }
    }
    .v-text-field__details {
      display: none;
    }
    .v-input__slot {
      min-height: 20px !important;
      padding: 0 8px !important;
      font-size: 11px;
      line-height: 1;
    }
    .v-select__selection--comma {
      margin: 0 !important;
    }
    .v-input__control {
      height: inherit;
    }
    // Icon
    .v-input__append-inner {
      margin-top: 0 !important;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
        transition: all .2s ease;
        color: var(--accent_ui_color) !important;
      }
    }
    .v-icon__svg {
      width: 12px;
      height: 12px;
    }
    .v-input__icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>

<style lang="scss">
.interesting-fields-popup__menu {
  .v-list {
    padding: 0;
  }
  .v-list-item {
    min-height: 20px !important;
  }
}
</style>
