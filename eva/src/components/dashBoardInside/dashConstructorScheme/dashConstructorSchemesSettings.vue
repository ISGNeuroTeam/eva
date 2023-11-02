<template>
  <div
    v-if="dataObject"
    ref="dataPanelItems"
    class="dash-cs__data-panel-wrapper"
  >
    <div class="dash-cs__data-panel-item pb-4">
      <template v-if="dataType === 'data-type-0'">
        <!--data-type-0-->
        <div class="row justify-content-between align-center">
          <div class="col text-left">
            Ручной ввод TagName:
          </div>
          <div class="col-auto">
            <v-switch
              v-model="textMode"
              dense
            />
          </div>
        </div>
        <div
          v-for="(element, index) in dataObject.items"
          :key="`${dataObject.nodeId}-${index}`"
          class="column dash-cs__data-type-0"
        >
          <v-btn
            v-if="dataObject.items.length > 1"
            ripple
            small
            height="20"
            min-height="20"
            width="20"
            min-width="20"
            class="dash-cs__close-btn px-0 py-0"
            color="transparent"
            @click="deleteLine(index, 'items')"
          >
            <v-icon
              class="theme--dark px-0 py-0"
              size="20"
              :style="{ color: theme.$main_text }"
            >
              {{ closeIcon }}
            </v-icon>
          </v-btn>
          <div class="row align-center relative">
            <v-text-field
              v-if="textMode"
              v-model="element.id"
              label="TagName поля с данными"
              class="col-11 pb-0"
            />
            <v-autocomplete
              v-else
              v-model="element.id"
              :style="{ color: theme.$main_text }"
              :items="dataRestFrom"
              :attach="true"
              item-value="TagName"
              item-text="Description"
              label="Значение"
              :filter="tagNameAutocompleteFilter"
              class="col-11 pb-0"
              :menu-props="{
                'z-index': 1000,
              }"
            >
              <template v-slot:item="{ item, on }">
                <v-list-item
                  ripple
                  class="v-list-item--link dash-cs__data-panel-select"
                  v-on="on"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.Description }}
                    </v-list-item-title>
                    <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                      {{ item.NameObject }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-autocomplete>
            <div
              class="col-12 mb-8 py-0 text-left"
              :style="{ color: theme.$secondary_text }"
            >
              {{ element.id | getObjectNameById(dataRestFrom) }}
            </div>
            <v-text-field
              v-model="element.description"
              label="Подпись"
              :color="theme.$accent_ui_color"
              :style="{ color: theme.$main_text }"
              class="col-11 py-0"
            />
          </div>
        </div>
        <div class="row align-center mb-9">
          <div class="col-9 text-left">
            Добавить строку:
          </div>
          <div class="col-3">
            <v-btn
              ripple
              small
              height="36"
              width="64"
              color="transparent"
              @click="addLine(
                elementTemplates['data-type-0'].dataRest.items[0],
                'items',
              )"
            >
              <v-icon
                class="control-button edit-icon theme--dark"
                :style="{ color: theme.$main_text }"
              >
                {{ addLineIcon }}
              </v-icon>
            </v-btn>
          </div>
        </div>
        <div class="dash-cs__slider column align-stretch">
          <div class="mb-4">
            Размер подложки таблицы:
          </div>
          <div class="dash-cs__slider-title">
            <div>
              <span>{{ dataObject.widthLeft }}</span>
              <span>%</span>
            </div>
            <div>
              <span>{{ dataObject.widthLeft | revertValue }}</span>
              <span>%</span>
            </div>
          </div>
          <v-slider
            :value="dataObject.widthLeft"
            max="90"
            min="10"
            @input="updateSliderValue"
          />
        </div>
      </template>
      <template v-if="dataType === 'data-type-1'">
        <!--data-type-1-->
        <div class="column">
          <div class="row justify-content-between align-center mb-8">
            <div class="col text-left">
              Ручной ввод TagName:
            </div>
            <div class="col-auto">
              <v-switch
                v-model="textMode"
                dense
              />
            </div>
            <v-text-field
              v-if="textMode"
              v-model="dataObject.id"
              label="TagName поля с данными"
              class="col-11 pb-0"
              @change="updateModelValue(dataObject)"
            />
            <v-autocomplete
              v-else
              v-model="dataObject.id"
              :items="dataRestFrom"
              item-value="TagName"
              :attach="true"
              item-text="Description"
              label="Данные для строки"
              :filter="tagNameAutocompleteFilter"
              class="col-11 pb-0"
              :menu-props="{
                'z-index': 1000,
              }"
            >
              <template v-slot:item="{ item, on }">
                <v-list-item
                  ripple
                  class="v-list-item--link dash-cs__data-panel-select"
                  v-on="on"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.Description }}
                    </v-list-item-title>
                    <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                      {{ item.NameObject }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-autocomplete>
            <div
              class="col-12 mb-8 py-0 text-left"
              :style="{ color: theme.$secondary_text }"
            >
              {{ dataObject.id | getObjectNameById(dataRestFrom) }}
            </div>
            <v-text-field
              v-model="dataObject.description"
              label="Подпись"
              :color="theme.$accent_ui_color"
              :style="{ color: theme.$main_text }"
              class="col-11 py-0"
            />
          </div>
        </div>
      </template>
      <template v-if="dataType === 'data-type-2'">
        <!--data-type-2-->
        <div class="row align-center">
          <div class="col-12">
            <div
              v-for="(element, index) in dataObject.items"
              :key="`${dataObject.nodeId}-${index}`"
              class="column dash-cs__data-type-2"
            >
              <v-btn
                v-if="dataObject.items.length > 1"
                ripple
                small
                height="20"
                min-height="20"
                width="20"
                min-width="20"
                class="dash-cs__close-btn px-0 py-0"
                color="transparent"
                @click="deleteLine(index, 'items')"
              >
                <v-icon
                  class="theme--dark px-0 py-0"
                  size="20"
                  :style="{ color: theme.$main_text }"
                >
                  {{ closeIcon }}
                </v-icon>
              </v-btn>
              <div class="row align-center flex-nowrap">
                <v-autocomplete
                  v-model="element.id"
                  :style="{ color: theme.$main_text }"
                  :items="dataRestFrom"
                  item-value="TagName"
                  :attach="true"
                  item-text="Description"
                  label="Значение"
                  :filter="tagNameAutocompleteFilter"
                  :class="dataObject.items.length > 1 ? 'col-10' : 'col-12'"
                  :menu-props="{
                    'z-index': 1000,
                  }"
                >
                  <template v-slot:item="{ item, on }">
                    <v-list-item
                      ripple
                      class="v-list-item--link dash-cs__data-panel-select"
                      v-on="on"
                    >
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.Description }}
                        </v-list-item-title>
                        <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                          {{ item.NameObject }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </div>
              <div
                class="mr-10 mb-3 text-left"
                :style="{ color: theme.$secondary_text }"
              >
                {{ element.id | getObjectNameById(dataRestFrom) }}
              </div>
              <div class="row align-center">
                <div class="col-8 text-left">
                  Цвет накопителя
                </div>
                <div class="col-4">
                  <v-menu
                    top
                    offset-x
                    :close-on-content-click="false"
                    z-index="100"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :style="{
                          'background-color': element.bgColor.rgbaString,
                        }"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>

                    <v-color-picker
                      v-model="element.bgColor.rgbaObject"
                      dot-size="12"
                      mode="rgba"
                      @update:color="updateSelectedNodeColor($event, 'bgColor', index)"
                    />
                  </v-menu>
                </div>
                <div class="col-8 text-left">
                  Цвет текста
                </div>
                <div class="col-4">
                  <v-menu
                    top
                    offset-x
                    :close-on-content-click="false"
                    z-index="100"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :style="{
                          'background-color': element.textColor.rgbaString,
                        }"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>

                    <v-color-picker
                      v-model="element.textColor.rgbaObject"
                      dot-size="12"
                      mode="rgba"
                      @update:color="updateSelectedNodeColor($event, 'textColor', index)"
                    />
                  </v-menu>
                </div>
              </div>
            </div>
            <div class="row align-center">
              <div class="col-8 text-left">
                Добавить строку:
              </div>
              <div class="col-4">
                <v-btn
                  ripple
                  small
                  height="36"
                  width="64"
                  color="transparent"
                  @click="addLine(
                    elementTemplates['data-type-2'].dataRest.items[0],
                    'items',
                  )"
                >
                  <v-icon
                    class="control-button edit-icon theme--dark"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ addLineIcon }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <div class="row align-center mb-9">
              <div class="col-8 text-left">
                Основной фон:
              </div>
              <div class="col-4">
                <v-menu
                  top
                  offset-x
                  :close-on-content-click="false"
                  z-index="100"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :style="{
                        'background-color': dataObject.mainBgColor.rgbaString,
                      }"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>

                  <v-color-picker
                    v-model="dataObject.mainBgColor.rgbaObject"
                    dot-size="12"
                    mode="rgba"
                    @update:color="updateSelectedNodeColor($event, 'mainBgColor')"
                  />
                </v-menu>
              </div>
              <div class="col-8 text-left">
                Максимальный объем:
              </div>
              <div class="col-4">
                <v-text-field
                  v-model="dataObject.maxValue"
                  label=""
                  :color="theme.$main_text"
                  hide-details
                  style="margin-bottom: 10px"
                />
              </div>
              <div class="col-8 text-left">
                Размер текста
              </div>
              <div class="col-4">
                <v-text-field
                  v-model="dataObject.fontSize"
                  label=""
                  :color="theme.$main_text"
                  hide-details
                  dense
                  style="margin-bottom: 10px"
                />
              </div>
              <div class="col-8 text-left">
                Суммировать высоту элементов:
              </div>
              <div class="col-4">
                <v-switch
                  v-model="dataObject.summaryValueHeight"
                  :color="theme.$main_text"
                  hide-details
                  dense
                  style="margin-bottom: 10px"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="dataType === 'data-type-3'">
        <!--data-type-3-->
        <div class="row align-center">
          <div class="col-12">
            <div class="row align-center">
              <v-text-field
                v-model="dataObject.defaultImage"
                label="Изображение (по-умолчанию)"
                class="col-11"
              />
            </div>
            <div class="row align-center mb-4">
              <v-autocomplete
                v-model="dataObject.id"
                :style="{ color: theme.$main_text }"
                :items="dataRestFrom"
                item-value="TagName"
                item-text="Description"
                label="Значение"
                :attach="true"
                :filter="tagNameAutocompleteFilter"
                class="col-11"
                :menu-props="{
                  'z-index': 1000,
                }"
              >
                <template v-slot:item="{ item, on }">
                  <v-list-item
                    ripple
                    class="v-list-item&#45;&#45;link dash-cs__data-panel-select"
                    v-on="on"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.Description }}
                      </v-list-item-title>
                      <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                        {{ item.NameObject }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </div>
            <div
              v-for="(element, index) in dataObject.imageList"
              :key="`${dataObject.nodeId}-${index}`"
              class="column dash-cs__data-type-3"
            >
              <div class="dash-cs__close-btn">
                <v-btn
                  v-if="dataObject.imageList.length > 1"
                  ripple
                  small
                  height="20"
                  min-height="20"
                  width="20"
                  min-width="20"
                  class="dash-cs__close-btn px-0 py-0"
                  color="transparent"
                  @click="deleteLine(index, 'imageList')"
                >
                  <v-icon
                    class="theme--dark px-0 py-0"
                    size="20"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ closeIcon }}
                  </v-icon>
                </v-btn>
              </div>
              <div class="row align-start flex-nowrap">
                <v-text-field
                  v-model="element.image"
                  label="Изображение"
                  :class="dataObject.imageList.length > 1 ? 'col-10' : 'col-10'"
                />
              </div>
              <div class="row align-center">
                <v-text-field
                  v-model="element.value"
                  label="Значение"
                  class="col-11"
                />
              </div>
            </div>
            <div class="row align-center mb-4">
              <div class="col-9 text-left">
                Добавить изображение:
              </div>
              <div class="col-3">
                <v-btn
                  ripple
                  small
                  height="36"
                  width="64"
                  color="transparent"
                  @click="addLine(
                    elementTemplates['data-type-3'].dataRest.imageList[0],
                    'imageList'
                  )"
                >
                  <v-icon
                    class="control-button edit-icon theme--dark"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ addLineIcon }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="dataType === 'data-type-4'">
        <!--data-type-4-->
        <div class="column">
          <div class="column dash-cs__data-type-4">
            <div class="text-left mb-2">
              Подпись данных для задвижки:
            </div>
            <div class="row align-center">
              <v-autocomplete
                v-model="dataObject.textFirstId"
                :style="{ color: theme.$main_text }"
                :items="dataRestFrom"
                item-value="TagName"
                item-text="Description"
                label="Значение"
                :attach="true"
                :filter="tagNameAutocompleteFilter"
                class="col-11"
                :menu-props="{
                  'z-index': 1000,
                }"
              >
                <template v-slot:item="{ item, on }">
                  <v-list-item
                    ripple
                    class="v-list-item&#45;&#45;link dash-cs__data-panel-select"
                    v-on="on"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.Description }}
                      </v-list-item-title>
                      <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                        {{ item.NameObject }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </div>
            <div
              class="d-flex align-center align-content-center justify-space-between py-3"
              :class="{
                'mb-4': !dataObject.textFirstUseDefaultValue,
              }"
            >
              <div class="text-left">
                Значение по-умолчанию:
              </div>
              <v-switch
                v-model="dataObject.textFirstUseDefaultValue"
                dense
                hide-details
                class="ma-0"
              />
            </div>
            <div
              v-if="dataObject.textFirstUseDefaultValue"
              class="row align-center align-content-center"
            >
              <div class="col-12">
                <v-text-field
                  v-model="dataObject.textFirstDefaultValue"
                  dense
                  label=""
                />
              </div>
            </div>
            <div class="row align-center">
              <div class="col-12">
                <v-text-field
                  v-model="dataObject.textFirstSize"
                  label="Размер шрифта"
                  dense
                  class="px-0"
                />
              </div>
            </div>
            <div class="row align-center">
              <div class="col-12">
                <v-select
                  v-model="dataObject.textFirstPosition"
                  :items="dataObject.textFirstPositionList"
                  item-text="label"
                  item-value="value"
                  hide-details
                  :attach="true"
                  :menu-props="{
                    'z-index': 1000,
                    offsetY: true,
                  }"
                  dense
                  :style="{ color: theme.$main_text }"
                  label="Позиция текста:"
                />
              </div>
            </div>
          </div>
          <div class="column dash-cs__data-type-4">
            <div class="text-left mb-2">
              Окраска задвижки:
            </div>
            <div class="row align-center mb-2">
              <v-autocomplete
                v-model="dataObject.id"
                :style="{ color: theme.$main_text }"
                :items="dataRestFrom"
                item-value="TagName"
                item-text="Description"
                label="Значение"
                :attach="true"
                :filter="tagNameAutocompleteFilter"
                class="col-11"
                :menu-props="{
                  'z-index': 1000,
                }"
              >
                <template v-slot:item="{ item, on }">
                  <v-list-item
                    ripple
                    class="v-list-item&#45;&#45;link dash-cs__data-panel-select"
                    v-on="on"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.Description }}
                      </v-list-item-title>
                      <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                        {{ item.NameObject }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </div>
            <div class="row align-center mb-2">
              <div class="col-8">
                <div class="text-left mb-2">
                  Цвета:
                </div>
              </div>
              <div class="col-4">
                <v-btn
                  ripple
                  small
                  height="36"
                  width="64"
                  color="transparent"
                  @click="addLine(
                    elementTemplates['data-type-4'].dataRest.colors[0],
                    'colors'
                  )"
                >
                  <v-icon
                    class="control-button edit-icon theme--dark"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ mdiPlus }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <div class="column">
              <div
                v-for="(item, index) in dataObject.colors"
                :key="`${dataObject.nodeId}-${index}`"
                :class="[
                  'dash-cs__data-type-4',
                  'dash-cs__data-type-4--alt-bg'
                ]"
              >
                <v-btn
                  v-if="dataObject.colors.length > 1"
                  ripple
                  small
                  height="18"
                  min-height="18"
                  width="18"
                  min-width="18"
                  class="dash-cs__close-btn px-0 py-0"
                  color="transparent"
                  @click="deleteLine(index, 'colors')"
                >
                  <v-icon
                    class="theme--dark px-0 py-0"
                    size="18"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ closeIcon }}
                  </v-icon>
                </v-btn>
                <div class="row align-center justify-start align-content-start">
                  <div class="col-4">
                    <v-menu
                      top
                      offset-x
                      :close-on-content-click="false"
                      z-index="100"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          :style="{
                            'background-color': `${item.color.rgbaString}`,
                          }"
                          dark
                          v-bind="attrs"
                          v-on="on"
                        />
                      </template>

                      <v-color-picker
                        :value="item.color.rgbaObject"
                        dot-size="12"
                        mode="rgba"
                        @update:color="updateSelectedNodeColor($event, 'color', index, 'colors')"
                      />
                    </v-menu>
                  </div>
                  <div class="col-8">
                    <v-text-field
                      v-model="item.value"
                      label="Значение"
                      dense
                      class="px-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column dash-cs__data-type-4">
            <div class="text-left mb-4">
              Общие настройки:
            </div>
            <div class="row align-center mb-4">
              <v-text-field
                v-model="dataObject.textSecondValue"
                label="Подпись"
                class="col-12"
              />
            </div>
            <div class="row align-center mb-4">
              <v-text-field
                v-model="dataObject.textSecondSize"
                label="Размер шрифта подписи:"
                class="col-12"
              />
            </div>
            <div class="row align-center mb-4">
              <v-select
                v-model="dataObject.type"
                :items="dataObject.types"
                item-text="label"
                item-value="value"
                hide-details
                :attach="true"
                :menu-props="{
                  'z-index': 1000,
                  offsetY: true,
                }"
                dense
                :style="{ color: theme.$main_text }"
                label="Положение элемента:"
                class="col-12"
              />
            </div>
            <div class="row align-center">
              <div class="col-8 text-left">
                Цвет по-умолчанию:
              </div>
              <div class="col-4">
                <v-menu
                  top
                  offset-x
                  :close-on-content-click="false"
                  z-index="100"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :style="{
                        'background-color': dataObject.defaultColor.rgbaString,
                      }"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>

                  <v-color-picker
                    v-model="dataObject.defaultColor.rgbaObject"
                    dot-size="12"
                    mode="rgba"
                    @update:color="updateSelectedNodeColor($event, 'defaultColor')"
                  />
                </v-menu>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="dataType === 'label-type-0'">
        <!--label-type-0-->
        <div class="row align-center text-left">
          <div class="col-12">
            <v-text-field
              v-model="dataObject.text"
              label="Текст"
              dense
              :color="theme.$main_text"
              style="margin-bottom: 10px"
              outlined
              hide-details
            />
          </div>
          <div class="col-8">
            Цвет текста:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': dataObject.textColor.rgbaString,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.textColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'textColor')"
              />
            </v-menu>
          </div>
          <div class="col-12">
            <v-text-field
              v-model="dataObject.fontSize"
              label="Размер текста"
              dense
              :color="theme.$main_text"
              outlined
              hide-details
              style="margin-bottom: 10px"
            />
          </div>
          <div class="col-8">
            Цвет заливки:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': dataObject.bgColor.rgbaString,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.bgColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'bgColor')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Верт. расположение:
          </div>
          <div class="col-4">
            <v-switch
              v-model="dataObject.isVertical"
            />
          </div>
          <div class="col-8">
            Отображение бордера:
          </div>
          <div class="col-4">
            <v-switch
              v-model="dataObject.bordered"
            />
          </div>
          <template v-if="dataObject.bordered">
            <div class="col-8">
              Цвет бордера:
            </div>
            <div class="col-4">
              <v-menu
                top
                offset-x
                :close-on-content-click="false"
                z-index="100"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    :style="{
                      'background-color': dataObject.borderColor.rgbaString,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  :value="dataObject.borderColor.rgbaObject"
                  dot-size="12"
                  mode="rgba"
                  @update:color="updateSelectedNodeColor($event, 'borderColor')"
                />
              </v-menu>
            </div>
            <div class="col-8">
              Пунктирный бордер:
            </div>
            <div class="col-4">
              <v-switch
                v-model="dataObject.borderDashed"
              />
            </div>
            <div class="col-12">
              <v-text-field
                v-model="dataObject.borderSize"
                label="Размер бордера"
                dense
                :color="theme.$main_text"
                outlined
                hide-details
                style="margin-bottom: 10px"
              />
            </div>
          </template>

          <div class="col-12">
            <v-text-field
              v-model="dataObject.value1"
              label="Значение value1"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value2"
              label="Значение value2"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value3"
              label="Значение value3"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value4"
              label="Значение value4"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value5"
              label="Значение value5"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
          </div>
        </div>
      </template>
      <template v-if="dataType === 'shape-type-0'">
        <div class="row align-center text-left mb-8">
          <div class="col-8">
            Цвет блока:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': `${dataObject.fill.rgbaString}`,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.fill.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'fill')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Цвет рамки блока:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': `${dataObject.strokeColor.rgbaString}`,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.strokeColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'strokeColor')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Размер рамки:
          </div>
          <div class="col-4">
            <v-text-field
              v-model="dataObject.thickness"
              dense
            />
          </div>
          <div class="col-12">
            <v-autocomplete
              v-model="dataObject.shape"
              :items="shapeNodeStyleList"
              item-value="id"
              :attach="true"
              item-text="label"
              label="Фигура"
              :menu-props="{
                'z-index': 1000,
              }"
            />
          </div>
        </div>
      </template>
      <template v-if="dataType === 'edge'">
        <div class="row align-center text-left mb-8">
          <div class="col-8">
            Цвет линии:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': `${dataObject.strokeColor.rgbaString}`,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.strokeColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'strokeColor')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Размер линии:
          </div>
          <div class="col-4">
            <v-text-field
              v-model="dataObject.thickness"
              dense
            />
          </div>
          <div class="col-8">
            Скругление линии:
          </div>
          <div class="col-4">
            <v-text-field
              v-model="dataObject.smoothingLength"
              dense
            />
          </div>
        </div>
      </template>
      <div class="dash-cs__data-panel-footer">
        <v-btn
          small
          outlined
          :color="theme.$main_text"
          @click="updateModelValue"
        >
          Применить
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import {
  mdiClose,
  mdiTableRowPlusAfter,
  mdiPlus,
} from '@mdi/js';
import { throttle } from '@/js/utils/throttle';
import elementTemplates from '@/js/classes/ConstructorSchemes/elementTemplates';

export default {
  name: 'DashConstructorSchemesSettings',
  filters: {
    getObjectNameById(id, dataRest) {
      return dataRest.find((item) => item.TagName === id)?.NameObject || '-';
    },
    revertValue(value) {
      return 100 - value;
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    theme: {
      type: Object,
      required: true,
    },
    shapeNodeStyleList: {
      type: Array,
      default: () => ([]),
    },
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      dataObject: null,
      // Icons
      closeIcon: mdiClose,
      addLineIcon: mdiTableRowPlusAfter,
      mdiPlus,
      test12345: 50,
      textMode: false,
      elementTemplates: elementTemplates.templates,
    };
  },
  computed: {
    dataType() {
      return this.dataObject.dataType;
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(value) {
        this.dataObject = value;
      },
    },
  },
  mounted() {
    this.updateSelectedNodeColor = throttle(this.updateSelectedNodeColor, 200);
    this.updateSliderValue = throttle(this.updateSliderValue, 200);
  },
  methods: {
    tagNameAutocompleteFilter(data, str) {
      const subStr = str.toLowerCase();
      const fields = ['TagName', 'NameObject', 'Description'];
      // eslint-disable-next-line no-restricted-syntax
      for (const field of fields) {
        if (data[field] && data[field].toLowerCase().indexOf(subStr) !== -1) {
          return true;
        }
      }
      return false;
    },
    updateSelectedNodeColor(evt, field, index, listField = 'items') {
      const updateValue = typeof index !== 'undefined'
        ? structuredClone(this.dataObject[listField][index])
        : structuredClone(this.dataObject);
      updateValue[field] = {
        rgbaObject: evt.rgba,
        rgbaString: `rgba(${evt.rgba.r}, ${evt.rgba.g}, ${evt.rgba.b}, ${evt.rgba.a})`,
      };
      if (typeof index !== 'undefined') {
        this.$set(this.dataObject, listField, this.dataObject[listField].map((item, i) => {
          if (i === index) {
            return updateValue;
          }
          return item;
        }));
      } else {
        this.dataObject = updateValue;
      }
    },
    deleteLine(index, objectName) {
      this.dataObject[objectName].splice(index, 1);
    },
    addLine(template, objectName) {
      this.dataObject[objectName].push(structuredClone(template));
    },
    updateModelValue() {
      this.$emit('changeDataSelectedNode', this.dataObject);
      this.$emit('update:modelValue', this.dataObject);
    },
    updateSliderValue(value) {
      this.dataObject.widthLeft = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.dash-cs__data-panel-wrapper {
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
  position: relative;
  .dash-cs__data-panel-footer {
    background-color: var(--main_bg);
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: 24px;
    padding-top: 10px;
    z-index: 1;
  }
  .dash-cs__data-panel-item {
    ::v-deep.v-text-field__details {
      display: none;
    }
    ::v-deep.theme--light.v-input {
      color: var(--main_text);
      .v-icon {
        color: var(--main-text);
      }
    }

    ::v-deep.v-list-item--link {
      max-width: 480px;
    }
  }
  .dash-cs__data-type-0,
  .dash-cs__data-type-2,
  .dash-cs__data-type-3,
  .dash-cs__data-type-4 {
    position: relative;
    border: 1px solid var(--main_border);
    border-radius: 5px;
    padding: 15px 8px;
    margin-bottom: 24px;
    background-color: var(--secondary_bg);
    &--alt-bg {
      position: relative;
      background-color: transparent;
      opacity: 1;
      z-index: 1;
      &:last-child {
        margin-bottom: 0;
      }
      &::after {
        content: "";
        z-index: -1;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: var(--main_bg);
        opacity: 0.4;
        border-radius: 5px;
      }
    }
    .dash-cs__close-btn {
      position: absolute;
      z-index: 1;
      right: 2px;
      top: 2px;
      color: var(--main_text);
      box-shadow: none;
    }
  }
  .dash-cs__slider {
    .dash-cs__slider-title {
      width: inherit;
      display: flex;
      justify-content: space-between;
    }
  }
}

.dash-cs__data-panel-select {
  min-width: 220px;
  max-width: 420px;
}
</style>
