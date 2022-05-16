import L from 'leaflet';
import 'leaflet.tilelayer.colorfilter';
import 'leaflet.markercluster';
import * as turf from '@turf/turf';
import * as utils from 'leaflet-geometryutil';

class MapClass {
  static resetHighlightFunc(lib) {
    return (e) => {
      const layer = e.target;
      layer.setStyle({
        color: lib.color,
        weight: lib.width,
      });
    };
  }

  static highlightFeatureFunc({
    lib,
    mode,
    pipelineData,
    route,
    lineTurf,
  }) {
    return (e, line) => {
      const layer = e.target;
      layer.bringToFront();
      layer.setStyle({
        weight: lib.width + 3,
        color: lib.color,
      });
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
      if (!pipelineData) return;
      const closest = (arr, num) => (
        arr.reduce((acc, val) => {
          if (Math.abs(val.pos - num) < Math.abs(acc)) {
            return val.pos - num;
          }
          return acc;
        }, Infinity) + num
      );
      if (mode[0] === 'Мониторинг') {
        const newLine = turf.lineSlice(
          route[0],
          [e.latlng.lat, e.latlng.lng],
          lineTurf,
        );
        const newLinePoly = L.polyline(newLine.geometry.coordinates);
        const distances = utils.accumulatedLengths(newLinePoly);
        const sum = distances[distances.length - 1];

        const closestData = closest(pipelineData, sum);

        const pipelineInfo = pipelineData.find((el) => el.pos === closestData);
        // div for tooltip
        const newDiv = document.createElement('div');
        newDiv.innerHTML = `<div style="text-align: left; background-color: #191919; color: white">
          <p>${pipelineInfo.label}</p>
          <p>P ${pipelineInfo.P}</p>
          <p>S ${pipelineInfo.S}</p>
          <p>L ${pipelineInfo.L}</p>
          </div>`;
        line.setTooltipContent(newDiv);
      }
    };
  }

  static getElementDrawType(lib) {
    if (lib.view_type === 'html') {
      return 'HTML';
    }
    return 'SVG';
  }

  cluster = null;

  options = {
    clusterDelimiter: ';',
    clusterTextCount: 4,
    clusterPosition: null,
    library: null,
    test: null,
    osmServer: null,
    mapTheme: 'default',
    wheelPxPerZoomLevel: 200,
    isLegendGenerated: false,
    startingPoint: [],
    layer: [],
  }

  constructor({
    mapRef,
    wheelPxPerZoomLevel,
    zoomSnap,
    zoom,
    maxZoom,
    center,
  }) {
    this.options.wheelPxPerZoomLevel = wheelPxPerZoomLevel;
    this.map = L.map(mapRef, {
      wheelPxPerZoomLevel,
      zoomSnap,
      zoom,
      maxZoom,
      center,
    });
  }

  get wheelPxPerZoomLevel() {
    return this.options.wheelPxPerZoomLevel;
  }

  set wheelPxPerZoomLevel(val) {
    this.options.wheelPxPerZoomLevel = val;
  }

  get isLegendGenerated() {
    return this.options.isLegendGenerated;
  }

  set isLegendGenerated(val) {
    this.options.isLegendGenerated = val;
  }

  get startingPoint() {
    return this.options.startingPoint;
  }

  set startingPoint(val) {
    this.options.startingPoint = val;
  }

  get zoom() {
    return this.map.getZoom();
  }

  get bounds() {
    return this.map.getBounds();
  }

  get center() {
    return this.map.getCenter();
  }

  get clusterDelimiter() {
    return this.options.clusterDelimiter;
  }

  set clusterDelimiter(val) {
    this.options.clusterDelimiter = val;
  }

  get clusterTextCount() {
    return this.options.clusterTextCount;
  }

  set clusterTextCount(val) {
    this.options.clusterTextCount = val;
  }

  get clusterPosition() {
    return this.options.clusterPosition;
  }

  set clusterPosition(val) {
    this.options.clusterPosition = val;
  }

  get library() {
    return this.options.library;
  }

  set library(val) {
    this.options.library = val;
  }

  get test() {
    return this.options.test;
  }

  set test(val) {
    this.options.test = val;
  }

  get osmServer() {
    return this.options.osmServer;
  }

  set osmServer(val) {
    this.options.osmServer = val;
  }

  get mapTheme() {
    return this.options.mapTheme;
  }

  set mapTheme(val) {
    this.options.mapTheme = val;
  }

  get layer() {
    return this.options.layer;
  }

  set layer(val) {
    this.options.layer = val;
  }

  setEvents(events) {
    events.forEach(({ event, callback }) => {
      this.map.on(event, callback);
    });
  }

  stopEvents(event) {
    this.map.off(event);
  }

  createMap() {
    let tileLayer;
    if (!this.osmServer) return;
    if (typeof this.osmServer === 'string') {
      if (this.mapTheme === 'black') {
        tileLayer = L.tileLayer.colorFilter(this.osmServer, {
          filter: ['grayscale:100%', 'invert:100%'],
        });
      } else {
        tileLayer = L.tileLayer.colorFilter(this.osmServer);
      }
    } else {
      if (!this.osmServer.tile) return;

      let temp = this.osmServer.tile;
      if (typeof this.osmServer.tile === 'string') {
        temp = [this.osmServer.tile];
      }
      if (this.mapTheme === 'black') {
        temp[1].filter = ['grayscale:100%', 'invert:100%'];
        tileLayer = L.tileLayer.colorFilter(...temp);
      } else {
        tileLayer = L.tileLayer(...temp);
      }
    }
    tileLayer.addTo(this.map);
  }

  createLegend(library) {
    let generatedListHTML = '';
    if (library?.objects) {
      Object.keys(library.objects).forEach((key) => {
        generatedListHTML += `<li>${library.objects[key].name}</li>`;
      });
      const legend = L.control({ position: 'bottomright' });

      legend.onAdd = function () {
        const img = L.DomUtil.create('div');
        img.innerHTML = `
              <div>
                <p>Легенда</p>
                <ul class="fa-ul">
                ${generatedListHTML}
                </ul>
              </div>`;
        img.style.width = '280px';
        img.style.maxHeight = '466px';
        img.style.background = 'black';
        return img;
      };

      legend.onAdd(this.map);
      this.isLegendGenerated = true;
    }
  }

  addTooltip(cluster, element, library) {
    const lib = library[element.type];
    const icon = L.divIcon({
      iconSize: [0, 0],
    });
    const point = element.coordinates.split(':');
    const coord = point[1].split(',');
    const marker = L.marker([coord[0], coord[1]], {
      icon,
    }).bindTooltip(element.label, {
      permanent: true,
      direction: 'bottom',
      offset: [0, lib.height / 2],
    });

    cluster.addLayer(marker);
    this.map.addLayer(cluster);
  }

  addLine(element, lib, mode, pipelineData) {
    const latlngs = [];
    element.coordinates.split(';').forEach((point) => {
      const p = point.split(':');
      latlngs[p[0] - 1] = p[1].split(',');
    });
    const line = L.polyline(latlngs, {
      color: lib.color,
      weight: lib.width,
      opacity: lib.opacity,
    });
    const tooltip = L.tooltip({
      permanent: false,
      direction: 'top',
      className: 'leaftet-hover',
      sticky: true,
    });

    const resetHighlight = MapClass.resetHighlightFunc(lib);

    const route = line.getLatLngs().map((el) => [el.lat, el.lng]);
    const lineTurf = turf.lineString(route);

    const highlightFeature = MapClass.highlightFeatureFunc({
      lib,
      mode,
      pipelineData,
      route,
      lineTurf,
    });

    // if (this.layer.includes(lib.name)) {
    line
      .addTo(this.map)
      .bindTooltip(tooltip)
      .on('mouseover', (e) => highlightFeature(e, line))
      .on('mouseout', resetHighlight);
    line.setTooltipContent(element.label);
    this.test[lib.name].push(line);
    // }
  }

  drawMarkerHTML({ lib, element }) {
    const {
      text_color: textColor = '#FFFFFF',
      background_color: color = '65, 62, 218',
      opacity = 0.6,
      border_radius: borderRadius = '2px',
      border = 'none',
      width,
      height,
    } = lib;
    const icon = L.divIcon({
      className: 'location-pin',
      riseOnHover: true,
      html: `<div class="leaflet-div-icon"
          style="
            background-color: ${color};
            opacity: ${opacity};
            mix-blend-mode: normal;
            border: ${border};
            border-radius: ${borderRadius}px;
            padding: 2px 6px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
        ">
          <span style="color:${textColor}">${element.label}<span>
        </div>`,
      iconSize: [width, height],
    });
    const point = element.coordinates.split(':');
    const coord = point[1].split(',');
    L.marker([coord[0], coord[1]], {
      icon,
      zIndexOffset: -1000,
      riseOnHover: true,
    })
      .addTo(this.map)
      .bindTooltip(element.label, {
        permanent: false,
        direction: 'top',
        className: 'leaftet-hover',
        interactive: true,
      });
  }

  drawMarkerSVG({ lib, element }) {
    const test = [10000, 9500, 9000, 8500, 8000, 7500, 7000, 6500, 6000, 5500, 5000, 4500];
    const icon = L.icon({
      iconUrl: `${window.location.origin}/svg/${lib.image}`,
      iconSize: [lib.width, lib.height],
    });

    const point = element.coordinates.split(':');
    const coord = point[1].split(',');
    this.startingPoint = [coord[0], coord[1]];
    // if (this.layer.includes(lib.name)) {
    const marker = L.marker([coord[0], coord[1]], {
      icon,
      zIndexOffset: test[this.layer.indexOf(lib.name)],
      riseOnHover: true,
    })
      // .addTo(this.map)
      .bindTooltip(element.label, {
        permanent: false,
        direction: 'top',
        className: 'leaftet-hover',
      });
      // eslint-disable-next-line no-underscore-dangle
      // L.DomUtil.addClass(marker._icon, 'className');
    // console.log(lib);
    this.test[lib.name].push(marker);
    // console.log(this.test[element.type]);
    // }
  }

  testss() {
    // const layerControl = L.control.layers().addTo(this.map);
    for (const i in this.test) {
      const group = L.layerGroup(this.test[i]).addTo(this.map);
      // group.addOverlay(group, `${i}`);
    }
  }

  clustering(dataRest) {
    this.cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        // eslint-disable-next-line no-underscore-dangle
        if (cluster._zoom > 10) {
          const html = `<div class='leaflet-tooltip'>${
            this.generateHtml(markers)
          }</div>`;
          return L.divIcon({
            iconSize: [0, 0],
            html,
          });
        }
        return L.divIcon({
          iconSize: [0, 0],
        });
      },
    });
    const sortDataRest = this.sortForTooltip(dataRest);
    for (let i = 0; i < sortDataRest.length - 1; i += 1) {
      this.addTooltip(this.cluster, sortDataRest[i], this.library.objects);
    }
  }

  sortForTooltip(dataRest) {
    const sortDataRest = [];
    this.clusterPosition?.forEach((position) => {
      dataRest.forEach((dr) => {
        if (position === dr.type) {
          sortDataRest.push(dr);
        }
      });
    });
    return sortDataRest;
  }

  generateHtml(markers) {
    // eslint-disable-next-line no-underscore-dangle
    let html = "<div class ='leaftet-flex'>";
    // eslint-disable-next-line no-underscore-dangle
    let count = 0;
    let i;
    for (
      i = 0;
      i < markers.length - 1 && count < this.clusterTextCount;
      i += 1
    ) {
      // eslint-disable-next-line no-underscore-dangle
      html = `${html}<div>${markers[i].getTooltip()._content}</div>`;
      html += `<div> ${this.clusterDelimiter} </div>`;
      count += 1;
    }
    // удаление лишенего дилителя
    html = html.substr(
      0,
      html.length - `<div> ${this.clusterDelimiter} </div>`.length,
    );
    // закрываем leaftet-flex
    html += '</div>';
    if (i !== markers.length - 1) {
      html += "<div class ='leaftet-flex'>...</div>";
    }
    return html;
  }

  generateClusterPositionItems() {
    if (this.library?.objects) {
      if (!this.clusterPosition) {
        // пустые значения
        Object.entries(this.library.objects).forEach((object) => {
          if (object[1].image) {
            if (this.clusterPosition === null) {
              this.clusterPosition = [Number(object[0])];
            } else {
              this.clusterPosition.push(Number(object[0]));
            }
          }
        });
      }
    }
  }

  addMarker(element, lib) {
    const type = MapClass.getElementDrawType(lib);
    if (type === 'SVG') {
      this.drawMarkerSVG({ lib, element });
    } else {
      this.drawMarkerHTML({ lib, element });
    }
  }

  drawObjects(dataRest, mode, pipelineDataDictionary) {
    dataRest.forEach((item) => {
      if (
        item?.type
          && this.library?.objects
          && this.library?.objects[item.type]
      ) {
        // choosing drawing type for each object
        const lib = this.library.objects[item.type];
        if (lib) {
          if (item.ID === '1') {
            const point = item.coordinates.split(':');
            const coord = point[1].split(',');

            this.startingPoint = [coord[0], coord[1]];
          }
          if (item.geometry_type?.toLowerCase() === 'point') {
            this.addMarker(item, lib);
          }
          if (item.geometry_type?.toLowerCase() === 'line') {
            this.addLine(item, lib, mode, pipelineDataDictionary[item.ID]);
          }
        }
      }
    });
  }

  addLayer(layer) {
    this.map.addLayer(L.tileLayer(...layer));
  }

  setView(center, zoomLevel) {
    this.map.setView(
      center,
      zoomLevel,
    );
  }

  resize() {
    // eslint-disable-next-line no-underscore-dangle
    this.map._onResize();
  }

  clearMap() {
    this.map.eachLayer((layer) => {
      this.map.removeLayer(layer);
    });
  }

  clearCluster(cluster) {
    if (this.map?.hasLayer(cluster)) {
      this.map.removeLayer(cluster);
    }
  }

  remove() {
    this.map.remove();
  }

  testRemov(layer) {
    layer.forEach((i) => {
      this.map.removeLayer(i);
    });
  }

  testAdd(layer) {
    layer.forEach((i) => {
      this.map.addLayer(i);
    });
  }

  removeLayer(layer) {
    this.map.removeLayer(layer);
  }

  addClass(cursorCssClass) {
    // eslint-disable-next-line no-underscore-dangle
    L.DomUtil.addClass(this.map._container, cursorCssClass);
  }

  removeClass(cursorCssClass) {
    // eslint-disable-next-line no-underscore-dangle
    L.DomUtil.removeClass(this.map._container, cursorCssClass);
  }

  scrollWheelZoom() {
    // eslint-disable-next-line no-underscore-dangle
    this.map.scrollWheelZoom._enabled = false;
  }
}

export default MapClass;
