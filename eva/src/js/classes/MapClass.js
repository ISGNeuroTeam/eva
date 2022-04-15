import L from 'leaflet';

class MapClass {
  constructor({
    mapRef,
    ZoomLevel,
    zoomSnap,
    zoom,
    maxZoom,
    center,
  }) {
    this.map = L.map(mapRef, {
      wheelPxPerZoomLevel: ZoomLevel,
      zoomSnap,
      zoom,
      maxZoom,
      center,
    });
  }

  get getMaps() {
    return this.map;
  }
}

export default MapClass;
