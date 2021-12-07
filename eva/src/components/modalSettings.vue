<template>
  <v-dialog
    v-model="active"
    width="1140"
    @keydown="checkEsc($event)"
    @click:outside="cancelModal"
  >
    <div class="settings-modal-block">
      <v-card :style="{background:theme.$main_bg}">
        <v-card-text class="headline">
          <div
            class="settings-title"
            :style="{color:theme.$title,borderColor:theme.$main_border}"
          >
            Настройки
            <p>{{ element }}</p>
          </div>
        </v-card-text>
        <div
          ref="options"
          class="options-block"
        >
          <div class="option-item">
            <v-switch
              v-model="openNewScreen"
              class="switch"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text}"
              label="Открыть в новой вкладке"
            />
          </div>
          <div class="option-item">
            <div
              class="name-option main item"
              :style="{color:theme.$title, borderBottom: `1px solid ${theme.$main_border}`}"
            >
              Название
            </div>
            <div
              class="discribe-option main item"
              :style="{color:theme.$title, borderBottom: `1px solid ${theme.$main_border}`}"
            >
              Описание
            </div>
            <div
              class="status-option main item"
              :style="{color:theme.$title, borderBottom: `1px solid ${theme.$main_border}`}"
            >
              Статус
            </div>
          </div>
          <div
            v-if="checkOptions('visible')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              visible
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Показывает / скрывает элемент
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.visible"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.visible)"
              />
            </div>
          </div>
          <div
            v-if="checkOptions('level')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              level
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Установить слой отображения элемента
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.level"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('boxShadow')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              boxShadow
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Добавляет / удаляет тень
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.boxShadow"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text,}"
                :label="String(options.boxShadow)"
              />
            </div>
          </div>
          <!-- start lastResult-->
          <div
            v-if="checkOptions('lastResult')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              lastResult
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Вывод предыдущих результатов
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.lastResult"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.lastResult)"
              />
            </div>
          </div>
          <!-- end lastResult-->
          <!-- start searchBtn-->
          <div
            v-if="checkOptions('searchBtn')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              searchBtn
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Показывать кнопку поиска
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.searchBtn"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.searchBtn)"
              />
            </div>
          </div>
          <!-- end searchBtn-->
          <!-- start osmserver-->
          <div
            v-if="checkOptions('osmserver')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              osmserver
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Сервер для набора tile Пример:
              http://192.168.4.209/osm/{z}/{x}/{y}.png
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.osmserver"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <!-- end osmserver-->
          <!--start strokeWidth-->
          <div
            v-if="checkOptions('strokeWidth')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              strokeWidth
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Толщина линий
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.strokeWidth"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <!--end strokeWidth-->
          <!--start thememultiline-->
          <div
            v-if="checkOptions('thememultiline')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              thememultiline
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Цветовая тема
            </div>
            <div class="status-option item">
              <v-select
                v-model="options.thememultiline"
                :items="['default','Anna theme']"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="subnumber"
              />
            </div>
          </div>
          <!--end thememultiline-->
          <div
            v-if="checkOptions('subnumber')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              subnumber
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выводит дополнительную надпись под числом
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.subnumber"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('rowcolor')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              rowcolor
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать цвет которым подсветится нужная строка
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.rowcolor"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('columncolor')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              columncolor
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать цвет которым подсветится нужный столбец
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.columncolor"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('cellcolor')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              cellcolor
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать цвет которым подсветится нужная ячейка
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.cellcolor"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('color')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              color
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать цвет значения
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.color"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('backgroundcolor')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              backgroundcolor
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать цвет фона
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.backgroundcolor"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('name')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              name
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать название кнопки
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.name"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('titles')"
            class="option-item"
          >
            <v-container fluid>
              <v-card-text
              class="headline"
            >
              <div
                class="settings-title"
                :style="{color:theme.$main_text,borderColor:theme.$main_border}"
              >
                Столбцы для отображение
              </div>
            </v-card-text>
              <v-checkbox
                v-for="(setting) in getAvailableTableTitles(idDash, element)"
                :key="setting"
                :input-value="tableTitles"
                :style="{color:theme.$main_text}"
                :label="setting"
                :value="setting"
                @change="titleHandler($event)">
              </v-checkbox>
            </v-container>

          </div>

          <div
            v-if="checkOptions('dataFormat')"
            class="option-item"
            :style="{color:theme.$main_text,borderColor:theme.$main_border}"
          >
            <v-container fluid>
              <v-card-text
              class="headline"
            >
              <div
                class="settings-title"
                :style="{color:theme.$main_text,borderColor:theme.$main_border}"
              >
                Формат данных
              </div>
            </v-card-text>
              <v-row :style="{color:theme.$main_text}" >
                <v-col col="4">
                  <v-select v-model="x" label="x:" :items="tableTitles" />
                </v-col>
                <v-col col="4">
                   <v-select v-model="xFormat" :items="dataFormat" />
                </v-col>
                <v-col col="4">
                   <v-select v-model="xSort" :items="sortType" />
                </v-col>
              </v-row>
              <v-row :style="{color:theme.$main_text}" >
                <v-col col="4">
                  <v-select v-model="y" label="y:" :items="tableTitles" />
                </v-col>
                <v-col col="4">
                   <v-select v-model="yFormat" :items="dataFormat" />
                </v-col>
                <v-col col="4">
                   <v-select v-model="ySort" :items="sortType" />
                </v-col>
              </v-row>
              <v-row :style="{color:theme.$main_text}" ><v-select v-model="data" label="data:" :items="tableTitles" /> </v-row>
              <v-row :style="{color:theme.$main_text}" ><v-select v-model="metadata" label="metadata:" :items="tableTitles" /> </v-row>
              <v-row :style="{color:theme.$main_text}" ><v-select v-model="detailValue" label="Поле для ссылки Детали:" :items="tableTitles" /> </v-row>
            </v-container>

          </div>

          <div
            v-if="checkOptions('timeFormat')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              timeFormat
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать формат даты и времени
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.timeFormat"
                clearable
                placeholder="%Y-%m-%d %H:%M:%S"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('widthTile')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              widthTile
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Введите ширину плитки
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.widthTile"
                clearable
                placeholder="100"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('heightTile')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              heightTile
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Введите высоту плитки
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.heightTile"
                clearable
                placeholder="100"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('fontSize')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              fontSize
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Выбрать размер шрифта
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.fontSize"
                clearable
                placeholder="30"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>
          <div
            v-if="checkOptions('underline')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              underline
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Подчеркивает текст кнопки
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.underline"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.underline)"
              />
            </div>
          </div>
          <div
            v-if="checkOptions('lastDot')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              lastDot
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Показывать последнее значение
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.lastDot"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.lastDot)"
              />
            </div>
          </div>
          <div
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              pinned
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Закрепить на всех вкладках
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.pinned"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.pinned)"
              />
            </div>
          </div>
          <div
            v-if="checkOptions('isDataAlwaysShow')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              isDataAlwaysShow
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Постоянное отображение данных на графике
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.isDataAlwaysShow"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.isDataAlwaysShow)"
              />
              <v-radio-group
                v-if="options.isDataAlwaysShow"
                v-model="options.isDataAlwaysShow"
                class="ml-10"
              >
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="data"
                  value="data"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="caption"
                  value="caption"
                />
              </v-radio-group>
            </div>
          </div>
          <div
            v-if="checkOptions('xAxisCaptionRotate')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              xAxisCaptionRotate
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Градус наклона подписей на оси X
            </div>
            <div class="status-option item">
              <v-radio-group
                v-model="options.xAxisCaptionRotate"
                :column="false"

              >
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="0"
                  :value="0"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  class="ml-2"
                  label="45"
                  :value="45"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  class="ml-2"
                  label="-45"
                  :value="-45"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  class="ml-2"
                  label="90"
                  :value="90"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  class="ml-2"
                  label="-90"
                  :value="-90"
                />
              </v-radio-group>
            </div>
          </div>
          <div
            v-if="checkOptions('barplotBarWidth')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              barplotBarWidth
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Ширина столбцов барплот-графика
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="options.barplotBarWidth"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, background: 'transparent', borderColor: theme.$main_border }"
                class="subnumber"
                type="number"
                min="0"
                outlined
                hide-details
              />
            </div>
          </div>
          <div
              v-if="checkOptions('stringOX')"
              class="option-item"
          >
            <div
                class="name-option item"
                :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              stringOX
            </div>
            <div
                class="discribe-option item"
                :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Ось X - строки
            </div>
            <div class="status-option item">
              <v-switch
                  v-model="options.stringOX"
                  class="switch"
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  :label="String(options.stringOX)"
              />
            </div>
          </div>
          <div
            v-if="checkOptions('united')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              united
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Отображать ли все метрики на одной плоскости координат
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.united"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.united)"
              />
            </div>
          </div>

          <div
              v-if="options.united && checkOptions('united')"
              class="option-item"
          >
            <div
                class="name-option item"
                :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              barplotstyle
            </div>
            <div
                class="discribe-option item"
                :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Стиль столбцов
            </div>
            <div class="status-option item">
              <v-select
                  v-model="options.barplotstyle"
                  :items="barplotstyleOptions"
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text, fill: theme.$main_text}"
                  hide-details
                  outlined
                  class="subnumber"
              />
            </div>
          </div>

          <div
            v-if="!options.united"
            v-for="metric in metricsName"
            :key="metric.name"
            class="option-item"
          >
            <div

              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              {{ metric.name }} units
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Единицы измерения для линии {{ metric.name }}
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="metricUnits[metric.name]"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>

          <v-card-text
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="headline pa-0"
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Выбор типа графика
            </div>
          </v-card-text>

          <div
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="options-block united-block pa-0"
          >
            <div class="multiline-custom-opts">
              <div style="margin-left: 350px">
                <div
                  v-for="(metric, i) in Object.keys(multilineYAxesBinding.metricTypes)"
                  :key="`metric-${i}`"
                  class="d-flex pb-3"
                >
                  <span :style="{ color: theme.$main_text }">
                    Тип графика
                    <span :style="{ color: theme.$accent_ui_color }" v-text="metric"/>:
                  </span>
                  <v-radio-group
                    v-model="multilineYAxesBinding.metricTypes[metric]"
                    hide-details
                    :column="false"
                    class="ma-0 ml-5"
                  >
                    <v-radio
                      :color="theme.$primary_button"
                      :style="{ color:theme.$main_text }"
                      label="Линейный"
                      :value="'linechart'"
                    />
                    <v-radio
                      :color="theme.$primary_button"
                      :style="{ color:theme.$main_text }"
                      class="ml-2"
                      label="Столбчатый"
                      :value="'barplot'"
                    />
                  </v-radio-group>
                </div>
              </div>
            </div>
          </div>

          <v-card-text
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="headline pa-0"
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Привязка осей
            </div>
          </v-card-text>

          <div
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="options-block united-block pa-0"
          >
            <div class="d-flex multiline-custom-opts">
              <v-radio-group
                v-model="multilineYAxesBinding.axesCount"
                style="margin-left: 350px; margin-top: 0;"
              >
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="Одна ось"
                  :value="1"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="Две оси"
                  :value="2"
                />
              </v-radio-group>

              <div
                v-if="multilineYAxesBinding.axesCount === 2"
                style="margin-left: 50px"
              >
                <div
                  v-for="(metric, i) in Object.keys(multilineYAxesBinding.metrics)"
                  :key="`metric-${i}`"
                  class="pb-3"
                >
                  <div class="d-flex align-center">
                    <span :style="{ color: theme.$main_text }">
                      Привязка
                      <span :style="{ color: theme.$accent_ui_color }" v-text="metric"/>:
                    </span>
                    <v-radio-group
                      v-model="multilineYAxesBinding.metrics[metric]"
                      hide-details
                      :column="false"
                      class="ma-0 ml-5"
                    >
                      <v-radio
                        :color="theme.$primary_button"
                        :style="{ color:theme.$main_text }"
                        label="Слева"
                        :value="'left'"
                      />
                      <v-radio
                        :color="theme.$primary_button"
                        :style="{ color:theme.$main_text }"
                        class="ml-2"
                        label="Справа"
                        :value="'right'"
                      />
                    </v-radio-group>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <v-card-text
            v-if="!options.united && checkOptions('united')"
            class="headline"
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Настройки режима United
            </div>
          </v-card-text>
          <div
            v-if="!options.united && checkOptions('united')"
            class="options-block united-block"
          >
            <v-icon
              v-if="metrics.length==0"
              class="icon-plus"
              :color="theme.$primary_button"
              @click="addMetrics"
            >
              {{ plus_icon }}
            </v-icon>
            <div
              v-for="i in metrics.length"
              :key="i"
              class="options-item-tooltip"
            >
              <v-select
                v-model="metrics[i-1].name"
                :items="metricsName.map(el => el.name)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                label="Имя метрики"
                @click="changeColor"
              />
              <v-select
                v-model="metrics[i-1].type"
                :items="types"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                label="Тип графика"
                @click="changeColor"
              />
              <v-text-field
                v-model="metrics[i-1].lowborder"
                clearable
                placeholder="0"
                label="Нижняя граница (ось Y)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                :disabled="metrics[i-1].manual"
                outlined
                class="item-metric border"
                hide-details
              />
              <v-text-field
                v-model="metrics[i-1].upborder"
                clearable
                placeholder="0"
                label="Верхняя граница (ось Y)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                :disabled="metrics[i-1].manual"
                outlined
                class="item-metric border"
                hide-details
              />
              <v-checkbox
                v-model="metrics[i-1].manual"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                class="item-metric checkbox"
                label="Автоматически/Вручную"
                hide-details
              />
              <v-icon
                class="icon-inside"
                :color="theme.$primary_button"
                @click="addMetrics"
              >
                {{ plus_icon }}
              </v-icon>
              <v-icon
                class="icon-inside"
                :color="theme.$primary_button"
                @click="deleteMetrics(i-1)"
              >
                {{ minus_icon }}
              </v-icon>
            </div>
          </div>
          <div
            v-if="checkOptions('multiple')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              multiple
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Возможность выбора нескольких значений
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.multiple"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.multiple)"
              />
            </div>
          </div>
          <div
            v-if="checkOptions('showlegend')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              showlegend
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Показывать ли легенду
            </div>
            <div class="status-option item">
              <v-switch
                v-model="options.showlegend"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options.showlegend)"
              />
            </div>
          </div>
          <div
            v-if="checkOptions('positionlegend')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              positionlegend
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Позиция легенды
            </div>
            <div class="status-option item">
              <v-select
                v-model="options.positionlegend"
                :items="['top','left','right','bottom']"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="subnumber"
                label="Позиция легенды"
                @click="changeColor"
              />
            </div>
          </div>

          <div
            v-if="checkOptions('primitivesLibrary')"
            class="option-item"
          >
            <v-container fluid>
              <v-card-text
              class="headline"
            >
              <div
                class="settings-title"
                :style="{color:theme.$main_text,borderColor:theme.$main_border}"
              >
                Библиотека примитивов отображения
              </div>
            </v-card-text>
              <v-btn
                plain link small
                class="mb-3 text-lowercase"
                :color="theme.$main_text"
                @click="primitivesLibraryAutoGrow = !primitivesLibraryAutoGrow">
                {{ primitivesLibraryAutoGrowLinkText }}
              </v-btn>
              <v-textarea
                v-model="options.primitivesLibrary"
                name="input-7-1"
                filled
                rows="6"
                label="JSON c примитивами"
                :auto-grow="primitivesLibraryAutoGrow"
                class="textarea-event"
                spellcheck="false"
                :color="theme.$main_text"
                :style="{ color: theme.$main_text }"
                outlined
                hide-details
              ></v-textarea>
              <v-btn
                  v-if="primitivesLibraryAutoGrow"
                  plain link small
                  class="text-lowercase"
                  :color="theme.$main_text"
                  @click="primitivesLibraryAutoGrow = !primitivesLibraryAutoGrow">
                {{ primitivesLibraryAutoGrowLinkText }}
              </v-btn>
            </v-container>
          </div>
          <v-card-text
            v-if="checkOptions('piechartSettings')"
            class="headline "
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Настройки круговой диаграммы
            </div>
          </v-card-text>
          <div
            v-if="checkOptions('piechartSettings')"
            ref="options"
            class="options-block"
          >
            <div
              class="divider-tooltip-setting"
              :style="{color:theme.$main_text}"
            >
              <p>Соотношение метрик</p>
              <div
                :style="{backgroundColor:theme.$main_text}"
                class="divider-line"
              />
            </div>
            <div
              class="options-item-tooltip"
            >
              <v-select
                v-for="(label, i) in metricsRelation.namesMetric"
                :key="i+'metric'"
                v-model="metricsRelation.relations[i]"
                :items="metricsRelation.metrics"
                :label="metricsRelation.namesMetric[i]"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                @click="changeColor"
              />
            </div>
            <div
              class="divider-tooltip-setting"
              :style="{color:theme.$main_text}"
            >
              <p>Цветовая схема</p>
              <div
                :style="{backgroundColor:theme.$main_text}"
                class="divider-line"
              />
            </div>
            <div
              class="options-item-tooltip"
            >
              <v-select
                v-model="colorsPie.theme"
                :items="themesArr"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                label="Выберите схему"
                @click="changeColor"
              />
              <v-text-field
                v-show="colorsPie.theme == 'custom'"
                v-model="colorsPie.nametheme"
                clearable
                placeholder="green"
                label="Имя новой схема"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="item-metric"
                hide-details
              />
              <v-text-field
                v-show="colorsPie.theme == 'custom'"
                v-model="colorsPie.colors"
                clearable
                placeholder="red,#5F27FF,rgb(95, 39, 255)"
                label="Новая схема"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="item-metric"
                hide-details
              />
            </div>
          </div>
        </div>
        <v-card-text
          v-if="tooltipSettingShow"
          class="headline "
        >
          <div
            class="settings-title"
            :style="{color:theme.$main_text,borderColor:theme.$main_border}"
          >
            Настройки tooltip
          </div>
        </v-card-text>
        <div
          v-if="tooltipSettingShow"
          ref="options"
          class="options-block"
        >
          <div
            class="divider-tooltip-setting"
            :style="{color:theme.$main_text}"
          >
            <p>Текст</p>
            <div
              :style="{backgroundColor:theme.$main_text}"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.texts.length==0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('text')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.texts.length"
            :key="i+'text'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.texts[i-1]"
              clearable
              placeholder="Введите текст tooltip"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-text"
              hide-details
            />
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="addIntoTooltip('text')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="deleteFromTooltip('text',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div
            class="divider-tooltip-setting"
            :style="{color:theme.$main_text}"
          >
            <p>Ссылка</p>
            <div
              :style="{backgroundColor:theme.$main_text}"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.links.length==0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('link')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.links.length"
            :key="i+'links'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.links[i-1].name"
              clearable
              placeholder="Введите название ссылки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-link"
              hide-details
            />
            <v-text-field
              v-model="tooltip.links[i-1].url"
              clearable
              placeholder="Введите текст ссылки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-link"
              hide-details
            />
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="addIntoTooltip('link')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="deleteFromTooltip('link',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div
            class="divider-tooltip-setting"
            :style="{color:theme.$main_text}"
          >
            <p>Кнопка</p>
            <div
              :style="{backgroundColor:theme.$main_text}"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.buttons.length==0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('button')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.buttons.length"
            :key="i+'button'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.buttons[i-1].name"
              clearable
              placeholder="Введите название кнопки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-button"
              hide-details
            />
            <v-text-field
              v-model="tooltip.buttons[i-1].id"
              clearable
              placeholder="Введите id кнопки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-button"
              hide-details
            />
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="addIntoTooltip('button')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="deleteFromTooltip('button',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
        </div>
        <v-card-actions class="actions-settings">
          <v-spacer />
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="setOptions"
          >
            Подтвердить
          </v-btn>
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="cancelModal"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>

import settings from '../js/componentsSettings.js'

import { mdiPlusBox, mdiMinusBox } from '@mdi/js'
import { mapGetters } from 'vuex';

export default {
  props: {
    idDashFrom: null,
  },
  data() {
    return {
      tableTitles:[],
      element: '',
      openNewScreen: false,
      primitivesLibraryAutoGrow: false,
      options: {
      },
      optionsItems: [],
      tooltipSettingShow: false,
      plus_icon: mdiPlusBox,
      minus_icon: mdiMinusBox,
      tooltip: {
        texts: [],
        links: [],
        buttons: [],
      },
      metricsRelation: {
        metrics: [],
        relations: [],
        namesMetric: ['Категория','Процентное соотношение']
      },
      colorsPie: {
        theme: 'neitral',
        colors: '',
        nametheme: ''
      },
      themesArr: [],
      themes: {},
      metrics: [],
      types: ['Line chart', 'Bar chart'],
      metricsName: [],
      multilineYAxesBinding: { axesCount: 1, metrics: {}, metricTypes: {} },
      multilineYAxesTypes: {},
      x: '',
      y: '',
      metadata: '',
      detailValue: '',
      data: '',
      xFormat: 'Строка',
      yFormat: 'Дата',
      xSort: 'По возрастанию',
      ySort: 'По возрастанию',
      dataFormat: [
        'Дата',
        'Строка',
        'Число',
      ],
      sortType: [
        "По возрастанию",
        "По убыванию"
      ],
      metricUnits: {},
      barplotstyleOptions: [
        {text:'разделенный', value:'divided'},
        {text:'наложенный', value:'overlay'},
        {text:'с накоплением', value:'accumulation'},
      ]
    }
  },
  computed: {
    active: function() {  // тут понимаем нужно ли открыть окно с созданием или нет
      if (this.$store.getters.getModalSettings(this.idDash).status){ // если окно должно быть открыто
        this.element = this.$store.getters.getModalSettings(this.idDash).element;  // получаем для каокго элемнета вывести настройки
        if (this.element.indexOf('csvg') != -1) {
          this.tooltipSettingShow = true;
        } else {
          this.tooltipSettingShow = false;
        }
        this.prepareOptions();  // и подготовливаем модалку на основе этого элемента
        this.metricsName = this.$store.getters.getMetricsMulti({idDash: this.idDash, id: this.element});
        if (this.element.startsWith("multiLine")) {
          const opt = this.$store.getters.getOptions({idDash: this.idDash, id: this.element})

          if (opt.yAxesBinding) {
            this.multilineYAxesBinding.axesCount = opt.yAxesBinding.axesCount
          } else {
            this.multilineYAxesBinding.axesCount = 1
          }

          this.metricsName.forEach(metric => {
            this.metricUnits[metric.name] = metric.units;
            if (opt.yAxesBinding && opt.yAxesBinding.metrics && opt.yAxesBinding.metricTypes) {
              this.multilineYAxesBinding.metrics[metric.name] = opt.yAxesBinding.metrics[metric.name]
              this.multilineYAxesBinding.metricTypes[metric.name] = opt.yAxesBinding.metricTypes[metric.name]
            } else {
              this.multilineYAxesBinding.metrics[metric.name] = 'left'
              this.multilineYAxesBinding.metricTypes[metric.name] = 'linechart'
            }
          })
        }
        let test = this.$store.getters.getOptions({idDash: this.idDash, id: this.element})
        if (this.element.includes("heatmap")) {
          this.x = test.x
          this.y = test.y
          this.data = test.data
          this.metadata = test.metadata
          this.detailValue = test.detailValue
        }
      }
      return this.$store.getters.getModalSettings(this.idDash).status;
    },
    idDash: function(){
      return this.idDashFrom
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
    selectedTitles() {
      return this.$store.getters.getSelectedTableTitles(this.idDash, this.element);
    },
    primitivesLibraryAutoGrowLinkText() {
      return this.primitivesLibraryAutoGrow ? 'Свернуть поле' : 'Расширить поле'
    },

    ...mapGetters([
      'getAvailableTableTitles',
      'getSelectedTableTitles',
      'getAvailableDataFormat',
      'getSelectedDataFormat',
    ]),

  },
  watch: {
    selectedTitles(newValue) {
      this.tableTitles = newValue;
    }
  },
  mounted() {
    this.tableTitles = this.getSelectedTableTitles(this.idDashFrom);
    // this.$store.commit('setModalSettings',  { idDash: this.idDash, status: false, id: '' } );
  },
  methods: {
    titleHandler(val) {
      let temp = []
      let orderArray = this.getAvailableTableTitles(this.idDash, this.element);
      for (let setting of val) {
        let index = orderArray.indexOf(setting);
        temp.push({setting, index})
      }
      temp.sort((a, b) => a.index - b.index)
      this.tableTitles = temp.map((el) => el.setting)
    },
    setOptions: function() {  // отправляем настройки в хранилище
      if(!this.options.level){
        this.options.level = 1;
      }

      if(typeof this.options.timeFormat != 'undefined' && this.options.timeFormat == null){
        this.options.timeFormat = '%Y-%m-%d %H:%M:%S';
      }
      if(typeof this.options.size != 'undefined') {
        if ( this.options.size == null){
          this.options.size = '100px';
        } else if (String(this.options.size).indexOf('px') == -1) {
          this.options.size = `${this.options.size}px`;
        }
      }
      //let options = {...{},...this.options};
      if (this.element.indexOf('csvg') != -1) {
        this.options.tooltip = this.tooltip;
      }
      if (this.element.indexOf('piechart') != -1) {
        this.options.metricsRelation = JSON.parse(JSON.stringify(this.metricsRelation));
        this.options.colorsPie = this.colorsPie;
        if (this.colorsPie.theme == 'custom') {
          this.themes[this.colorsPie.nametheme] = this.colorsPie.colors.split(',')
          this.colorsPie.theme = this.colorsPie.nametheme;
        }
        this.options.themes = this.themes;

      }
      if (this.element.indexOf('multiLine') != -1) {
        let updateMetrics = this.metrics.map( item => {
          return JSON.parse(JSON.stringify(item))
        })
        this.$set(this.options,'metrics',updateMetrics);
      }
      if (this.element.includes('heatmap')) {
        this.options.x = this.x;
        this.options.y = this.y;
        this.options.data = this.data;
        this.options.metadata = this.metadata;
        this.options.detailValue = this.detailValue;
        this.options.yFormat = this.yFormat;
        this.options.ySort = this.ySort;
        this.options.xFormat = this.xFormat;
        this.options.xSort = this.xSort;
      }
      if (this.element.startsWith("multiLine")) {
        this.$store.commit('setMultilineMetricUnits', { idDash: this.idDash, elem: this.element, units: this.metricUnits})
        this.options.yAxesBinding = { ...this.multilineYAxesBinding }
      }
      this.$store.commit('setOptions',  { idDash: this.idDash, id: this.element, options: { ...this.options, openNewScreen: this.openNewScreen  }, titles: this.tableTitles});
      this.cancelModal();
    },
    cancelModal: function() {  // если нажали на отмену создания
      this.$store.commit('setModalSettings',  { idDash: this.idDash, status: false, id: '' } );
    },
    checkEsc: function(event) {
      if (event.code =="Escape") {
        this.cancelModal();
      }
    },
    checkOptions: function(option) { // проверяет есть ли такая опция уже в массиве с опциями
      return this.optionsItems.includes(option)
    },
    addIntoTooltip: function(item) {
      if (item == 'text') {
        this.tooltip.texts.push('');
      } else if (item == 'link') {
        this.tooltip.links.push({name: '',url: ''});
      } else if (item == 'button') {
        this.tooltip.buttons.push({name: '',id: ''});
      }
    },
    addMetrics: function() {
      this.metrics.push({name: '', type: '', upborder: 0, lowborder: 0, manual: true})
    },
    deleteFromTooltip: function(item,i) {

      if (item == 'text') {
        this.tooltip.texts.splice(i, 1);
      }  else if (item == 'link') {
        this.tooltip.links.splice(i, 1);
      }  else if (item == 'button') {
        this.tooltip.buttons.splice(i, 1);
      }
    },
    deleteMetrics: function(i) {
      this.metrics.splice(i, 1);
    },
    changeColor: function() {
      if (document.querySelectorAll('.v-menu__content').length != 0){

        document.querySelectorAll('.v-menu__content').forEach( item => {

          item.style.boxShadow = `0 5px 5px -3px ${this.theme.$main_border},0 8px 10px 1px ${this.theme.$main_border},0 3px 14px 2px ${this.theme.$main_border}`;
          item.style.background = this.theme.$main_bg;
          item.style.color = this.theme.$main_text;
          item.style.border = `1px solid ${this.theme.$main_border}`;
        })
      }
    },
    prepareOptions() {  //  понимает какие опции нужно вывести
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.element}); // получаем все опции
      let elem = this.element.split('-')[0];  // понимаем какой тип элемента попал к нам
      this.options = {};
      this.optionsItems = settings.options[elem];
      this.optionsItems.forEach( item => {
        if (Object.keys(options).includes(item)) {
          if (item == 'tooltip') {
            this.tooltip = {};
            this.$set(this.tooltip,'texts', [...[],...options[item].texts]);
            this.$set(this.tooltip,'links', [...[],...options[item].links]);
            this.$set(this.tooltip,'buttons',[...[],...options[item].buttons]);
          } else if (item == 'metrics') {
            //this.$set(this,'metrics',options[item]);
            this.metrics = options[item];
          } else if (item == 'metricsRelation') {
            this.metricsRelation = {};
            this.$set(this.metricsRelation,'metrics', [...[],...options[item].metrics]);
            this.$set(this.metricsRelation,'relations', [...[],...options[item].relations]);
            this.$set(this.metricsRelation,'namesMetric', ['Категория','Процентное соотношение']);
          } else if (item == 'colorsPie') {
            this.colorsPie = {};
            this.$set(this.colorsPie,'theme', options[item].theme);
            this.$set(this.colorsPie,'colors', options[item].colors);
            this.$set(this.colorsPie,'nametheme', options[item].nametheme);
          } else if (item == 'themes') {
            this.themesArr = Object.keys(options[item]);
            this.themes = options[item];
          } else {
            this.$set(this.options,item,options[item]);
          }
        } else {
          this.$set(this.options,item,null);
          if (item == 'stringOX') {
            this.$set(this.options,item,false);
          }
          if (item == 'united') {
            this.$set(this.options,item,false);
          }
          if (item == 'barplotstyle') {
            this.$set(this.options,item,'divided');
          }
          if (item === 'isDataAlwaysShow') {
            this.$set(this.options, item, false);
          }
          if (item === 'xAxisCaptionRotate') {
            this.$set(this.options, item, 0);
          }
          if (item === 'barplotBarWidth') {
            this.$set(this.options, item, 0);
          }
          if (item == 'lastDot') {
            this.$set(this.options,item,false);
          }
          if (item == 'showlegend') {
            this.$set(this.options,item,true);
          }
          if (item == 'positionlegend') {
            this.$set(this.options,item,'right');
          }
          // if (item == 'colorsPie') {
          //   this.colorsPie = {};
          //   this.$set(this.colorsPie,'theme', 'neitral');
          //   this.$set(this.colorsPie,'colors', '');
          //   this.$set(this.colorsPie,'nametheme', '');
          // }
          if (item == 'metrics') {
            this.metrics = [];
          }
          if (item == 'multiple') {
            this.$set(this.options,item,false);
          }
          if (item == 'underline') {
            this.$set(this.options,item,false);
          }
          if (item == 'pinned') {
            this.$set(this.options,item,false);
          }
        }
      })
      if (!this.options.change) {
        this.$set(this.options,'change',false);
      }
    }
  },
}
</script>

<style lang="scss">
  @import '../sass/modalSettings.sass';
</style>
