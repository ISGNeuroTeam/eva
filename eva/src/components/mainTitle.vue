<template>
  <v-app
    class="application"
    :style="{ background: theme.$secondary_bg }"
  >
    <dash-panel-bord
      v-if="prepared"
      :horizontal-cell="horizontalCell"
      :id-dash-from="idDash"
      @changeMode="changeMode"
      @openProfile="
        (event) => {
          openProfile = event;
        }
      "
      @openSettings="openSettings"
      @downloadData="exportDataCSV"
    />
    <div class="body-block">
      <v-card
        v-if="alreadyShow"
        class="already-block"
        :style="{ color: theme.$main_text, background: theme.$main_bg }"
      >
        <div class="text-already">
          Существует более новая версия дашборда. Хотите обновить?
        </div>
        <div class="btn-already">
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="updateDash"
          >
            Да
          </v-btn>
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="alreadyShow = false"
          >
            Нет
          </v-btn>
        </div>
      </v-card>
      <v-main id="content">
        <v-progress-circular
          v-if="!prepared"
          class="loading-circle"
          :size="100"
          :width="8"
          :color="theme.$primary_button"
          indeterminate
        />
        <v-container
          v-else
          class="dash-container"
        >
          <div
            v-if="gridShow"
            class="overlay-grid"
            :data-grid="true"
            :style="{
              background: `linear-gradient(-90deg, ${theme.$main_text} 1px, transparent 1px)
                repeat scroll 0% 0% / ${verticalCell}px ${verticalCell}px,
                rgba(0, 0, 0, 0) linear-gradient(${theme.$main_text} 1px, transparent 1px)
                repeat scroll 0% 0% / ${horizontalCell}px ${horizontalCell}px`,
            }"
          />
          <move-able
            v-for="elem in elements"
            :key="hash(elem.elem)"
            :data-mode-from="mode"
            :id-dash-from="idDash"
            :data-elem="elem.elem"
            :data-page-from="page"
            :horizontal-cell="horizontalCell"
            :vertical-cell="verticalCell"
            :search-data="getElementData(elem)"
            :data-sourse-title="elem.search"
            :loading="checkLoading(elem)"
            @downloadData="exportDataCSV"
            @SetRange="setRange($event, elem)"
            @ResetRange="resetRange($event)"
          />
          <modal-delete
            :color-from="theme"
            :id-dash-from="idDash"
            :data-page-from="page"
          />
          <modal-search
            :color-from="theme"
            :id-dash-from="idDash"
          />
          <modal-settings
            v-if="activeSettingModal"
            :color-from="theme"
            :id-dash-from="idDash"
          />
        </v-container>
      </v-main>
    </div>
    <div
      v-show="showTabs"
      class="tab-panel-wrapper"
    >
      <v-tooltip
        top
        :color="theme.$accent_ui_color"
      >
        <template v-slot:activator="{ on }">
          <div
            v-show="leftDots"
            class="dots"
            v-on="on"
            @click="moveScroll(0)"
          >
            ...
          </div>
        </template>
        <span>В начало</span>
      </v-tooltip>
      <div
        ref="tab-panel"
        class="tab-panel"
      >
        <div
          v-for="(tab, tabIndex) in tabs"
          :key="tab.id"
          :class="{
            active: currentTab === tab.id,
            'edit-mode-tab': mode,
            hover: tab.id === hoveredTabID,
          }"
          class="tab-item"
          @click="clickTab(tab.id)"
          @mouseover="tabOver(tab.id)"
          @mouseleave="tabLeave(tab.id)"
        >
          <div
            v-if="tab.id !== editableTabID"
            style="height: 40px"
          >
            <div class="tab-title">
              {{ tab.name }}
            </div>
            <svg
              v-if="mode"
              class="edit-icon"
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click.stop="enterEditMode(tab)"
            >
              <path
                d="M1.57833 11.0044C1.41469 11.0041 1.2587 10.9351 1.14841 10.8142C1.03609
                 10.6943 0.980275 10.5322 0.994996 10.3686L1.13791 8.79705L7.74008
                 2.19722L9.80333 4.25988L3.20291 10.8591L1.63141 11.0021C1.61333 11.0038
                 1.59525 11.0044 1.57833 11.0044ZM10.2152 3.84747L8.1525 1.7848L9.38975
                 0.547549C9.49916 0.438012 9.64763 0.376465 9.80246 0.376465C9.95728
                 0.376465 10.1057 0.438012 10.2152 0.547549L11.4524 1.7848C11.562 1.89421
                 11.6235 2.04269 11.6235 2.19751C11.6235 2.35233 11.562 2.5008 11.4524
                 2.61022L10.2157 3.84688L10.2152 3.84747Z"
                :fill="theme.$main_border"
              />
            </svg>
            <svg
              v-if="mode && tabsMoreOne"
              class="delete-cross"
              width="13"
              height="13"
              viewBox="0 0 8 8"
              xmlns="http://www.w3.org/2000/svg"
              @click.stop="confirmDeleteTab(tabIndex)"
            >
              <path
                d="M4 4.94286L1.17157 7.77129L0.228763 6.82848L3.05719
                 4.00005L0.228763 1.17163L1.17157 0.228817L4 3.05724L6.82843
                 0.228817L7.77124 1.17163L4.94281 4.00005L7.77124 6.82848L6.82843
                 7.77129L4 4.94286Z"
                :fill="theme.$main_border"
              />
            </svg>
          </div>
          <div v-else>
            <input
              v-model="tempName"
              class="tab-name-input"
              type="text"
              @keypress.enter="editTabName"
            >
            <svg
              id="submit-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click.stop.prevent="editTabName"
            >
              <path
                d="M7.9375 14.7142L3.8125 10.5892L4.99083 9.41089L7.93875
                 12.3555L7.9375 12.3567L15.0083 5.28589L16.1867 6.46422L9.11583
                 13.5359L7.93833 14.7134L7.9375 14.7142Z"
                :fill="theme.$main_border"
              />
            </svg>
          </div>
        </div>
      </div>
      <v-tooltip
        top
        :color="theme.$accent_ui_color"
      >
        <template v-slot:activator="{ on }">
          <div
            v-show="rightDots"
            class="dots"
            v-on="on"
            @click="moveScroll($refs['tab-panel'].scrollWidth)"
          >
            ...
          </div>
        </template>
        <span>В конец</span>
      </v-tooltip>
      <div
        v-if="mode"
        id="plus-icon"
        @click="addNewTab"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 8V14H6V8H0V6H6V0H8V6H14V8H8Z"
            :fill="theme.$main_border"
          />
        </svg>
      </div>
    </div>
    <modal-confirm
      v-model="isConfirmModal"
      :theme="theme"
      :modal-text="modalText"
      btn-confirm-text="Удалить"
      btn-cancel-text="Отмена"
      @result="deleteTab"
    />
  </v-app>
</template>

<script>
export default {
  name: 'MainTitle',
  data() {
    return {
      page: 'dash',
      mode: process.env.VUE_APP_DASHBOARD_EDITING_MODE === 'true',
      showSetting: false,
      rotate: '',
      openProfile: false,
      alreadyDash: {},
      alreadyShow: false,
      letElements: false,
      prepared: false,
      colorChange: false,
      deltaHorizontal: 0, // сколько надо увеличить высоту overlay-grid,по первое знач-500,
      startClientHeight: 0,
      startClientWidth: 0,
      verticalCell: 0,
      horizontalCell: 0,
      tabEditMode: false,
      tempName: '',
      editableTabID: 0,
      hoveredTabID: 0,
      loadingDash: true,
      dataObject: {},
      dataObjectConst: {},
      firstLoad: true,
      leftDots: true,
      rightDots: true,
      zoomedSearch: [],
      isConfirmModal: false,
      deleteTabId: '',
      deleteTabName: '',
    };
  },
  computed: {
    modalText() {
      return `Вы точно хотите удалить вкладку - <strong>${this.deleteTabName ? this.deleteTabName : this.deleteTabId}</strong> ?`;
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    // получаем объект с настройками моадлки натсроек
    getModalSettings() {
      if (!this.dashFromStore || !this.dashFromStore.modalSettings) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'modalSettings',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.modalSettings,
            prop: 'element',
            value: '',
          },
          {
            object: this.dashFromStore.modalSettings,
            prop: 'status',
            value: false,
          },
        ]);
      }
      return this.dashFromStore.modalSettings;
    },
    activeSettingModal: {
      get() {
        return this.getModalSettings.status;
      },
      set(value) {
        this.$store.dispatch('closeModalSettings', {
          path: this.idDash,
          status: value,
        });
      },
    },
    idDash() {
      // получаем id страницы от родителя
      return this.$route.params.id;
    },
    elements() {
      // получаем название элемента  от родителя
      // return this.loadingDash
      //   ? []
      //   : this.$store.getters.getElementsWithSearches(this.idDash);

      if (this.loadingDash || !this.dashFromStore?.elements) {
        return [];
      }
      return this.dashFromStore.elements
        .filter(
          (elem) => this.dashFromStore[elem].tab
                === this.dashFromStore.currentTab
                || this.dashFromStore[elem].options.pinned,
        )
        .map((elem) => ({ elem, search: this.dashFromStore[elem].search }));
    },
    headerTop() {
      return 0;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    gridShow() {
      if (this.loadingDash || !this.$store.state[this.idDash].grid) {
        return false;
      }
      return this.$store.state[this.idDash].gridShow === 'true';
    },
    getSizeGrid() {
      if (this.loadingDash || !this.$store.state[this.idDash].grid) {
        return { hor: '18', vert: '32' };
      }
      return this.$store.state[this.idDash].grid;
    },
    tabs() {
      if (this.loadingDash || !this.$store.state[this.idDash].tabList) {
        return [];
      }
      return this.$store.state[this.idDash].tabList;
    },
    tabsMoreOne() {
      return this.tabs.length > 1;
    },
    showTabs() {
      if (this.loadingDash || !this.$store.state[this.idDash].tabs) {
        return false;
      }
      return this.$store.state[this.idDash].tabs;
    },
    currentTab() {
      if (this.loadingDash || !this.$store.state[this.idDash].currentTab) {
        return 0;
      }
      return this.$store.state[this.idDash].currentTab;
    },
    searches() {
      if (this.loadingDash) {
        return [];
      }
      if (!this.$store.state[this.idDash].searches) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'searches',
          value: [],
        }]);
      }
      return this.$store.state[this.idDash].searches;
    },
    tokens() {
      if (this.loadingDash || !this.$store.state[this.idDash].tockens) {
        return [];
      }
      return this.$store.state[this.idDash].tockens;
    },
    getGrid() {
      return this.$store.state[this.idDash]?.grid || {
        vert: 32,
        hor: 18,
      };
    },
  },
  watch: {
    getSizeGrid() {
      this.calcSizeCell();
    },
    mode() {
      if (!this.mode) {
        this.editableTabID = 0;
        this.tempName = '';
        this.tabEditMode = false;
      }
    },
    searches: {
      deep: true,
      handler(searches) {
        if (this.firstLoad) {
          searches.forEach((search) => {
            this.$set(this.dataObject, search.sid, { data: [], loading: true });
            this.$set(this.dataObjectConst, search.sid, {
              data: [],
              loading: true,
            });
          });
          this.firstLoad = false;
        }
        searches.forEach((search) => {
          if (search.status === 'empty') {
            this.$set(this.dataObject, search.sid, { data: [], loading: true });
            this.$set(this.dataObjectConst, search.sid, {
              data: [],
              loading: true,
            });
            this.$store.commit('updateSearchStatus', {
              idDash: this.idDash,
              sid: search.sid,
              status: 'pending',
            });
            this.$store.dispatch('getDataApi', { search, idDash: this.idDash })
              .then((res) => {
                if (res?.length === 0) {
                  this.$store.commit('setState', [{
                    object: this.$store.state,
                    prop: 'logError',
                    value: true,
                  }]);
                }
                this.$store.commit('updateSearchStatus', {
                  idDash: this.idDash,
                  sid: search.sid,
                  status: res.length ? 'downloaded' : 'nodata',
                });
                this.$set(this.dataObject[search.sid], 'data', res);
                this.$set(this.dataObject[search.sid], 'loading', false);
                this.$set(this.dataObjectConst[search.sid], 'data', res);
                this.$set(this.dataObjectConst[search.sid], 'loading', false);
              });
          }
        });
      },
    },
  },
  async mounted() {
    await this.checkAlreadyDash();
    this.loadingDash = false;
    document.title = `EVA | ${this.$store.state[this.idDash].name}`;
    if (this.$route.params.tabId) {
      this.clickTab(Number(this.$route.params.tabId));
    }
    this.createStartClient();
    this.calcSizeCell();
    this.addScrollListener();

    this.$refs['tab-panel'].onwheel = this.scroll;
    this.checkTabOverflow();
    window.onresize = this.checkTabOverflow;
  },
  methods: {
    exportDataCSV(searchName) {
      const searchData = this.dataObject[searchName].data;
      // задаем кодировку csv файла
      let csvContent = 'data:text/csv;charset=utf-8,';

      if (searchData.length) {
        // получаем ключи для заголовков столбцов
        const keys = Object.keys(searchData[0]);
        // добавляем ключи в файл
        csvContent += encodeURIComponent(`${keys.join(',')}\n`);
      }
      csvContent += encodeURIComponent(
        searchData.map((item) => Object.values(item).join(',')).join('\n'),
      );

      // создаем ссылку
      const link = document.createElement('a');
      // указываем ссылке что надо скачать наш файл csv
      link.setAttribute('href', csvContent);
      // указываем имя файла
      link.setAttribute('download', `${this.idDash}-${searchName}.csv`);
      // жмем на скачку
      link.click();
      // удаляем ссылку
      link.remove();
    },
    scroll(event) {
      event.preventDefault();
      this.$refs['tab-panel'].scrollLeft = this.$refs['tab-panel'].scrollLeft - event.wheelDeltaY;
      this.checkTabOverflow();
    },
    moveScroll(value) {
      this.$refs['tab-panel'].scrollLeft = value;
      this.checkTabOverflow();
    },
    checkTabOverflow() {
      setTimeout(() => {
        const { clientWidth, scrollWidth, scrollLeft } = this.$refs['tab-panel'];
        this.leftDots = scrollLeft > 0;
        if (clientWidth < scrollWidth) {
          this.rightDots = clientWidth + scrollLeft < scrollWidth + 5
            && clientWidth + scrollLeft < scrollWidth - 5;
        } else {
          this.rightDots = false;
        }
      }, 0);
    },
    checkLoading(elem) {
      if (elem.search === -1) return false;
      return this.dataObject[elem.search]?.loading;
    },
    getElementData(elem) {
      if (elem.search === -1) return [];
      return this.dataObject[elem.search]?.data;
    },
    clickTab(tabID) {
      if (!this.tabEditMode) {
        this.$store.commit('changeCurrentTab', {
          idDash: this.idDash,
          tab: this.tabs.find((tab) => tabID === tab.id) ? tabID : 1,
        });
      }
    },
    addNewTab() {
      if (!this.tabEditMode) {
        const tabID = this.tabs?.length > 0
          ? [...this.tabs].sort((a, b) => b.id - a.id)[0].id + 1
          : 1;
        this.$store.commit('addNewTab', {
          idDash: this.idDash,
          tabID,
          tabName: 'Без названия',
        });
      }
      this.checkTabOverflow();
    },
    confirmDeleteTab(tabIndex) {
      this.deleteTabName = '';
      this.deleteTabId = '';
      this.deleteTabId = this.tabs[tabIndex].id;
      if (this.tabs[tabIndex].name !== '' && this.tabs[tabIndex].name !== 'Без названия') {
        this.deleteTabName = this.tabs[tabIndex].name;
      } else {
        this.deleteTabName = '';
      }
      this.isConfirmModal = true;
    },
    deleteTab(isConfirm) {
      if (isConfirm) {
        if (this.tabsMoreOne && !this.tabEditMode) {
          this.$store.commit('deleteDashTab', { idDash: this.idDash, tabID: this.deleteTabId });
        }
        this.checkTabOverflow();
      }
    },
    enterEditMode(tab) {
      if (!this.tabEditMode && !this.editableTabID) {
        this.tabEditMode = true;
        this.editableTabID = tab.id;
        this.tempName = tab.name;
      }
      this.checkTabOverflow();
    },
    editTabName() {
      if (this.tempName) {
        this.$store.commit('editTabName', {
          idDash: this.idDash,
          tabID: this.editableTabID,
          newName: this.tempName,
        });
        this.tabEditMode = false;
        this.editableTabID = 0;
        this.tempName = '';
      }
    },
    tabOver(tabID) {
      this.hoveredTabID = tabID;
    },
    tabLeave() {
      this.hoveredTabID = 0;
    },
    hash(elem) {
      return `${elem}#${this.idDash}`;
    },
    changeMode() {
      this.mode = !this.mode;
    },
    openSettings() {
      this.showSetting = !this.showSetting;
    },
    updateDash() {
      this.$store.commit('updateDash', {
        dash: this.alreadyDash,
        modified: this.alreadyDash.modified,
      });
      this.$store.dispatch(
        'auth/putLog',
        `Обновлен дашборд ${this.toHichName(this.alreadyDash?.name)} с id ${
          this.alreadyDash.id
        }`,
      );
      this.alreadyShow = false;
    },
    toHichName(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    async checkAlreadyDash() {
      const response = await this.$store.dispatch(
        'checkAlreadyDash',
        { id: this.$route.params.id },
      );
      if (response.status === 'exist') {
        this.alreadyShow = true;
        this.alreadyDash = response;
        this.$store.commit('changeDashboard', {
          data: response,
        });
      }
      this.prepared = true;
    },
    createStartClient() {
      // первоначальные значения высоты и ширины
      this.startClientHeight = document.body.clientHeight - this.headerTop;
      this.startClientWidth = document.body.clientWidth;
    },
    calcSizeCell() {
      this.verticalCell = Number(
        (this.startClientWidth / this.getGrid.vert).toFixed(1),
      );
      this.horizontalCell = Number(
        (this.startClientHeight / this.getGrid.hor).toFixed(1),
      );
    },
    addScrollListener() {
      let offset = 0;
      window.addEventListener('scroll', () => {
        // при увеличении экрана в высоту (вообще коненчо срабатывает при скролле страницы)
        if (document.querySelector('.application')) {
          if (document.body.scrollHeight > document.body.clientHeight) {
            // если высота скролируемого экрана больше чем клиентского
            // добавляем размер
            offset = this.horizontalCell;
          } else {
            offset = 0;
            // просто сработало событие
          }

          document.querySelector('.application').style.height = `${
            document.body.scrollHeight + offset
          }px`; // в любом случае расширяем контейнер до размеров экрана
        }
      });
    },
    sliceRange(arr, range) {
      return arr.filter((item, idx) => {
        if (
          (item[range.xMetric] >= range.range[0]
            && item[range.xMetric] <= range.range[1])
          || (arr[idx - 1]?.[range.xMetric] >= range.range[0]
            && arr[idx - 1]?.[range.xMetric] <= range.range[1])
          || (arr[idx + 1]?.[range.xMetric] >= range.range[0]
            && arr[idx + 1]?.[range.xMetric] <= range.range[1])
        ) {
          return true;
        }

        const idxArrFirst = range.range[0] > range.range[1] ? idx + 1 : idx - 1;
        const idxArrSecond = range.range[0] > range.range[1] ? idx - 1 : idx + 1;

        return (item[range.xMetric] <= range.range[0]
            && arr[idxArrFirst]?.[range.xMetric] >= range.range[1])
          || (item[range.xMetric] >= range.range[1]
            && arr[idxArrSecond]?.[range.xMetric] <= range.range[0]);
      });
    },
    setRange(range, elem) {
      if (range.zoomForAll && !this.zoomedSearch.includes(elem.search)) {
        this.zoomedSearch.push(elem.search);
      }
      const elements = range.zoomForAll ? this.elements : [elem];
      elements.forEach((element) => {
        this.dataObject[element.search].data = this.sliceRange(
          this.dataObject[element.search].data,
          range,
        );
      });
    },
    resetRange(dataSourseTitle) {
      let elements = [];
      if (this.zoomedSearch.includes(dataSourseTitle)) {
        elements = this.elements;
        this.zoomedSearch.splice(this.zoomedSearch.indexOf(dataSourseTitle), 1);
      } else {
        elements.push({ search: dataSourseTitle });
      }
      elements.forEach((elem) => {
        this.dataObject[elem.search].data = this.dataObjectConst[elem.search].data;
      });
    },
  },
};
</script>

<style lang="scss">
@import '../sass/mainTitle.sass';
</style>
