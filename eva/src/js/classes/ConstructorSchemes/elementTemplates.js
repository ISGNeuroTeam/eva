const fontFamily = '"ProximaNova", sans-serif';
const templates = {
  'shape-type-0': {
    template: `
      <g>
        <template v-if="tag.shape === 0">
          <!--round-rectangle-->
          <rect 
            x="0" 
            y="0" 
            :width="layout.width" 
            :height="layout.height" 
            rx="10" 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
          />
        </template>
        <template v-else-if="tag.shape === 1">
          <!--rectangle-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
            :points="'0,0 ' + layout.width + ',0 ' + layout.width + ',' + layout.height + ' 0,' + layout.height"
          />
        </template>
        <template v-else-if="tag.shape === 2">
          <!--ellipse-->
          <ellipse 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
            :ry="layout.height / 2" 
            :cy="layout.height / 2" 
            :rx="layout.width / 2" 
            :cx="layout.width / 2"
          />
        </template>
        <template v-else-if="tag.shape === 3">
          <!--triangle-left-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="layout.width + ',' + layout.height + ' ' + '0,' + layout.height / 2 + ' ' + layout.width + ',0'"
          />
        </template>
        <template v-else-if="tag.shape === 4">
          <!--triangle-right-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="0 + ',' + layout.height + ' ' + layout.width + ',' + layout.height / 2 + ' ' + '0,0'"
          />
        </template>
        <template v-else-if="tag.shape === 5">
          <!--triangle-top-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="'0, ' + layout.height + ' ' + layout.width + ', ' + layout.height + ' ' + layout.width / 2 + ', ' + '0'"
          />
        </template>
        <template v-else-if="tag.shape === 6">
          <!--triangle-bottom-->
          <polygon 
            :fill="tag.fill.rgbaString || 'transparent'" 
            :stroke="tag.strokeColor.rgbaString || 'transparent'" 
            :stroke-width="tag.thickness || '0'"
           :points="'0, ' + '0 ' + layout.width / 2 + ', ' + layout.height + ' ' + layout.width + ', ' + '0'"
          />
        </template>
      </g> 
    `,
    dataRest: {
      nodeId: 'shape-type-0',
      shape: 0,
      dataType: 'shape-type-0',
      fill: '#FFFFFF',
      strokeColor: '#F4F4F4',
      strokeSize: '1.5px',
    },
  },
  'data-type-0': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <!--Border-radius-bg-->
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect
              x="0"
              y="0"
              :width="layout.width"
              :height="layout.height"
              fill="transparent"
              rx="3"
              ry="3"
            />
          </clipPath>
          <!--Separator-line-->
          <rect
            :id="'separator-line-' + tag.nodeId"
            :width="layout.width"
            height="1"
            fill="#E0E0EC"
          />
        </defs>
        <template v-if="tag.widthLeft > 0">
        <!--Bg-left-->
        <rect
          x="0"
          y="0"
          :width="layout.width * (tag.widthLeft / 100)"
          :height="layout.height"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
          :x="layout.width * (tag.widthLeft / 100)"
          y="0"
          :width="layout.width - (layout.width * (tag.widthLeft / 100))"
          :height="layout.height"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        </template>
        <template v-else>
         <!--Bg-left-->
        <rect
          x="0"
          y="0"
          :width="layout.width / 2"
          :height="layout.height"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-right-->
        <rect
          :x="layout.width / 2"
          y="0"
          :width="layout.width / 2"
          :height="layout.height"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        </template>
        <template v-if="tag && tag.items && tag.items.length > 0">
          <template v-for="(item, index) in tag.items">
            <text
              dx="0.5em"
              class="b-data-node__text b-data-node__text--left"
              fill="#3C3B45"
              :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
              alignment-baseline="middle"
              :key="'row-' + tag.nodeId + '-' + index + '-text-left'"
              :font-family="tag.fontFamily || ''"
              :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
            >
              {{ item.textLeft }}
            </text>
            <text
              text-anchor="end"
              :dy="(((layout.height / tag.items.length) * (index + 1)) - ((layout.height / tag.items.length) / 2))"
              alignment-baseline="middle"
              :dx="(layout.width / 2) - 1"
              class="b-data-node__text b-data-node__text--right"
              :transform="'translate(' + (layout.width - 8) / 2 + ')'"
              fill="white"
              :key="'row-' + tag.nodeId + '-' + index + '-text-right'"
              :font-family="tag.fontFamily || ''"
              :font-size="((layout.height / tag.items.length) * 0.8) + 'px'"
            >
              {{ item.textRight }}
            </text>
            <use
              v-if="index < (tag.items.length - 1)"
              :href="'#separator-line-' + tag.nodeId"
              x="0"
              :y="(layout.height / tag.items.length) * (index + 1)"
              :key="'row-' + tag.nodeId + '-' + index + '-separator'"
            />
          </template>
        </template>
      </g>
    `,
    width: 150,
    rowHeight: 16,
    dataRest: {
      // Уникальный идентификатор элемента для отсутствия проблем со стилизацией на графе
      nodeId: 'template-0',
      // Идентификатор для связки данных с элементом,
      // в дальнейшем должен приходить с сервера
      dataType: 'data-type-0',
      templateType: 'template-0',
      widthLeft: 50,
      fontFamily,
      items: [
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
        {
          id: '',
          textLeft: '-',
          textRight: '-',
        },
      ],
    },
  },
  'data-type-1': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <!--Bg-top-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#000000"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-bottom-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height / 2"
          fill="#FFFFFF"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :transform="'translate(' + layout.width + ',' + layout.height + '), rotate(180)'"
        />
        <text
         :dx="layout.width / 2"
         text-anchor="middle"
         class="b-data-node__text"
         :fill="tag.valueColor || '#FFFFFF'"
         :dy="((layout.height / 2) - (layout.height / 4))"
         alignment-baseline="middle"
         :font-family="tag.fontFamily || ''"
         :font-size="((layout.height / 2) * 0.8) + 'px'"
        >
          {{ tag.textFirst }}
        </text>
        <text
         :dx="layout.width / 2"
         text-anchor="middle"
         class="b-data-node__text"
         fill="#3C3B45"
         :dy="(layout.height - (layout.height / 4))"
         alignment-baseline="middle"
         :font-family="tag.fontFamily || ''"
         :font-size="((layout.height / 2) * 0.8) + 'px'"
        >
          {{ tag.textSecond }}
        </text>
      </g>
    `,
    width: 150,
    rowHeight: 30,
    dataRest: {
      dataType: 'data-type-1',
      nodeId: 'template-1',
      templateType: 'template-1',
      fontFamily,
      id: '',
      textFirst: '-',
      textSecond: '-',
    },
  },
  'data-type-2': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <!--Bg-main-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height"
          :fill="tag.mainBgColor.rgbaString"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
        />
        <!--Bg-second-->
        <template v-if="tag.items.length && tag.items.length > 0">
          
          <template v-if="tag.summaryValueHeight">
            <template v-for="(item, index) in tag.items.map((el) => el).reverse()">
              <rect
                :key="index + '-bg-' + tag.nodeId"
                x="0"
                :y="index > 0
                 ? tag.getPosition(index, layout, tag.summaryValueHeight, true)
                 : 0"
                :width="layout.width"
                :height="tag.getHeight(layout, index, true)"
                :fill="item.bgColor.rgbaString"
                :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
                :transform="tag.getTransform(layout)"
              />
            </template>
          </template>
          <template v-else>
            <template v-for="(item, index) in tag.items">
              <rect
                :key="index + '-bg-' + tag.nodeId"
                x="0"
                :y="index > 0
                 ? tag.getPosition(index, layout, tag.summaryValueHeight)
                 : 0"
                :width="layout.width"
                :height="tag.getHeight(layout, index)"
                :fill="item.bgColor.rgbaString"
                :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
                :transform="tag.getTransform(layout)"
              />
            </template>
          </template>
          <template v-for="(item, index) in tag.items">
            <text
              :key="index + '-text-' + tag.nodeId"
              class="b-data-node__text"
              :dx="layout.width / 2"
              :dy="tag.getDy(layout, index)"
              alignment-baseline="middle"
              text-anchor="middle"
              :fill="item.textColor.rgbaString"
              :font-family="tag.fontFamily || ''"
              :font-size="tag.fontSize + 'px'"
            >
              {{ item.value === '-' ? 0 : item.value }}
            </text>
          </template>
        </template>
      </g>
    `,
    width: 150,
    height: 30,
    dataRest: {
      dataType: 'data-type-2',
      nodeId: 'template-2',
      fontFamily,
      fontSize: 10,
      id: '',
      templateType: 'template-2',
      maxValue: 1,
      summaryValueHeight: false,
      mainBgColor: {
        rgbaString: 'rgba(0, 0, 0, 1)',
        rgbaObject: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
      },
      // Methods
      // Обязательно удалять эти поля при сохранении схемы
      getHeight(layout, index, isReverse) {
        const roundedValue = isReverse
          ? [...this.items].reverse()[index].value
          : this.items[index].value;
        return ((layout.height / 100) * (roundedValue * (100 / this.maxValue)));
      },
      getTransform(layout) {
        return `translate(${layout.width},${layout.height}), rotate(180)`;
      },
      getDy(layout, index) {
        return this.items?.length > 1 ? (((layout.height / this.items.length) * (index + 1))
            - ((layout.height / this.items.length) / 2)) : layout.height / 2;
      },
      getPosition(index, layout, summaryValueHeight, isReverse) {
        if (!summaryValueHeight) {
          return 0;
        }
        let sum = 0;
        const items = isReverse
          ? [...this.items].reverse()
          : this.items;
        for (let i = 0; i < index; i += 1) {
          const el = items[i];
          const numericValue = el.value === '-' ? 0 : parseFloat(el.value);
          const itemHeight = (layout.height / 100) * (numericValue * (100 / this.maxValue));
          sum += itemHeight;
        }

        return Math.round(sum * 100) / 100;
      },
      items: [
        {
          value: 0,
          id: '',
          textColor: {
            rgbaString: 'rgba(255, 0, 0, 1)',
            rgbaObject: {
              r: 255,
              g: 0,
              b: 0,
              a: 1,
            },
          },
          bgColor: {
            rgbaString: 'rgba(255, 255, 255, 1)',
            rgbaObject: {
              r: 255,
              g: 255,
              b: 255,
              a: 1,
            },
          },
        },
      ],
    },
  },
  'data-type-3': {
    template: `
      <g class="b-data-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              rx="3" 
              ry="3" 
            />
          </clipPath>
        </defs>
        <text
          :key="'text-' + tag.nodeId"
          class="b-data-node__text"
          :dx="layout.width / 2"
          :dy="layout.height / 2"
          alignment-baseline="middle"
          text-anchor="middle"
          fill="#000000"
          :font-family="tag.fontFamily || ''"
          :font-size="tag.fontSize + 'px'"
        >
          {{ tag.placeholder }}
        </text>
      </g>
    `,
    width: 150,
    height: 30,
    dataRest: {
      dataType: 'data-type-3',
      nodeId: 'template-3',
      fontFamily,
      fontSize: 16,
      id: '',
      value: 0,
      templateType: 'template-3',
      // show if activeImage==='default'
      placeholder: 'Изображение',
      activeImage: '',
      defaultImage: '',
      defaultImagePath: '',
      imageLayout: null,
      imageList: [
        {
          value: 0,
          image: '',
          path: '',
        },
      ],
      getActiveImage() {
        if (this.activeImage === '') {
          return false;
        }
        return !!(this.imageList.find((item) => item.image === this.activeImage));
      },
    },
  },
  'data-type-4': {
    template: `
      <g class="b-data-node">
        <g :transform="tag.calculateScale(tag.type, layout).stringResult">
          <!--Type-1-->
          <template v-if="tag.type === 0">
            <path 
              d="M55.15 60.337H54.25V55.8587H55.15H55.65V55.3587V55.25H58.85V55.3587V55.8587H59.35H60.25V60.337H59.35H58.85V60.837V61.25H55.65V60.837V60.337H55.15Z" 
              fill="url(#paint1_radial_809_1590)" 
              stroke="black"
            />
            <path 
              d="M64.95 92.75H59.55V93.7935H57.75V103.185H59.55V104.75H64.95V103.185H66.75V93.7935H64.95V92.75Z" 
              fill="url(#paint3_radial_809_1590)" 
              stroke="black"
            />
            <path 
              d="M54.95 92.75H49.55V93.7935H47.75V103.185H49.55V104.75H54.95V103.185H56.75V93.7935H54.95V92.75Z" 
              fill="url(#paint4_radial_809_1590)" 
              stroke="black"
            />
            <!--Color-changing elements-->
            <g :fill="tag.color.rgbaString">
              <path
                d="M71.75 92.75H68.75V93.75H67.75V102.75H68.75V104.25H71.75V102.75H72.75V93.75H71.75V92.75Z"
                stroke="black"
              />
              <path
                d="M45.75 92.75H42.75V93.75H41.75V102.75H42.75V104.25H45.75V102.75H46.75V93.75H45.75V92.75Z"
                stroke="black"
              />
              <path
                d="M12.5 140L12.5 109H16.25H17V108.25V105.5H99V108.25V109H99.75H103.5V140H99.75H99V140.75V143.5H17L17 140.75V140H16.25H12.5Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M27.5 65.4684V62.0316H29.7662H30.5162V61.5H84.9838V62.0316H85.7338L88 62.0316V65.4684H85.7338H84.9838V66H30.5162V65.4684H29.7662H27.5Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M27.5 91.4684V88.0316H29.7662H30.5162V87.5H84.9838V88.0316H85.7338H88V91.4684H85.7338H84.9838V92H30.5162V91.4684H29.7662H27.5Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M19.5 84.2278V69.2722H22.5446H23.2946V68.5222V67.5H92.2054V68.5222V69.2722H92.9554H96V84.2278H92.9554H92.2054V84.9778V86H23.2946V84.9778V84.2278H22.5446H19.5Z"
                stroke="black"
                stroke-width="1.5"
              />
            </g>
            <path 
              d="M41.35 98.75H23.4611L13.75 89.8438L14.2611 62.6562L23.9722 53.75H59.75" 
              stroke="black" 
              fill="none"
              stroke-width="2"
            />
            <rect 
              x="104.25" 
              y="110.25" 
              width="7" 
              height="28" 
              fill="url(#paint9_linear_809_1590)" 
              stroke="black"
            />
            <path 
              d="M4.75 113.75V110.25H11.75L11.75 138.25H4.75V134.75V134.25H4.25H1.25L1.25 129.75H4.25H4.75V129.25V119.25V118.75H4.25H1.25L1.25 114.25H4.25H4.75V113.75Z" 
              fill="url(#paint10_linear_809_1590)" 
              stroke="black"
            />
            <path 
              d="M104.5 46.5L7.5 46.5L7.5 0.5L104.5 0.5L104.5 46.5Z" 
              fill="black" 
              stroke="black"
            />
            <!--Text elements-->
            <g 
              alignment-baseline="middle"
              text-anchor="middle"
              font-weight="600"
            >
              <text
                :font-size="tag.textFirstSize"
                :dx="tag.getElementSize(tag.type, layout).width / 2"
                :dy="tag.getElementSize(tag.type, layout).height * 0.15  + (tag.textFirstSize / 3)"
                :fill="tag.textFirstColor.rgbaString"
              >
                {{ tag.textFirstValue || '' }}
              </text>
              <text
                :font-size="tag.textSecondSize"
                :dx="tag.getElementSize(tag.type, layout).width / 2"
                :dy="tag.getElementSize(tag.type, layout).height * 0.85  + (tag.textSecondSize / 3)"
                :fill="tag.textSecondColor.rgbaString"
              >
                {{ tag.textSecondValue  || '' }}
              </text>
            </g>
            <defs>
              <linearGradient 
                id="paint0_linear_809_1590" 
                x1="73.25" 
                y1="97.25" 
                x2="67.25" 
                y2="97.25" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#6D6263"/>
                <stop offset="0.479167" stop-color="#D1D1D1"/>
                <stop offset="0.916667" stop-color="#6D6263"/>
              </linearGradient>
              <radialGradient 
                id="paint1_radial_809_1590" 
                cx="0" 
                cy="0" 
                r="1" 
                gradientUnits="userSpaceOnUse" 
                gradientTransform="translate(57.25 58.25) rotate(90) scale(3.5 5.01165)"
              >
                <stop stop-color="#9D459D"/>
                <stop offset="1" stop-color="#531544"/>
              </radialGradient>
              <linearGradient 
                id="paint2_linear_809_1590" 
                x1="47.25" 
                y1="97.25" 
                x2="41.25" 
                y2="97.25" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#6D6263"/>
                <stop offset="0.479167" stop-color="#D1D1D1"/>
                <stop offset="0.916667" stop-color="#6D6263"/>
              </linearGradient>
              <radialGradient 
                id="paint3_radial_809_1590" 
                cx="0" 
                cy="0" 
                r="1" 
                gradientUnits="userSpaceOnUse" 
                gradientTransform="translate(62.25 98.75) rotate(90) scale(3 15.2483)"
              >
                <stop stop-color="#01A19E"/>
                <stop offset="1" stop-color="#01817F"/>
              </radialGradient>
              <radialGradient 
                id="paint4_radial_809_1590" 
                cx="0" 
                cy="0" 
                r="1" 
                gradientUnits="userSpaceOnUse" 
                gradientTransform="translate(52.25 98.75) rotate(90) scale(3 21.3477)"
              >
                <stop stop-color="#01A19E"/>
                <stop offset="1" stop-color="#01817F"/>
              </radialGradient>
              <linearGradient 
                id="paint5_linear_809_1590" 
                x1="58" 
                y1="104.75" 
                x2="58" 
                y2="144.25" 
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.0364583" stop-color="#80792C"/>
                <stop offset="0.0772133" stop-color="#F6F16D"/>
                <stop offset="0.520833" stop-color="#EAE57F"/>
                <stop offset="0.897851" stop-color="#F6F170"/>
                <stop offset="1" stop-color="#796D23"/>
              </linearGradient>
              <linearGradient 
                id="paint6_linear_809_1590" 
                x1="57.75" 
                y1="60.75" 
                x2="57.75" 
                y2="66.75" 
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.203125" stop-color="#767218"/>
                <stop offset="0.380208" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.661458" stop-color="#D5D24E"/>
                <stop offset="0.84375" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient 
                id="paint7_linear_809_1590" 
                x1="57.75" 
                y1="86.75" 
                x2="57.75" 
                y2="92.75" 
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.229167" stop-color="#767218"/>
                <stop offset="0.380208" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.661458" stop-color="#C0BC41"/>
                <stop offset="0.75" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient 
                id="paint8_linear_809_1590" 
                x1="57.75" 
                y1="66.75" 
                x2="57.75" 
                y2="86.75" 
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.03125" stop-color="#767218"/>
                <stop offset="0.28125" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.760417" stop-color="#D5D24E"/>
                <stop offset="1" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient 
                id="paint9_linear_809_1590" 
                x1="107.75" 
                y1="109.75" 
                x2="107.75" 
                y2="138.75" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4261E5"/>
                <stop offset="0.442708" stop-color="#DCE5FF"/>
                <stop offset="0.572917" stop-color="#DCE5FF"/>
                <stop offset="1" stop-color="#4261E5"/>
              </linearGradient>
              <linearGradient 
                id="paint10_linear_809_1590" 
                x1="8.25" 
                y1="106.75" 
                x2="8.25" 
                y2="135.75" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4261E5"/>
                <stop offset="0.442708" stop-color="#DCE5FF"/>
                <stop offset="0.572917" stop-color="#DCE5FF"/>
                <stop offset="1" stop-color="#4261E5"/>
              </linearGradient>
            </defs>
          </template>
          <template v-if="tag.type === 1">
            <g :fill="tag.color.rgbaString">
              <path
                d="M51.5 71.5L51.5 68.5L50.5 68.5L50.5 67.5L41.5 67.5L41.5 68.5L40 68.5L40 71.5L41.5 71.5L41.5 72.5L50.5 72.5L50.5 71.5L51.5 71.5Z"
                stroke="black"
              />
              <path
                d="M83.913 54.9L83.913 54L88.3913 54L88.3913 54.9L88.3913 55.4L88.8913 55.4L89 55.4L89 58.6L88.8913 58.6L88.3913 58.6L88.3913 59.1L88.3913 60L83.913 60L83.913 59.1L83.913 58.6L83.413 58.6L83 58.6L83 55.4L83.413 55.4L83.913 55.4L83.913 54.9Z"
                stroke="black"
              />
              <path
                d="M51.5 45.5L51.5 42.5L50.5 42.5L50.5 41.5L41.5 41.5L41.5 42.5L40 42.5L40 45.5L41.5 45.5L41.5 46.5L50.5 46.5L50.5 45.5L51.5 45.5Z"
                stroke="black"
              />
              <path
              d="M4.25 12.25L35.25 12.25L35.25 16L35.25 16.75L36 16.75L38.75 16.75L38.75 98.75L36 98.75L35.25 98.75L35.25 99.5L35.25 103.25L4.25 103.25L4.25 99.5L4.25 98.75L3.5 98.75L0.749996 98.75L0.75 16.75L3.5 16.75L4.25 16.75L4.25 16L4.25 12.25Z"
              stroke="black"
              stroke-width="1.5"
            />
              <path
                d="M78.7816 27.25L82.2184 27.25L82.2184 29.5162L82.2184 30.2662L82.75 30.2662L82.75 84.7338L82.2184 84.7338L82.2184 85.4838L82.2184 87.75L78.7816 87.75L78.7816 85.4838L78.7816 84.7338L78.25 84.7338L78.25 30.2662L78.7816 30.2662L78.7816 29.5162L78.7816 27.25Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M52.7816 27.25L56.2184 27.25L56.2184 29.5162L56.2184 30.2662L56.75 30.2662L56.75 84.7338L56.2184 84.7338L56.2184 85.4838L56.2184 87.75L52.7816 87.75L52.7816 85.4838L52.7816 84.7338L52.25 84.7338L52.25 30.2662L52.7816 30.2662L52.7816 29.5162L52.7816 27.25Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M60.0222 19.25L74.9778 19.25L74.9778 22.2946L74.9778 23.0446L75.7278 23.0446L76.75 23.0446L76.75 91.9554L75.7278 91.9554L74.9778 91.9554L74.9778 92.7054L74.9778 95.75L60.0221 95.75L60.0221 92.7054L60.0221 91.9554L59.2721 91.9554L58.25 91.9554L58.25 23.0446L59.2722 23.0446L60.0222 23.0446L60.0222 22.2946L60.0222 19.25Z"
                stroke="black"
                stroke-width="1.5"
              />
            </g>
            <path
              d="M51.5 64.7L51.5 59.3L50.4565 59.3L50.4565 57.5L41.0652 57.5L41.0652 59.3L39.5 59.3L39.5 64.7L41.0652 64.7L41.0652 66.5L50.4565 66.5L50.4565 64.7L51.5 64.7Z"
              fill="url(#paint3_radial_809_1588)"
              stroke="black"
            />
            <path
              d="M51.5 54.7L51.5 49.3L50.4565 49.3L50.4565 47.5L41.0652 47.5L41.0652 49.3L39.5 49.3L39.5 54.7L41.0652 54.7L41.0652 56.5L50.4565 56.5L50.4565 54.7L51.5 54.7Z"
              fill="url(#paint4_radial_809_1588)"
              stroke="black"
            />
            <path
              d="M45.5 41.1L45.5 23.2111L54.4062 13.5L81.5937 14.0111L90.5 23.7222L90.5 59.5"
              stroke="black"
              fill="none"
              stroke-width="2"
            />
            <rect
              x="34"
              y="104"
              width="7"
              height="28"
              transform="rotate(90 34 104)"
              fill="url(#paint9_linear_809_1588)"
              stroke="black"
            />
            <path
              d="M30.5 4.5L34 4.5L34 11.5L6 11.5L6 4.5L9.5 4.5L10 4.5L10 4L10 0.999999L14.5 0.999999L14.5 4L14.5 4.5L15 4.5L25 4.5L25.5 4.5L25.5 4L25.5 1L30 1L30 4L30 4.5L30.5 4.5Z"
              fill="url(#paint10_linear_809_1588)"
              stroke="black"
            />
            <path
              d="M194.5 80.5L97.5 80.5L97.5 34.5L194.5 34.5V80.5Z"
              fill="black"
              stroke="black"
            />
            <g
              alignment-baseline="middle"
              text-anchor="middle"
              font-weight="600" 
            >
              <text
                :font-size="tag.textFirstSize"
                :dx="tag.getElementSize(tag.type, layout).width * 0.75"
                :dy="tag.getElementSize(tag.type, layout).height / 2 + (tag.textFirstSize / 3)"
                :fill="tag.textFirstColor.rgbaString"
              >
                {{ tag.textFirstValue || '' }}
              </text>
              <text
                :font-size="tag.textSecondSize"
                :dx="15 + (tag.textSecondSize / 4)"
                :dy="tag.getElementSize(tag.type, layout).height / 2"
                style="writing-mode: tb; glyph-orientation-vertical: 90;"
                :fill="tag.textSecondColor.rgbaString"
              >
                {{ tag.textSecondValue  || '' }}
              </text>
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_809_1588"
                x1="47"
                y1="73"
                x2="47"
                y2="67"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#6D6263"/>
                <stop offset="0.479167" stop-color="#D1D1D1"/>
                <stop offset="0.916667" stop-color="#6D6263"/>
              </linearGradient>
              <radialGradient
                id="paint1_radial_809_1588"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(86 57) rotate(-180) scale(3.5 5.01165)"
              >
                <stop stop-color="#9D459D"/>
                <stop offset="1" stop-color="#531544"/>
              </radialGradient>
              <linearGradient
                id="paint2_linear_809_1588"
                x1="47"
                y1="47"
                x2="47"
                y2="41"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#6D6263"/>
                <stop offset="0.479167" stop-color="#D1D1D1"/>
                <stop offset="0.916667" stop-color="#6D6263"/>
              </linearGradient>
              <radialGradient
                id="paint3_radial_809_1588"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(45.5 62) rotate(180) scale(3 15.2483)"
              >
                <stop stop-color="#01A19E"/>
                <stop offset="1" stop-color="#01817F"/>
              </radialGradient>
              <radialGradient
                id="paint4_radial_809_1588"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(45.5 52) rotate(180) scale(3 21.3477)"
              >
                <stop stop-color="#01A19E"/>
                <stop offset="1" stop-color="#01817F"/>
              </radialGradient>
              <linearGradient
                id="paint5_linear_809_1588"
                x1="39.5"
                y1="57.75"
                x2="-2.02165e-06"
                y2="57.75"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.0364583" stop-color="#80792C"/>
                <stop offset="0.0772133" stop-color="#F6F16D"/>
                <stop offset="0.520833" stop-color="#EAE57F"/>
                <stop offset="0.897851" stop-color="#F6F170"/>
                <stop offset="1" stop-color="#796D23"/>
              </linearGradient>
              <linearGradient
                id="paint6_linear_809_1588"
                x1="83.5"
                y1="57.5"
                x2="77.5"
                y2="57.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.203125" stop-color="#767218"/>
                <stop offset="0.380208" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.661458" stop-color="#D5D24E"/>
                <stop offset="0.84375" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient
                id="paint7_linear_809_1588"
                x1="57.5"
                y1="57.5"
                x2="51.5"
                y2="57.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.229167" stop-color="#767218"/>
                <stop offset="0.380208" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.661458" stop-color="#C0BC41"/>
                <stop offset="0.75" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient
                id="paint8_linear_809_1588"
                x1="77.5"
                y1="57.5"
                x2="57.5"
                y2="57.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.03125" stop-color="#767218"/>
                <stop offset="0.28125" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.760417" stop-color="#D5D24E"/>
                <stop offset="1" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient
                id="paint9_linear_809_1588"
                x1="38.5"
                y1="103.5"
                x2="38.5"
                y2="132.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4261E5"/>
                <stop offset="0.442708" stop-color="#DCE5FF"/>
                <stop offset="0.572917" stop-color="#DCE5FF"/>
                <stop offset="1" stop-color="#4261E5"/>
              </linearGradient>
              <linearGradient
                id="paint10_linear_809_1588"
                x1="37.5"
                y1="8"
                x2="8.5"
                y2="8"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4261E5"/>
                <stop offset="0.442708" stop-color="#DCE5FF"/>
                <stop offset="0.572917" stop-color="#DCE5FF"/>
                <stop offset="1" stop-color="#4261E5"/>
              </linearGradient>
            </defs>
          </template>
          <template v-if="tag.type === 2">
            <g :fill="tag.color.rgbaString">
              <path
                d="M143 40.5L143 43.5L144 43.5L144 44.5L153 44.5L153 43.5L154.5 43.5L154.5 40.5L153 40.5L153 39.5L144 39.5L144 40.5L143 40.5Z"
                stroke="black"
              />
              <path
                d="M143 66.5L143 69.5L144 69.5L144 70.5L153 70.5L153 69.5L154.5 69.5L154.5 66.5L153 66.5L153 65.5L144 65.5L144 66.5L143 66.5Z"
                stroke="black"
              />
              <path
                d="M190.25 99.75L159.25 99.75L159.25 96L159.25 95.25L158.5 95.25L155.75 95.25L155.75 13.25L158.5 13.25L159.25 13.25L159.25 12.5L159.25 8.75L190.25 8.75L190.25 12.5L190.25 13.25L191 13.25L193.75 13.25L193.75 95.25L191 95.25L190.25 95.25L190.25 96L190.25 99.75Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M115.718 84.75L112.282 84.75L112.282 82.4838L112.282 81.7338L111.75 81.7338L111.75 27.2662L112.282 27.2662L112.282 26.5162L112.282 24.25L115.718 24.25L115.718 26.5162L115.718 27.2662L116.25 27.2662L116.25 81.7338L115.718 81.7338L115.718 82.4838L115.718 84.75Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M141.718 84.75L138.282 84.75L138.282 82.4838L138.282 81.7338L137.75 81.7338L137.75 27.2662L138.282 27.2662L138.282 26.5162L138.282 24.25L141.718 24.25L141.718 26.5162L141.718 27.2662L142.25 27.2662L142.25 81.7338L141.718 81.7338L141.718 82.4838L141.718 84.75Z"
                stroke="black"
                stroke-width="1.5"
              />
              <path
                d="M134.478 92.75L119.522 92.75L119.522 89.7054L119.522 88.9554L118.772 88.9554L117.75 88.9554L117.75 20.0446L118.772 20.0446L119.522 20.0446L119.522 19.2946L119.522 16.25L134.478 16.25L134.478 19.2946L134.478 20.0446L135.228 20.0446L136.25 20.0446L136.25 88.9554L135.228 88.9554L134.478 88.9554L134.478 89.7054L134.478 92.75Z"
                stroke="black"
                stroke-width="1.5"
              />
            </g>
            <path
              d="M110.587 57.1L110.587 58L106.109 58L106.109 57.1L106.109 56.6L105.609 56.6L105.5 56.6L105.5 53.4L105.609 53.4L106.109 53.4L106.109 52.9L106.109 52L110.587 52L110.587 52.9L110.587 53.4L111.087 53.4L111.5 53.4L111.5 56.6L111.087 56.6L110.587 56.6L110.587 57.1Z"
              fill="url(#paint1_radial_809_1589)"
              stroke="black"
            />
            <path
              d="M143 47.3L143 52.7L144.043 52.7L144.043 54.5L153.435 54.5L153.435 52.7L155 52.7L155 47.3L153.435 47.3L153.435 45.5L144.043 45.5L144.043 47.3L143 47.3Z"
              fill="url(#paint3_radial_809_1589)"
              stroke="black"
            />
            <path
              d="M143 57.3L143 62.7L144.043 62.7L144.043 64.5L153.435 64.5L153.435 62.7L155 62.7L155 57.3L153.435 57.3L153.435 55.5L144.043 55.5L144.043 57.3L143 57.3Z"
              fill="url(#paint4_radial_809_1589)"
              stroke="black"
            />
            <path
              d="M149 70.9L149 88.7889L140.094 98.5L112.906 97.9889L104 88.2778L104 52.5"
              stroke="black"
              fill="none"
              stroke-width="2"
            />
            <rect
              x="160.5"
              y="8"
              width="7"
              height="28"
              transform="rotate(-90 160.5 8)"
              fill="url(#paint9_linear_809_1589)"
              stroke="black"
            />
            <path
              d="M164 107.5L160.5 107.5L160.5 100.5L188.5 100.5L188.5 107.5L185 107.5L184.5 107.5L184.5 108L184.5 111L180 111L180 108L180 107.5L179.5 107.5L169.5 107.5L169 107.5L169 108L169 111L164.5 111L164.5 108L164.5 107.5L164 107.5Z"
              fill="url(#paint10_linear_809_1589)"
              stroke="black"
            />
            <path
              d="M97.5 80.5L0.5 80.5L0.5 34.5L97.5 34.5L97.5 80.5Z"
              fill="black"
              stroke="black"
            />
            <g
              alignment-baseline="middle"
              text-anchor="middle"
              font-weight="600" 
            >
              <text
                :font-size="tag.textFirst.size"
                :dx="18"
                :dy="tag.getElementSize(tag.type, layout).height / 2"
                :fill="tag.textFirst.color.rgbaString"
              >
                {{ tag.textFirst.value || '' }}
              </text>
              <text
                :font-size="tag.textFirst.size"
                :dx="tag.getElementSize(tag.type, layout).width"
                :dy="tag.getElementSize(tag.type, layout).height / 3"
                :style="tag.getTextStyles(layout)"
                text-anchor="end"
                :fill="tag.textSecond.color.rgbaString"
              >
                {{ tag.textSecond.value  || '' }}
              </text>
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_809_1589"
                x1="147.5"
                y1="39"
                x2="147.5"
                y2="45"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#6D6263"/>
                <stop offset="0.479167" stop-color="#D1D1D1"/>
                <stop offset="0.916667" stop-color="#6D6263"/>
              </linearGradient>
              <radialGradient
                id="paint1_radial_809_1589"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(108.5 55) scale(3.5 5.01165)"
              >
                <stop stop-color="#9D459D"/>
                <stop offset="1" stop-color="#531544"/>
              </radialGradient>
              <linearGradient
                id="paint2_linear_809_1589"
                x1="147.5"
                y1="65"
                x2="147.5"
                y2="71"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#6D6263"/>
                <stop offset="0.479167" stop-color="#D1D1D1"/>
                <stop offset="0.916667" stop-color="#6D6263"/>
              </linearGradient>
              <radialGradient
                id="paint3_radial_809_1589"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(149 50) scale(3 15.2483)"
              >
                <stop stop-color="#01A19E"/>
                <stop offset="1" stop-color="#01817F"/>
              </radialGradient>
              <radialGradient
                id="paint4_radial_809_1589"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(149 60) scale(3 21.3477)"
              >
                <stop stop-color="#01A19E"/>
                <stop offset="1" stop-color="#01817F"/>
              </radialGradient>
              <linearGradient
                id="paint5_linear_809_1589"
                x1="155"
                y1="54.25"
                x2="194.5"
                y2="54.25"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.0364583" stop-color="#80792C"/>
                <stop offset="0.0772133" stop-color="#F6F16D"/>
                <stop offset="0.520833" stop-color="#EAE57F"/>
                <stop offset="0.897851" stop-color="#F6F170"/>
                <stop offset="1" stop-color="#796D23"/>
              </linearGradient>
              <linearGradient
                id="paint6_linear_809_1589"
                x1="111"
                y1="54.5"
                x2="117"
                y2="54.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.203125" stop-color="#767218"/>
                <stop offset="0.380208" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.661458" stop-color="#D5D24E"/>
                <stop offset="0.84375" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient
                id="paint7_linear_809_1589"
                x1="137"
                y1="54.5"
                x2="143"
                y2="54.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.229167" stop-color="#767218"/>
                <stop offset="0.380208" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.661458" stop-color="#C0BC41"/>
                <stop offset="0.75" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient
                id="paint8_linear_809_1589"
                x1="117"
                y1="54.5"
                x2="137"
                y2="54.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.03125" stop-color="#767218"/>
                <stop offset="0.28125" stop-color="#D1CD4C"/>
                <stop offset="0.520833" stop-color="#E3DF54"/>
                <stop offset="0.760417" stop-color="#D5D24E"/>
                <stop offset="1" stop-color="#837E1B"/>
              </linearGradient>
              <linearGradient
                id="paint9_linear_809_1589"
                x1="164"
                y1="8.5"
                x2="164"
                y2="37.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4261E5"/>
                <stop offset="0.442708" stop-color="#DCE5FF"/>
                <stop offset="0.572917" stop-color="#DCE5FF"/>
                <stop offset="1" stop-color="#4261E5"/>
              </linearGradient>
              <linearGradient
                id="paint10_linear_809_1589"
                x1="157"
                y1="104"
                x2="186"
                y2="104"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#4261E5"/>
                <stop offset="0.442708" stop-color="#DCE5FF"/>
                <stop offset="0.572917" stop-color="#DCE5FF"/>
                <stop offset="1" stop-color="#4261E5"/>
              </linearGradient>
            </defs>
          </template>
        </g>
      </g>
    `,
    width: 195,
    height: 112,
    dataRest: {
      dataType: 'data-type-4',
      nodeId: 'template-4',
      fontFamily,
      fontSize: 16,
      id: '',
      value: '',
      templateType: 'template-4',
      type: 0,
      types: [
        {
          value: 0,
          label: 'Горизонтальный',
          initialWidth: 112,
          initialHeight: 145,
        },
        {
          value: 1,
          label: 'Вертикальный',
          initialWidth: 195,
          initialHeight: 112,
        },
      ],
      color: {
        rgbaString: 'rgba(255, 255, 0, 1)',
        rgbaObject: {
          r: 255,
          g: 255,
          b: 0,
          a: 1,
        },
      },
      colors: [
        {
          value: 0,
          color: {
            rgbaString: 'rgba(255, 255, 0, 1)',
            rgbaObject: {
              r: 255,
              g: 255,
              b: 0,
              a: 1,
            },
          },
        },
      ],
      textFirstId: '',
      textFirstColor: {
        rgbaString: 'rgba(255, 255, 255, 1)',
        rgbaObject: {
          r: 255,
          g: 255,
          b: 255,
          a: 1,
        },
      },
      textFirstSize: 24,
      textFirstValue: '1234',
      textFirstPosition: 1,
      textFirstPositionList: [
        {
          label: 'Сверху',
          value: 1,
        },
        // {
        //   label: 'Снизу',
        //   value: 2,
        // },
        // {
        //   label: 'Слева',
        //   value: 3,
        // },
        // {
        //   label: 'Справа',
        //   value: 4,
        // },
      ],
      textSecondColor: {
        rgbaString: 'rgba(0, 0, 0, 1)',
        rgbaObject: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
      },
      textSecondSize: 24,
      textSecondValue: '4321',
      calculateScale(type, layout) {
        const { initialWidth, initialHeight } = this.types[type];
        const finalWidth = layout.width;
        const finalHeight = layout.height;
        const scaleX = finalWidth / initialWidth;
        const scaleY = finalHeight / initialHeight;
        return {
          stringResult: `scale(${scaleX} ${scaleY})`,
          scaleX,
          scaleY,
        };
      },
      getElementSize(type, layout) {
        const scaledSizes = this.calculateScale(type, layout);
        return {
          width: (layout.width / scaledSizes.scaleX),
          height: (layout.height / scaledSizes.scaleY),
        };
      },
      getTextStyles(layout) {
        return `writing-mode:vertical-rl;glyph-orientation-vertical:0; transform: rotate(180deg) translate(${layout.x}px ${layout.y}px)`;
      },
    },
  },
  'label-type-0': {
    template: `
      <g class="b-label-node">
        <!--Area-->
        <defs>
          <clipPath :id="'border-radius-' + tag.nodeId">
            <rect 
              x="0" 
              y="0" 
              :width="layout.width" 
              :height="layout.height" 
              fill="transparent" 
              :rx="tag.bordered && tag.borderSize / 2 || 3"
            />
          </clipPath>
        </defs>
        <!--Bg-->
        <rect
          x="0"
          y="0"
          :width="layout.width"
          :height="layout.height"
          :fill="tag.bgColor.rgbaString || 'transparent'"
          :clip-path="'url(#border-radius-' + tag.nodeId + ')'"
          :stroke="tag.bordered && tag.borderColor.rgbaString || 'transparent'" 
          :stroke-width="tag.bordered && tag.borderSize || '0'" 
          :stroke-dasharray="tag.bordered && tag.borderDashed ? '4' : '0'" 
          :rx="tag.bordered && tag.borderSize / 2 || 3" 
        />
        <foreignObject 
          :height="layout.height" 
          :width="layout.width"
        >
          <div
           class="b-data-node__label" 
           :style="{
             height: '100%', 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'center',
           }" 
          >
            <div 
             class="b-data-node__text-label" 
             :style="{
              width: layout.width + 'px',
              height: layout.height + 'px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              writingMode: tag.isVertical ? 'vertical-rl' : 'horizontal-tb',
              textOrientation: 'mixed', 
              transform: tag.isVertical ? 'rotate(180deg)' : 'rotate(0deg)',
              color: tag.textColor.rgbaString,
              fontSize: tag.fontSize ? tag.fontSize + 'px' : '12px',
              fontFamily: tag.fontFamily,
             }"
            >
              {{ tag.text }}
            </div>
          </div>
        </foreignObject>
      </g>
    `,
    width: 150,
    height: 30,
    dataRest: {
      dataType: 'label-type-0',
      nodeId: 'label-template-0',
      id: '',
      textTemplateType: 'template-0',
      text: 'Text',
      fontFamily,
      isVertical: false,
      bordered: true,
      borderType: 'solid',
      borderSize: 1,
      borderDashed: true,
      borderColor: {
        rgbaObject: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        rgbaString: 'rgba(0,0,0,1)',
      },
      bgColor: {
        rgbaObject: {
          r: 255,
          g: 255,
          b: 255,
          a: 1,
        },
        rgbaString: 'rgba(255,255,255,1)',
      },
      textColor: {
        rgbaObject: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        rgbaString: 'rgba(0,0,0,1)',
      },
      fontSize: 12,
    },
  },
};

export default {
  templates,
  fontFamily,
};
