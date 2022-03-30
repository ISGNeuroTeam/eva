export default function isMarkerInsidePolygon(marker, poly) {
  const polyPoints = poly.getLatLngs();
  const x = marker.getLatLng().lat;
  const y = marker.getLatLng().lng;

  let inside = false;
  let i = 0;
  let j = polyPoints.length - 1;
  // TODO: разобраться с j = i += 1
  // eslint-disable-next-line no-multi-assign
  for (; i < polyPoints.length; j = i += 1) {
    const xi = polyPoints[i].lat;
    const yi = polyPoints[i].lng;
    const xj = polyPoints[j].lat;
    const yj = polyPoints[j].lng;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
