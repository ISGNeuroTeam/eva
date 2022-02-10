export default function isMarkerInsidePolygon(marker, poly) {
  const polyPoints = poly.getLatLngs();
  const x = marker.getLatLng().lat,
    y = marker.getLatLng().lng;

  let inside = false;
  let i = 0,
    j = polyPoints.length - 1;
  for (; i < polyPoints.length; j = i++) {
    const xi = polyPoints[i].lat,
      yi = polyPoints[i].lng;
    const xj = polyPoints[j].lat,
      yj = polyPoints[j].lng;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
