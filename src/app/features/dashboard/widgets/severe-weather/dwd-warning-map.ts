import { Component, computed, input, signal } from '@angular/core';
import { MAJOR_GERMAN_CITIES } from './dwd-places';

const MAP_WIDTH = 729;
const MAP_HEIGHT = 426;
const MAP_HALF_HEIGHT_KM = 45;
const KM_PER_DEGREE_LAT = 111.32;

@Component({
  selector: 'app-dwd-warning-map',
  templateUrl: './dwd-warning-map.html',
})
export class DwdWarningMap {
  readonly lat = input.required<number>();
  readonly lon = input.required<number>();
  readonly label = input<string>('');

  // Bounds are chosen so the rendered image preserves real-world proportions: at this
  // latitude, one degree of longitude covers noticeably less ground distance than one
  // degree of latitude, so the longitude half-span is widened by 1/cos(latitude) to
  // compensate - otherwise the map looks visibly stretched/skewed.
  protected readonly mapBounds = computed(() => {
    const lat = this.lat();
    const lon = this.lon();
    const halfHeightDeg = MAP_HALF_HEIGHT_KM / KM_PER_DEGREE_LAT;
    const halfWidthKm = MAP_HALF_HEIGHT_KM * (MAP_WIDTH / MAP_HEIGHT);
    const halfWidthDeg = halfWidthKm / (KM_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180));
    return {
      minLon: lon - halfWidthDeg,
      minLat: lat - halfHeightDeg,
      maxLon: lon + halfWidthDeg,
      maxLat: lat + halfHeightDeg,
    };
  });

  protected readonly mapUrl = computed(() => {
    const b = this.mapBounds();
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.1.1',
      request: 'GetMap',
      layers: 'Warngebiete_Bundeslaender,Warngebiete_Gemeinden,Warnungen_Gemeinden_vereinigt',
      styles: 'Bundeslaender_grau,Warngebiete_Grenzen,',
      bbox: [b.minLon, b.minLat, b.maxLon, b.maxLat].join(','),
      width: String(MAP_WIDTH),
      height: String(MAP_HEIGHT),
      srs: 'EPSG:4326',
      format: 'image/png',
    });
    return `https://maps.dwd.de/geoserver/dwd/ows?${params.toString()}`;
  });

  // The DWD WMS layer for place names only renders unlabeled dots, so city labels are
  // drawn ourselves as positioned HTML on top of the map image instead.
  protected readonly cityLabels = computed(() => {
    const b = this.mapBounds();
    return MAJOR_GERMAN_CITIES.filter(
      (city) =>
        city.lon > b.minLon && city.lon < b.maxLon && city.lat > b.minLat && city.lat < b.maxLat,
    ).map((city) => ({
      name: city.name,
      leftPercent: ((city.lon - b.minLon) / (b.maxLon - b.minLon)) * 100,
      topPercent: ((b.maxLat - city.lat) / (b.maxLat - b.minLat)) * 100,
    }));
  });

  protected readonly mapFailed = signal(false);
}
