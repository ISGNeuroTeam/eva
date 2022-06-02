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
    layerGroup: null,
    osmServer: null,
    mapTheme: 'default',
    wheelPxPerZoomLevel: 200,
    isLegendGenerated: false,
    startingPoint: [],
    mode: [],
    pipelineParameters: [],
  }

  constructor({
    mapRef,
    wheelPxPerZoomLevel,
    zoomSnap,
    zoom,
    maxZoom,
    center,
    layerGroup,
    library,
    mode,
    pipelineParameters,
  }) {
    this.options.wheelPxPerZoomLevel = wheelPxPerZoomLevel;
    this.options.layerGroup = layerGroup;
    this.options.library = library;
    this.options.mode = mode;
    this.options.pipelineParameters = pipelineParameters;
    this.map = L.map(mapRef, {
      wheelPxPerZoomLevel,
      zoomSnap,
      zoom,
      maxZoom,
      center,
      markerZoomAnimation: false,
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

  get layerGroup() {
    return this.options.layerGroup;
  }

  set layerGroup(val) {
    this.options.layerGroup = val;
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

  get mode() {
    return this.options.mode;
  }

  set mode(val) {
    this.options.mode = val;
  }

  get pipelineParameters() {
    return this.options.pipelineParameters;
  }

  set pipelineParameters(val) {
    this.options.pipelineParameters = val;
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

  addLine(element, lib, pipelineData) {
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

    const highlightFeature = this.highlightFeatureFunc({
      lib,
      pipelineData,
      route,
      lineTurf,
      element,
    });

    line
      .bindTooltip(tooltip)
      .on('mouseover', (e) => highlightFeature(e, line))
      .on('mouseout', resetHighlight);
    line.setTooltipContent(element.label);
    this.layerGroup[element.type].addLayer(line);
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
    const marker = L.marker([coord[0], coord[1]], {
      icon,
      zIndexOffset: -1000,
      riseOnHover: true,
    })
      .bindTooltip(element.label, {
        permanent: false,
        direction: 'top',
        className: 'leaftet-hover',
        interactive: true,
      });
    this.layerGroup[element.type].addLayer(marker);
  }

  drawMarkerSVG({ lib, element, callback }) {
    const icon = L.icon({
      iconUrl: `${window.location.origin}/svg/${lib.image}`,
      iconSize: [lib.width, lib.height],
    });

    const point = element.coordinates.split(':');
    const coord = point[1].split(',');
    this.startingPoint = [coord[0], coord[1]];
    const marker = L.marker([coord[0], coord[1]], {
      icon,
      riseOnHover: true,
    })
      .bindTooltip(element.label, {
        permanent: false,
        direction: 'top',
        className: 'leaftet-hover',
      })
      .on('click', () => {
        callback(element.ID);
      });
      // eslint-disable-next-line no-underscore-dangle
    this.layerGroup[element.type].addLayer(marker);
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

  addMarker({ element, lib, callback }) {
    const type = MapClass.getElementDrawType(lib);
    if (type === 'SVG') {
      this.drawMarkerSVG({ lib, element, callback });
    } else {
      this.drawMarkerHTML({ lib, element });
    }
  }

  drawObjects({ dataRest, pipelineDataDictionary, callback }) {
    dataRest.forEach((item) => {
      if (
        item?.type !== null
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
            this.addMarker({ element: item, lib, callback });
          }
          if (item.geometry_type?.toLowerCase() === 'line') {
            this.addLine(item, lib, pipelineDataDictionary[item.ID]);
          }
        }
      }
    });
  }

  highlightFeatureFunc({
    lib,
    pipelineData,
    route,
    lineTurf,
    element,
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
      if (this.mode[0] === 'Мониторинг') {
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
        let html = '<div style="text-align: left; background-color: #191919; color: white">';
        html += `<p>${pipelineInfo.label}</p>`;
        if (this.pipelineParameters.length > 0) {
          this.pipelineParameters.forEach((item) => {
            html += `<p>${item.type} ${pipelineInfo[item.type]}</p>`;
          });
        }
        html += '</div>';
        newDiv.innerHTML = html;
        line.setTooltipContent(newDiv);
      } else {
        line.setTooltipContent(element.label);
      }
    };
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

  removeLayerGroup(i) {
    this.layerGroup[i].remove();
  }

  addLayerGroup(i) {
    this.removeLayerGroup(i);
    this.layerGroup[i].addTo(this.map);
  }

  addGroup(group) {
    this.layerGroup[group] = L.layerGroup([]);
  }

  changeIndexOffset(group, zIndex) {
    this.layerGroup[group].eachLayer((layer) => {
      // eslint-disable-next-line no-underscore-dangle
      if (layer._icon) {
        layer.setZIndexOffset(zIndex);
      }
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
